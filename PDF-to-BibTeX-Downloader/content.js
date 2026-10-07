(() => {
  let handled = false;

  function isBibtex() {
    const pre = document.querySelector("pre");
    const text = pre?.innerText || document.body?.innerText || "";
    return /^@(?:article|inproceedings|book|incollection|misc|phdthesis|mastersthesis|techreport|proceedings)\s*\{/im.test(text)
      || (/bibtex/i.test(document.title) && text.length > 30);
  }

  function getBibtex() {
    const els = [
      ...document.querySelectorAll("pre"),
      ...document.querySelectorAll("textarea"),
      ...document.querySelectorAll("code")
    ];
    for (const el of els) {
      const t = (el.value ?? el.innerText ?? "").trim();
      if (/^@(?:article|inproceedings|book|incollection|misc|phdthesis|mastersthesis|techreport|proceedings)\s*\{/i.test(t))
        return t;
    }
    return "";
  }

  async function copy(t) {
    try {
      await navigator.clipboard.writeText(t);
      return true;
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = t;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (_) {}
      ta.remove();
      return ok;
    }
  }

  function toast(msg) {
    const old = document.getElementById("__scholar_nav_toast");
    if (old) old.remove();
    const x = document.createElement("div");
    x.id = "__scholar_nav_toast";
    x.textContent = msg;
    Object.assign(x.style, {
      position:"fixed", top:"12px", right:"390px", zIndex:"2147483647",
      background:"#111827", color:"#fff", padding:"10px 15px",
      borderRadius:"8px", font:"14px Arial,sans-serif",
      boxShadow:"0 3px 12px rgba(0,0,0,.3)"
    });
    document.body.appendChild(x);
    setTimeout(()=>x.remove(),2500);
  }

  async function check() {
    if (handled || !isBibtex()) return;
    const bib = getBibtex();
    if (!bib) return;

    handled = true;
    const ok = await copy(bib);

    if (ok) {
      toast("✓ BibTeX copied");
      chrome.runtime.sendMessage({type:"BIBTEX_COPIED", bibtex: bib});
    } else {
      handled = false;
      toast("Copy failed — copy BibTeX manually");
    }
  }

  // The BibTeX page is normally a new tab. Tell the background worker which tab it is.
  if (isBibtex()) {
    chrome.runtime.sendMessage({type:"REGISTER_BIBTEX", tabId: chrome.runtime?.id ? undefined : undefined});
  }

  const observer = new MutationObserver(check);
  observer.observe(document.documentElement, {childList:true, subtree:true});

  setTimeout(check, 300);
  setTimeout(check, 1000);
  setTimeout(check, 2500);
})();
(() => {
  if (location.hostname !== "scholar.google.com") return;
  if (document.getElementById("gsbn-panel")) return;

  const panel = document.createElement("div");
  panel.id = "gsbn-panel";
  panel.innerHTML = `
    <button id="gsbn-min" title="Hide">×</button>
    <div id="gsbn-title">📚 Scholar Navigator</div>
    <div id="gsbn-stats">
      <div class="gsbn-stat"><span>TOTAL</span><b id="gsbn-total">0</b></div>
      <div class="gsbn-stat"><span>PROCESSED</span><b id="gsbn-processed">0</b></div>
      <div class="gsbn-stat"><span>REMAINING</span><b id="gsbn-remaining">0</b></div>
    </div>
    <div id="gsbn-label">CURRENT PDF</div>
    <div id="gsbn-current">No PDFs loaded.</div>
    <button id="gsbn-next">NEXT → OPEN SCHOLAR</button>
    <button id="gsbn-download" disabled>⬇ DOWNLOAD SAVED BIBTEX (.BIB)</button>
    <button id="gsbn-clear">Clear saved BibTeX</button>
    <div id="gsbn-status"></div>
  `;
  document.body.appendChild(panel);

  const q = id => document.getElementById(id);

  async function refresh() {
    const s = await chrome.runtime.sendMessage({type:"GET_STATE"});
    q("gsbn-total").textContent = s.total;
    q("gsbn-processed").textContent = s.processed;
    q("gsbn-remaining").textContent = s.remaining;
    q("gsbn-current").textContent =
      s.currentTitle || (s.total ? "All PDFs processed." : "Load PDFs using the extension icon.");

    q("gsbn-next").disabled = !s.total || s.remaining === 0;
    q("gsbn-next").textContent =
      s.total && s.remaining
        ? `NEXT → OPEN SCHOLAR (${s.currentIndex + 1}/${s.total})`
        : (s.total ? "✓ COMPLETED" : "NEXT → OPEN SCHOLAR");

    q("gsbn-download").disabled = s.bibCount === 0;
    q("gsbn-download").textContent =
      s.bibCount
        ? `⬇ DOWNLOAD SAVED BIBTEX (${s.bibCount})`
        : "⬇ DOWNLOAD SAVED BIBTEX (.BIB)";
  }

  q("gsbn-next").onclick = async () => {
    q("gsbn-next").disabled = true;
    q("gsbn-status").textContent = "Opening next paper...";
    const r = await chrome.runtime.sendMessage({type:"NEXT"});
    if (!r.done) q("gsbn-status").textContent = "Click Cite → BibTeX manually.";
    await refresh();
  };

  q("gsbn-download").onclick = async () => {
    q("gsbn-status").textContent = "Preparing .bib file...";
    const r = await chrome.runtime.sendMessage({type:"DOWNLOAD_BIB"});
    q("gsbn-status").textContent = r.ok
      ? `✓ Downloaded ${r.count} BibTeX entr${r.count === 1 ? "y" : "ies"}.`
      : r.message;
    await refresh();
  };

  q("gsbn-clear").onclick = async () => {
    if (!confirm("Clear all saved BibTeX entries?")) return;
    await chrome.runtime.sendMessage({type:"CLEAR_BIB"});
    q("gsbn-status").textContent = "Saved BibTeX cleared.";
    await refresh();
  };

  q("gsbn-min").onclick = () => {
    panel.style.display = "none";
    const b = document.createElement("button");
    b.id = "gsbn-show";
    b.textContent = "📚 Scholar Navigator";
    Object.assign(b.style, {
      position:"fixed",top:"14px",right:"14px",zIndex:"2147483647",
      padding:"9px 12px",border:"0",borderRadius:"8px",
      background:"#111827",color:"#fff",cursor:"pointer"
    });
    b.onclick = () => { panel.style.display="block"; b.remove(); };
    document.body.appendChild(b);
  };

  refresh();
  setInterval(refresh, 1000);
})();
