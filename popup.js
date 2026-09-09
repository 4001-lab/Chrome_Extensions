const $=id=>document.getElementById(id);
async function send(x){return chrome.runtime.sendMessage(x)}
async function refresh(){
 const s=await send({type:"GET_STATE"});
 $("total").textContent=s.total;$("processed").textContent=s.processed;$("remaining").textContent=s.remaining;
 $("current").textContent=s.currentTitle|| (s.total?"All PDFs processed.":"No PDFs loaded.");
 $("bibcount").textContent=`Saved BibTeX entries: ${s.bibCount}`;
 $("download").disabled=!s.bibCount;
}
$("files").onchange=async e=>{
 const titles=[...e.target.files].filter(f=>f.type==="application/pdf"||/\.pdf$/i.test(f.name)).map(f=>f.name);
 await send({type:"SET_TITLES",titles});$("status").textContent=`Loaded ${titles.length} PDF filename(s).`;refresh();
};
$("download").onclick=async()=>{
 const r=await send({type:"DOWNLOAD_BIB"});
 $("status").textContent=r.ok?`Downloaded ${r.count} BibTeX entr${r.count===1?"y":"ies"}.`:r.message;
};
$("reset").onclick=async()=>{
 await send({type:"SET_TITLES",titles:[]});
 $("files").value="";$("status").textContent="List and saved BibTeX reset.";refresh();
};
refresh();