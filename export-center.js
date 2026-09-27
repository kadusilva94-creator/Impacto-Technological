/* Ready-file sharing keeps the user activation required by iOS/Android. */
const ExportCenter=(()=>{
  let busy=false,controller=null,file=null,url=null,lastFocus=null,sharing=false;
  const panel=document.createElement('div');panel.id='exportModal';panel.className='hidden';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','exportTitle');
  panel.innerHTML=`<div class="export-sheet"><div class="export-icon" aria-hidden="true">↗</div><h2 id="exportTitle">Preparando arquivo</h2><p id="exportStatus" role="status" aria-live="polite"></p><progress id="exportProgress" max="100" value="0" aria-label="Progresso da exportação"></progress><div id="exportReady" class="hidden"><p id="exportName"></p><p id="exportSize"></p><button id="exportShare" class="btn share-btn">Compartilhar • WhatsApp</button><p id="exportShareHint" class="hint"></p><div class="grid2"><a id="exportPreview" class="btn linha" target="_blank" rel="noopener">Visualizar PDF</a><a id="exportDownload" class="btn linha" download>Baixar arquivo</a></div></div><button id="exportClose" class="btn linha">Cancelar geração</button></div>`;document.body.append(panel);
  const el=id=>document.getElementById(id);
  function state(n,t){el('exportProgress').value=n;el('exportStatus').textContent=t;}
  function open(){lastFocus=document.activeElement;panel.classList.remove('hidden');document.body.classList.add('export-open');el('exportClose').focus();}
  function close(){if(sharing)return;controller?.abort();panel.classList.add('hidden');document.body.classList.remove('export-open');lastFocus?.focus();}
  el('exportClose').onclick=close;
  panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){const list=[...panel.querySelectorAll('button,a[href]')].filter(x=>!x.disabled&&x.getClientRects().length);const a=list[0],b=list.at(-1);if(e.shiftKey&&document.activeElement===a){e.preventDefault();b.focus();}else if(!e.shiftKey&&document.activeElement===b){e.preventDefault();a.focus();}}});
  function ready(blob,name){
    if(!(blob instanceof Blob)||!blob.size)throw Error('O arquivo gerado está vazio.');
    if(url)URL.revokeObjectURL(url);file=new File([blob],name,{type:blob.type||'application/octet-stream',lastModified:Date.now()});url=URL.createObjectURL(file);
    el('exportTitle').textContent='Arquivo pronto';state(100,'Escolha como deseja usar o arquivo.');el('exportProgress').classList.add('hidden');el('exportReady').classList.remove('hidden');el('exportName').textContent=name;el('exportSize').textContent=(file.size/1024/1024<1?(file.size/1024).toFixed(0)+' KB':(file.size/1024/1024).toFixed(1)+' MB');el('exportDownload').href=url;el('exportDownload').download=name;el('exportPreview').href=url;el('exportPreview').classList.toggle('hidden',file.type!=='application/pdf');
    let can=false;try{can=!!(navigator.share&&navigator.canShare?.({files:[file]}));}catch(e){}
    el('exportShare').disabled=!can;el('exportShareHint').textContent=can?'Toque em Compartilhar e escolha o WhatsApp no menu do aparelho.':'Este navegador não oferece compartilhamento deste arquivo. Baixe e, no WhatsApp, use Anexar → Documento. No iPhone, também é possível compartilhar pela visualização do PDF.';
    el('exportClose').textContent='Fechar';el('exportClose').disabled=false;panel.setAttribute('aria-busy','false');el(can?'exportShare':'exportDownload').focus();
  }
  el('exportShare').onclick=async()=>{
    if(!file||sharing)return;sharing=true;el('exportShare').disabled=true;el('exportClose').disabled=true;
    try{
      // Do not await generation, timers or file reads before this invocation.
      await navigator.share({files:[file],title:file.name});
      el('exportStatus').textContent='Arquivo entregue ao menu de compartilhamento.';
    }catch(e){el('exportStatus').textContent=e.name==='AbortError'?'Compartilhamento cancelado. O arquivo continua disponível.':'Não foi possível compartilhar aqui. Você pode tentar novamente ou baixar o arquivo e anexá-lo no WhatsApp.';}
    finally{sharing=false;el('exportShare').disabled=false;el('exportClose').disabled=false;}
  };
  async function run(name,job){
    if(busy){toast('Aguarde a exportação em andamento.');return;}
    busy=true;controller=new AbortController();file=null;el('exportReady').classList.add('hidden');el('exportProgress').classList.remove('hidden');el('exportTitle').textContent='Gerando '+name;el('exportClose').textContent='Cancelar geração';panel.setAttribute('aria-busy','true');state(0,'Preparando os dados…');open();
    try{await new Promise(r=>setTimeout(r,30));const result=await job(state,controller.signal);if(controller.signal.aborted)return;ready(result.blob,result.name);}
    catch(e){if(e.name!=='AbortError'){console.error(e);el('exportTitle').textContent='Não foi possível gerar';state(0,e.message||'Tente novamente.');el('exportProgress').classList.add('hidden');el('exportClose').textContent='Fechar';panel.setAttribute('aria-busy','false');}}
    finally{busy=false;}
  }
  function present(blob,name){if(busy)return;open();ready(blob,name);}
  return{run,present,get busy(){return busy;}};
})();
function exportSnapshot(){
  return {meta:structuredClone(meta),areas:[...areas],itens:structuredClone(itens),fotos:fotos.map(x=>({...x})),croquis:croquis.map(x=>({...x,formas:structuredClone(x.formas||[]),cotas:[...(x.cotas||[])]})),normas:NORMAS,taxas:TAXAS_PADRAO,logo:document.querySelector('header .logos img').src};
}
const exportDate=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const exportName=(d,ext)=>`Levantamento_${limpaNome(d.meta.planta||d.meta.cliente)}_${exportDate()}.${ext}`;
const exportOptions=()=>({quality:document.getElementById('exportQuality').value});
async function exportBackup(d,signal,progress=()=>{}){
  const out={versao:3,meta:d.meta,areas:d.areas,itens:d.itens,fotos:[],croquis:[]};let i=0,total=d.fotos.length+d.croquis.length;
  for(const kind of ['fotos','croquis'])for(const a of d[kind]){
    if(signal?.aborted)throw new DOMException('Cancelado','AbortError');
    const {blob,fundoBlob,...rest}=a;out[kind].push({...rest,dataUrl:await b64(blob),...(kind==='croquis'?{fundoDataUrl:fundoBlob?await b64(fundoBlob):null}:{})});progress(++i/Math.max(1,total));await new Promise(r=>setTimeout(r,0));
  }
  return new Blob([JSON.stringify(out)],{type:'application/json'});
}
function snapshotCsv(d){
  const cell=v=>'"'+String(v??'').replace(/^(\s*[=+@-])/,"'$1").replaceAll('"','""')+'"';
  const rows=[['Ref.',...COLS.map(x=>x[0]),'Fotos','Croquis','Cotas','Custo estimado (R$)','Preço unitário (R$)','Preço total (R$)']];d.itens.forEach((e,i)=>rows.push([String(i+1).padStart(3,'0'),...COLS.map(x=>valor(e,x[1])),d.fotos.filter(f=>f.itemId===e.id).length,d.croquis.filter(c=>c.itemId===e.id).length,d.croquis.filter(c=>c.itemId===e.id).flatMap(c=>c.cotas||[]).join(' | '),...(e.norma==='Fabricação'?['cost','u','total'].map(k=>ImpactoPDF.budget(e,d.meta,d.taxas)[k].toFixed(2).replace('.',',')):['','',''])]));return new Blob(['\ufeff'+rows.map(r=>r.map(cell).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'});
}
async function exportZip(d,options,progress,signal){
  if(!window.fflate)throw Error('O componente de ZIP não foi carregado. Atualize o aplicativo conectado à internet.');
  const files={},enc=new TextEncoder();
  const pdf=await ImpactoPDF.generate(d,options,(n,t)=>progress(n*.55,t),signal);files['01_Relatorio.pdf']=[new Uint8Array(await pdf.arrayBuffer()),{level:0}];
  files['02_Levantamento.csv']=new Uint8Array(await snapshotCsv(d).arrayBuffer());
  progress(57,'Preparando backup editável');const backup=await exportBackup(d,signal,n=>progress(57+n*17,'Preparando backup editável'));files['Backup/Levantamento.json']=new Uint8Array(await backup.arrayBuffer());
  const areasExport=[...new Set(d.itens.map(e=>e.area||'Sem area'))];
  for(let i=0;i<d.itens.length;i++){
    const e=d.itens[i],a=e.area||'Sem area',folder=`Anexos/${String(areasExport.indexOf(a)+1).padStart(2,'0')}_${limpaNome(a).slice(0,32)}/${String(i+1).padStart(3,'0')}_${limpaNome(e.nome).slice(0,40)}`;
    for(const [kind,label] of [['fotos','Foto'],['croquis','Croqui']]){const list=d[kind].filter(x=>x.itemId===e.id).sort((a,b)=>a.ts-b.ts);for(let j=0;j<list.length;j++){if(signal.aborted)throw new DOMException('Cancelado','AbortError');const f=list[j],ext=f.blob.type==='image/png'?'png':f.blob.type==='image/webp'?'webp':'jpg';files[`${folder}/${label}_${String(j+1).padStart(2,'0')}.${ext}`]=[new Uint8Array(await f.blob.arrayBuffer()),{level:0}];}}
    progress(75+(i+1)/Math.max(1,d.itens.length)*15,'Organizando anexos '+(i+1)+' de '+d.itens.length);await new Promise(r=>setTimeout(r,0));
  }
  files['LEIA-ME.txt']=enc.encode('LEVANTAMENTO DE CAMPO - IMPACTO\n\n01_Relatorio.pdf: apresentação com fichas, croquis e fotografias.\n02_Levantamento.csv: planilha de dados. Abra com separador ponto e vírgula e codificação UTF-8.\nAnexos/: fotos e croquis originais organizados por área e item.\nBackup/Levantamento.json: restauração completa no aplicativo, incluindo traços e fotos de fundo.\n\nEste pacote contém todos os itens do levantamento; filtros da tela não limitam a exportação.\nAs estimativas de fabricação presentes nos dados também estão incluídas.\nO registro não substitui análise de risco, projeto executivo ou laudo de conformidade.\n');
  progress(93,'Compactando pacote');
  const zipBytes=await new Promise((ok,err)=>{let done=false,cancel=()=>{},terminate=()=>{};const finish=(e,b)=>{if(done)return;done=true;signal.removeEventListener('abort',cancel);e?err(e):ok(b);};terminate=fflate.zip(files,{level:6},finish);cancel=()=>{terminate();finish(new DOMException('Cancelado','AbortError'));};signal.addEventListener('abort',cancel,{once:true});if(signal.aborted)cancel();});
  return new Blob([zipBytes],{type:'application/zip'});
}
function sortedSnapshot(){const d=exportSnapshot();d.itens.sort((a,b)=>(a.area||'').localeCompare(b.area||'','pt-BR')||(a.nome||'').localeCompare(b.nome||'','pt-BR'));return d;}
$('#btnPdf').onclick=()=>{if(!checa())return;const d=sortedSnapshot(),op=exportOptions();ExportCenter.run('PDF',async(p,s)=>({blob:await ImpactoPDF.generate(d,op,p,s),name:exportName(d,'pdf')}));};
$('#btnZip').onclick=()=>{if(!checa())return;const d=sortedSnapshot(),op=exportOptions();ExportCenter.run('ZIP completo',async(p,s)=>({blob:await exportZip(d,op,p,s),name:exportName(d,'zip')}));};
$('#btnJson').onclick=()=>{const d=sortedSnapshot();ExportCenter.run('backup',async(p,s)=>({blob:await exportBackup(d,s,n=>p(n*100,'Preparando backup')),name:exportName(d,'json')}));};
$('#btnCsv').onclick=()=>{if(!checa())return;const d=sortedSnapshot();ExportCenter.present(snapshotCsv(d),exportName(d,'csv'));};
$('#btnRelatorio').onclick=()=>{if(!checa())return;ExportCenter.run('HTML',async()=>({blob:new Blob([await montarRelatorio(false)],{type:'text/html;charset=utf-8'}),name:exportName(exportSnapshot(),'html')}));};
baixar=async(blob,nome)=>ExportCenter.present(blob,nome);
