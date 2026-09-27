/* Impacto Premium 4.1. Local, paginated PDF; no print dialog or remote service. */
window.ImpactoPDF = (() => {
  const ink=[22,43,58], muted=[83,102,119], line=[221,229,235], gold=[242,183,5];
  let fontPromise;
  const check=signal=>{if(signal?.aborted)throw new DOMException('Geração cancelada','AbortError');};
  const tick=()=>new Promise(r=>setTimeout(r,0));
  async function fonts(){
    if(window.IMPACTO_FONTS)return window.IMPACTO_FONTS;
    if(!fontPromise)fontPromise=Promise.all(['DejaVuSans.ttf','DejaVuSans-Bold.ttf'].map(async n=>{
      const r=await fetch(n);if(!r.ok)throw Error('Fonte do PDF indisponível. Abra o app conectado à internet para concluir a atualização.');
      const a=new Uint8Array(await r.arrayBuffer());let s='';for(let i=0;i<a.length;i+=8192)s+=String.fromCharCode(...a.subarray(i,i+8192));return btoa(s);
    })).catch(e=>{fontPromise=null;throw e;});
    return fontPromise;
  }
  function loadImage(source){return new Promise((ok,err)=>{const img=new Image();img.onload=()=>ok(img);img.onerror=()=>err(Error('Não foi possível ler uma imagem do levantamento.'));img.src=source;});}
  async function jpeg(blob,max,quality){
    const u=URL.createObjectURL(blob);try{const img=await loadImage(u),k=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*k));c.height=Math.max(1,Math.round(img.height*k));const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);const data=c.toDataURL('image/jpeg',quality);c.width=c.height=1;return {data,w:img.width,h:img.height};}finally{URL.revokeObjectURL(u);}
  }
  const clean=v=>String(v??'').normalize('NFC').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'');
  const value=v=>Array.isArray(v)?v.join(' • '):clean(v);
  const date=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||'')?v.split('-').reverse().join('/'):(v||'Não informada');
  const money=n=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n);
  const num=v=>{let s=String(v??'').trim();if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');const n=Number(s);return Number.isFinite(n)?Math.max(0,n):0;};
  function budget(e,meta,defaults){let mo=0,h=0;for(const [a,b] of Object.entries({hProjeto:'tProjeto',hCorte:'tCorte',hCaldeiraria:'tCaldeiraria',hUsinagem:'tUsinagem',hMontagem:'tMontagem'})){h+=num(e[a]);mo+=num(e[a])*num(meta[b]!==''&&meta[b]!=null?meta[b]:defaults[b]);}const ins=num(e.custoMat)+num(e.custoComp)+num(e.custoTerc),cost=mo+ins,u=cost*num(meta.markup!==''&&meta.markup!=null?meta.markup:defaults.markup),q=Math.max(1,Math.floor(num(e.qtd)));return{h,mo,ins,cost,u,q,total:u*q};}
  async function generate(data,options={},progress=()=>{},signal){
    if(!window.jspdf?.jsPDF)throw Error('O componente de PDF não foi carregado. Atualize o aplicativo conectado à internet.');
    check(signal);progress(3,'Preparando fontes e páginas');const ff=await fonts();check(signal);
    const doc=new jspdf.jsPDF({unit:'mm',format:'a4',compress:true,putOnlyUsedFonts:true});
    doc.addFileToVFS('Regular.ttf',ff[0]);doc.addFont('Regular.ttf','Field','normal');doc.addFileToVFS('Bold.ttf',ff[1]);doc.addFont('Bold.ttf','Field','bold');doc.setFont('Field');
    const meta=data.meta,items=[...data.itens].sort((a,b)=>(a.area||'').localeCompare(b.area||'','pt-BR')||(a.nome||'').localeCompare(b.nome||'','pt-BR'));
    const names=[...new Set(items.map(e=>e.area||'Sem área'))],docId='LEV-'+(meta.data||new Date().toISOString().slice(0,10)).replaceAll('-','');
    doc.setProperties({title:'Levantamento de campo - '+(meta.planta||meta.cliente||'Impacto'),subject:'Registro técnico de campo',author:meta.responsavel||'Impacto',creator:'Impacto Premium 4.1'});
    let y=24,section='',page=1;
    const font=(size=10,bold=false,color=ink)=>{doc.setFont('Field',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(...color);};
    function newPage(title=section){check(signal);doc.addPage();page++;section=title;y=27;font(8,true,muted);doc.text('IMPACTO  /  LEVANTAMENTO DE CAMPO',14,13);font(8,false,muted);doc.text(docId,196,13,{align:'right'});doc.setDrawColor(...line);doc.line(14,17,196,17);if(title){font(8,false,muted);const t=doc.splitTextToSize(clean(title),182);doc.text(t.slice(0,2),14,22);y=23+t.slice(0,2).length*4;}}
    function space(h){if(y+h>277)newPage();}
    function para(txt,{size=10,bold=false,color=ink,x=14,width=182,gap=3}={}){
      font(size,bold,color);const lines=doc.splitTextToSize(clean(txt)||'—',width),lh=size*.3528*1.45;
      for(const l of lines){if(y+lh>277){newPage();font(size,bold,color);}doc.text(l,x,y+lh*.78);y+=lh;}y+=gap;
    }
    function title(t){space(18);y+=3;doc.setFillColor(...gold);doc.rect(14,y,2,6,'F');font(13,true);doc.text(clean(t),19,y+5);y+=12;}
    function field(label,v){if(v===undefined||v===null||v===''||(Array.isArray(v)&&!v.length))return;space(15);font(8,true,muted);doc.text(clean(label),14,y+3);y+=6;para(value(v),{size:10,gap:4});doc.setDrawColor(...line);doc.line(14,y-1,196,y-1);y+=2;}
    function table(headers,rows,widths){
      const drawHeader=()=>{font(8,true);const ls=headers.map((h,i)=>doc.splitTextToSize(clean(h),widths[i]-5)),height=Math.max(...ls.map(l=>l.length))*4+6;space(height);doc.setFillColor(...ink);doc.rect(14,y,182,height,'F');let x=14;font(8,true,[255,255,255]);ls.forEach((l,i)=>{doc.text(l,x+2.5,y+4.5);x+=widths[i];});y+=height;};
      drawHeader();
      rows.forEach((row,index)=>{font(9);const cells=row.map((v,i)=>doc.splitTextToSize(clean(v),widths[i]-5));let at=0,total=Math.max(...cells.map(l=>l.length));while(at<total){let fit=Math.floor((277-y-5)/4.5);if(fit<1){newPage();drawHeader();fit=Math.floor((277-y-5)/4.5);}const count=Math.min(fit,total-at),h=count*4.5+5;doc.setFillColor(...(index%2?[246,248,250]:[255,255,255]));doc.rect(14,y,182,h,'F');font(9);let x=14;cells.forEach((ls,i)=>{const chunk=ls.slice(at,at+count);if(chunk.length)doc.text(chunk,x+2.5,y+4.8);x+=widths[i];});y+=h;doc.setDrawColor(...line);doc.line(14,y,196,y);at+=count;}});y+=5;
    }
    // Cover uses the original brand asset and real metadata only.
    doc.setFillColor(...ink);doc.rect(0,0,210,8,'F');doc.setFillColor(...gold);doc.rect(14,8,45,2,'F');
    doc.setFillColor(...ink);doc.roundedRect(14,19,182,29,2,2,'F');
    if(data.logo){try{const im=await loadImage(data.logo);const h=Math.min(20,70*im.height/im.width);doc.addImage(im,'PNG',19,23,h*im.width/im.height,h,'logo');}catch(e){throw Error('Falha ao carregar a marca do relatório.');}}
    y=57;para('RELATÓRIO TÉCNICO',{size:10,bold:true,color:muted,gap:5});para('Levantamento\nde campo',{size:29,bold:true,gap:8});
    para([...new Set(items.map(e=>e.norma))].join('  •  '),{size:11,color:muted,gap:9});
    field('CLIENTE',meta.cliente||'Não informado');field('PLANTA / UNIDADE',meta.planta||'Não informada');field('VISITA',date(meta.data));field('RESPONSÁVEL PELO LEVANTAMENTO',meta.responsavel||'Não informado');field('ACOMPANHANTE',meta.acompanhante||'Não informado');
    space(34);const metrics=[['ITENS',items.length],['ÁREAS',names.length],['CROQUIS',data.croquis.length],['FOTOS',data.fotos.length]];
    for(let i=0;i<4;i++){const x=14+i*46;doc.setFillColor(240,244,248);doc.roundedRect(x,y,43,23,2,2,'F');font(19,true);doc.text(String(metrics[i][1]),x+4,y+10);font(7,true,muted);doc.text(metrics[i][0],x+4,y+18);}y+=32;
    para('Registro de visita técnica destinado ao detalhamento de projetos e à análise de riscos. Não constitui laudo de conformidade ou projeto executivo.',{size:9,color:muted});
    newPage('Resumo do levantamento');title('Visão geral');
    table(['Área','Itens','Fotos','Croquis','Alta'],names.map(a=>{const es=items.filter(e=>(e.area||'Sem área')===a),ids=new Set(es.map(e=>e.id));return[a,es.length,data.fotos.filter(f=>ids.has(f.itemId)).length,data.croquis.filter(c=>ids.has(c.itemId)).length,es.filter(e=>e.prior==='Alta').length]}),[94,22,22,24,20]);
    field('PRIORIDADES A DEFINIR',items.filter(e=>!e.prior).length);field('OBSERVAÇÕES GERAIS',meta.obs);
    title('Índice de itens');table(['Ref.','Item / TAG','Área','Prioridade'],items.map((e,i)=>[String(i+1).padStart(3,'0'),[e.nome||'(Rascunho)',e.tag].filter(Boolean).join(' / '),e.area||'Sem área',e.prior||'A definir']),[15,84,55,28]);
    if(options.costs!==false&&items.some(e=>e.norma==='Fabricação')){title('Estimativas de fabricação');const es=items.filter(e=>e.norma==='Fabricação');table(['Item','Qtd.','Unitário','Total'],es.map(e=>{const b=budget(e,meta,data.taxas);return[e.nome||'(Rascunho)',b.q,money(b.u),money(b.total)]}),[82,16,42,42]);field('TOTAL ESTIMADO',money(es.reduce((v,e)=>v+budget(e,meta,data.taxas).total,0)));para('Valores preliminares, sujeitos à confirmação após o detalhamento do projeto.',{size:9,color:muted});}
    for(let index=0;index<items.length;index++){
      check(signal);await tick();const e=items[index],ref=String(index+1).padStart(3,'0'),head=ref+'  /  '+(e.nome||'Rascunho');progress(8+Math.round(index/items.length*80),'Montando item '+(index+1)+' de '+items.length);
      newPage(head);title('Ficha '+ref);para(e.nome||'Item sem identificação',{size:19,bold:true});para([e.norma,e.area,e.tag&&'TAG '+e.tag].filter(Boolean).join('  •  '),{size:10,color:muted});
      field('IDENTIFICAÇÃO',[e.fab,e.ano,Math.max(1,num(e.qtd))+' unidade(s)'].filter(Boolean).join(' | '));field('DESCRIÇÃO / FUNÇÃO',e.funcao);field('PRIORIDADE / COMPLEXIDADE',[e.prior||'A definir',e.compl||'A definir'].join(' / '));
      const cfg=data.normas[e.norma];
      if(cfg){for(const [group,fields,extra] of cfg.grupos){if(!fields.some(([k])=>e[k]?.length)&&!(extra&&e[extra[0]]))continue;title(group);for(const [k,label] of fields)field(label,e[k]);if(extra)field(extra[1],e[extra[0]]);}if(cfg.nums.some(([k])=>e[k]!==''&&e[k]!=null)){title('Dimensões e medidas');for(const [k,label] of cfg.nums)field(label,e[k]);}}
      if(e.norma==='Fabricação'&&options.costs!==false){title('Estimativa de fabricação');const b=budget(e,meta,data.taxas);table(['Composição','Valor'],[['Mão de obra - '+b.h.toLocaleString('pt-BR')+' h',money(b.mo)],['Materiais, comprados e terceiros',money(b.ins)],['Custo estimado',money(b.cost)],['Preço unitário',money(b.u)],['Total - '+b.q+' unidade(s)',money(b.total)]],[124,58]);}
      field('OBSERVAÇÕES',e.obs);
      const sketches=options.sketches===false?[]:data.croquis.filter(c=>c.itemId===e.id).sort((a,b)=>a.ts-b.ts);
      for(let i=0;i<sketches.length;i++){check(signal);newPage(head);title('Croqui '+ref+'.'+(i+1));const c=sketches[i];para('Esboço de campo • '+(c.escala==='livre'?'sem escala':c.escala==='1m'?'quadra = 1000 mm':'quadra = 500 mm'),{size:9,color:muted});let im;try{im=await jpeg(c.blob,options.quality==='high'?2200:1800,.91);}catch(err){throw Error('Croqui '+ref+'.'+(i+1)+': '+err.message);}const scale=Math.min(182/im.w,184/im.h),w=im.w*scale,h=im.h*scale;doc.addImage(im.data,'JPEG',14+(182-w)/2,y,w,h,'cq'+ref+'-'+i);y+=h+5;field('COTAS REGISTRADAS',c.cotas?.join('  •  '));field('LEGENDA',c.legenda);await tick();}
      const photos=options.photos===false?[]:data.fotos.filter(f=>f.itemId===e.id).sort((a,b)=>a.ts-b.ts);
      for(let i=0;i<photos.length;i++){check(signal);if(i%2===0){newPage(head);title('Evidências fotográficas');}else space(115);const f=photos[i];let im;try{im=await jpeg(f.blob,options.quality==='high'?1600:1200,options.quality==='high'?.87:.74);}catch(err){throw Error('Foto '+ref+'.'+(i+1)+': '+err.message);}const scale=Math.min(182/im.w,83/im.h),w=im.w*scale,h=im.h*scale;doc.setFillColor(246,248,250);doc.rect(14,y,182,h+2,'F');doc.addImage(im.data,'JPEG',14+(182-w)/2,y+1,w,h,'foto'+ref+'-'+i);y+=h+5;para('Foto '+ref+'.'+(i+1)+' • '+new Date(f.ts||0).toLocaleString('pt-BR'),{size:8,bold:true,color:muted,gap:2});if(f.legenda)para(f.legenda,{size:9,gap:7});else y+=7;await tick();}
    }
    progress(94,'Finalizando PDF');const count=doc.getNumberOfPages();
    for(let i=1;i<=count;i++){doc.setPage(i);font(7,false,muted);doc.setDrawColor(...line);doc.line(14,283,196,283);const footer=doc.splitTextToSize(clean(meta.cliente||'IMPACTO')+' • '+docId,145);doc.text(footer.slice(0,1),14,288);doc.text(i+' / '+count,196,288,{align:'right'});}
    check(signal);return doc.output('blob');
  }
  return {generate,budget};
})();
