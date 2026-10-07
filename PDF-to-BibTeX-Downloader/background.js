const state = {
  titles: [],
  bibtexEntries: [],
  currentIndex: 0,
  scholarTabId: null,
  bibtexTabId: null
};

async function load() {
  const s = await chrome.storage.local.get(Object.keys(state));
  Object.assign(state, s);
  if (!Array.isArray(state.titles)) state.titles = [];
  if (!Array.isArray(state.bibtexEntries)) state.bibtexEntries = [];
  if (!Number.isInteger(state.currentIndex)) state.currentIndex = 0;
}

async function save() {
  await chrome.storage.local.set(state);
}

function cleanTitle(s) {
  return s.replace(/\.pdf$/i, "").replace(/_/g, " ").trim();
}

function safeFilename(s) {
  return cleanTitle(s)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 150) || "paper";
}

async function closeTab(id) {
  if (id == null) return;
  try { await chrome.tabs.remove(id); } catch (_) {}
}

async function next() {
  await load();

  if (!state.titles.length || state.currentIndex >= state.titles.length)
    return {done: true};

  await closeTab(state.bibtexTabId);
  await closeTab(state.scholarTabId);

  state.bibtexTabId = null;
  state.scholarTabId = null;

  const title = cleanTitle(state.titles[state.currentIndex]);
  const url = "https://scholar.google.com/scholar?q=" + encodeURIComponent(title);
  const tab = await chrome.tabs.create({url, active: true});

  state.scholarTabId = tab.id;
  await save();

  return {
    done: false,
    index: state.currentIndex,
    total: state.titles.length,
    title
  };
}

function makeBibFile() {
  // Saved entries are separated by a blank line.
  return state.bibtexEntries.join("\n\n") + (state.bibtexEntries.length ? "\n" : "");
}

async function downloadBib() {
  await load();
  if (!state.bibtexEntries.length) return {ok:false, message:"No BibTeX entries saved."};

  const content = makeBibFile();
  const filename = "google_scholar_bibtex.bib";

  // data: URL avoids exposing data outside the extension.
  const url = "data:text/plain;charset=utf-8," + encodeURIComponent(content);

  const id = await chrome.downloads.download({
    url,
    filename,
    saveAs: true,
    conflictAction: "uniquify"
  });

  return {ok:true, id, filename, count:state.bibtexEntries.length};
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    await load();

    if (msg.type === "SET_TITLES") {
      await closeTab(state.bibtexTabId);
      await closeTab(state.scholarTabId);

      state.titles = msg.titles || [];
      state.bibtexEntries = [];
      state.currentIndex = 0;
      state.scholarTabId = null;
      state.bibtexTabId = null;
      await save();

      sendResponse({ok:true});
      return;
    }

    if (msg.type === "GET_STATE") {
      sendResponse({
        titles: state.titles,
        currentIndex: state.currentIndex,
        total: state.titles.length,
        processed: state.currentIndex,
        remaining: Math.max(0, state.titles.length - state.currentIndex),
        currentTitle: state.currentIndex < state.titles.length
          ? cleanTitle(state.titles[state.currentIndex]) : "",
        bibCount: state.bibtexEntries.length
      });
      return;
    }

    if (msg.type === "NEXT") {
      sendResponse(await next());
      return;
    }

    if (msg.type === "REGISTER_BIBTEX") {
      state.bibtexTabId = sender.tab?.id ?? null;
      await save();
      sendResponse({ok:true});
      return;
    }

    if (msg.type === "BIBTEX_COPIED") {
      // Save the actual BibTeX instead of only copying it.
      if (msg.bibtex && msg.bibtex.trim()) {
        state.bibtexEntries.push(msg.bibtex.trim());
      }

      if (state.currentIndex < state.titles.length) {
        state.currentIndex++;
      }

      const scholar = state.scholarTabId;
      const bib = state.bibtexTabId;

      state.scholarTabId = null;
      state.bibtexTabId = null;
      await save();

      await closeTab(bib);
      await closeTab(scholar);

      sendResponse({
        ok:true,
        processed:state.currentIndex,
        remaining:Math.max(0, state.titles.length - state.currentIndex),
        bibCount:state.bibtexEntries.length
      });
      return;
    }

    if (msg.type === "DOWNLOAD_BIB") {
      sendResponse(await downloadBib());
      return;
    }

    if (msg.type === "CLEAR_BIB") {
      state.bibtexEntries = [];
      await save();
      sendResponse({ok:true});
      return;
    }
  })();

  return true;
});

chrome.tabs.onRemoved.addListener(async (id) => {
  await load();
  if (id === state.scholarTabId) state.scholarTabId = null;
  if (id === state.bibtexTabId) state.bibtexTabId = null;
  await save();
});

load();