window.GJDBG=(function(){
var Q=new URLSearchParams(location.search);
var on=Q.get('debug')==='1',cfg=null,root=null,sheet=null,infoEl=null,listEl=null,ctl={},vals={};
var open=false,idleT=0,dragN=0,fps=60,ft=16.7,lastT=0,uiT=0,grainOn=false,grainEl=null;
var LOOK=[
  {id:'br',label:'brightness',min:-100,max:100,step:.1,def:0,param:'br',detent:1.2,group:'look'},
  {id:'ct',label:'contrast',min:-100,max:100,step:.1,def:0,param:'ct',detent:1.2,group:'look'},
  {id:'gr',label:'grain',min:0,max:100,step:.1,def:0,param:'gr',group:'look'}
];
function isLook(k){return k.id==='br'||k.id==='ct'||k.id==='gr'}
function dec(step){var s=String(step),i=s.indexOf('.');return i<0?0:s.length-i-1}
function r(v,step){return +(+v).toFixed(Math.max(dec(step),0))}
function setP(k,v,def){
  var u=new URL(location.href);
  if(v===null||v===undefined||(def!==undefined&&String(v)===String(def)))u.searchParams.delete(k);else u.searchParams.set(k,String(v));
  try{history.replaceState(history.state,'',u.pathname+u.search+u.hash)}catch(e){}
}
function getNum(k,def){var v=Q.get(k);if(v===null||v==='')return def;v=parseFloat(v);return isFinite(v)?v:def}
function applyLook(){
  var view=document.getElementById('gjview');
  var br=vals.br||0,ct=vals.ct||0;
  if(view)view.style.filter=(br||ct)?'brightness('+(1+br/100*.8).toFixed(4)+') contrast('+(1+ct/100*.7).toFixed(4)+')':'';
  var gr=vals.gr||0;
  grainOn=gr>0;
  if(grainEl){
    grainEl.style.display=grainOn?'block':'none';
    grainEl.style.opacity=(gr/100*.8).toFixed(3);
  }
}
function makeGrain(){
  grainEl=document.createElement('div');grainEl.id='gjgrain';grainEl.setAttribute('aria-hidden','true');
  var c=document.createElement('canvas');c.width=c.height=256;
  var x=c.getContext('2d'),d=x.createImageData(256,256),i,s=1234567;
  for(i=0;i<d.data.length;i+=4){s=(s*1664525+1013904223)>>>0;var v=s>>>24;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}
  x.putImageData(d,0,0);
  grainEl.style.backgroundImage='url('+c.toDataURL()+')';
  document.body.appendChild(grainEl);
}
function allControls(){return LOOK.concat(cfg.controls||[])}
function init(c){
  cfg=c;
  allControls().forEach(function(k){
    if(k.kind==='seg'||k.kind==='bool'){vals[k.id]=Q.get(k.param)!==null?Q.get(k.param):k.def}
    else vals[k.id]=Math.max(k.min,Math.min(k.max,getNum(k.param,k.def)));
  });
  makeGrain();applyLook();
  allControls().forEach(function(k){
    if(!isLook(k)&&k.onChange&&!k.noInit&&(Q.get(k.param)!==null||k.always))k.onChange(vals[k.id],true)
  });
  build();
  document.addEventListener('pointerdown',function(e){if(open&&root&&!root.contains(e.target))close()},true);
  requestAnimationFrame(loop);
}
function enable(){on=true;setP('debug','1');root.classList.add('on');openPanel()}
function disable(){on=false;setP('debug',null);close();root.classList.remove('on')}
function build(){
  root=document.createElement('div');root.id='dbg';if(on)root.classList.add('on');
  var h='<button type="button" class="tab" aria-label="debug panel"><span>dbg</span></button><div class="sheet" role="region" aria-label="debug panel"><div class="hd"><b>debug</b><a href="'+(cfg.versions||'../../_versions/')+'">builds</a><button type="button" data-x aria-label="turn debug off">off</button></div>';
  var groups={},order=[];
  allControls().forEach(function(k){
    var grp=k.group||'controls';
    if(!groups[grp]){groups[grp]=[];order.push(grp)}
    groups[grp].push(k);
  });
  order.sort(function(a,b){var o={variant:0,size:1,look:2};return (o[a]==null?1:o[a])-(o[b]==null?1:o[b])});
  order.forEach(function(gn){
    h+='<div class="sec">'+gn+'</div>';
    groups[gn].forEach(function(k){h+=ctlHtml(k)});
  });
  h+='<div class="sec">state</div><div class="info" id="dbginfo"></div><div class="list" id="dbglist"></div></div>';
  root.innerHTML=h;document.body.appendChild(root);
  sheet=root.querySelector('.sheet');infoEl=root.querySelector('#dbginfo');listEl=root.querySelector('#dbglist');
  var tab=root.querySelector('.tab');
  tab.addEventListener('click',function(){if(!on)enable();else if(open)close();else openPanel()});
  tab.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse'&&on)openPanel()});
  root.querySelector('[data-x]').addEventListener('click',disable);
  ['pointerdown','pointermove','keydown','wheel','touchstart'].forEach(function(ev){sheet.addEventListener(ev,bump,{passive:true})});
  allControls().forEach(function(k){wire(k)});
}
function ctlHtml(k){
  var id='dbg_'+k.id,v=vals[k.id];
  if(k.kind==='seg'){
    var b=k.opts.map(function(o,i){return (i?'<i>·</i>':'')+'<button type="button" data-v="'+o[0]+'" aria-pressed="'+(String(v)===String(o[0]))+'">'+o[1]+'</button>'}).join('');
    return '<div class="rowc" data-id="'+k.id+'"><label>'+k.label+'</label><div class="seg">'+b+'</div></div>';
  }
  if(k.kind==='bool'){
    return '<div class="rowc" data-id="'+k.id+'"><label>'+k.label+'</label><div class="seg"><button type="button" data-v="1" aria-pressed="'+(String(v)==='1')+'">on</button><i>·</i><button type="button" data-v="0" aria-pressed="'+(String(v)!=='1')+'">off</button></div></div>';
  }
  return '<div class="rowc'+(k.detent?' det':'')+'" data-id="'+k.id+'"><label for="'+id+'">'+k.label+(k.unit?' <small>'+k.unit+'</small>':'')+'</label>'+
    '<input type="range" id="'+id+'" min="'+k.min+'" max="'+k.max+'" step="'+k.step+'" value="'+v+'" aria-label="'+k.label+'">'+
    '<input class="nb" type="number" inputmode="decimal" step="'+k.step+'" min="'+k.min+'" max="'+k.max+'" value="'+(+v).toFixed(2)+'" aria-label="'+k.label+' value">'+
    '<div class="dial"><button type="button" data-n="-10">&minus;10</button><button type="button" data-n="-1">&minus;1</button><button type="button" data-n="1">+1</button><button type="button" data-n="10">+10</button><button type="button" data-n="0">reset</button></div></div>';
}
function commit(k,v,fromRange){
  v=Math.max(k.min,Math.min(k.max,r(v,k.step)));
  vals[k.id]=v;
  var o=ctl[k.id];
  if(o){
    if(!fromRange)o.range.value=String(v);
    if(document.activeElement!==o.nb)o.nb.value=v.toFixed(2);
  }
  setP(k.param,v,k.def);
  if(isLook(k))applyLook();
  if(k.onChange)k.onChange(v);
}
function wire(k){
  var row=root.querySelector('.rowc[data-id="'+k.id+'"]');if(!row)return;
  if(k.kind==='seg'||k.kind==='bool'){
    [].forEach.call(row.querySelectorAll('button'),function(b){
      b.addEventListener('click',function(){
        vals[k.id]=b.getAttribute('data-v');
        [].forEach.call(row.querySelectorAll('button'),function(x){x.setAttribute('aria-pressed',String(x===b))});
        setP(k.param,vals[k.id],k.def);
        if(k.onChange)k.onChange(vals[k.id]);
      });
    });
    return;
  }
  var range=row.querySelector('input[type=range]'),nb=row.querySelector('.nb'),dial=row.querySelector('.dial'),offT=0,last={t:0,x:0},dbl=false,dragging=false;
  ctl[k.id]={range:range,nb:nb,row:row};
  function dialOn(){clearTimeout(offT);row.classList.add('dialon','act')}
  function dialOff(ms){clearTimeout(offT);offT=setTimeout(function(){if(document.activeElement===nb||(document.activeElement===range&&dragging))return;row.classList.remove('dialon','act')},ms)}
  range.addEventListener('pointerdown',function(e){
    var t=performance.now();
    if(t-last.t<380&&Math.abs(e.clientX-last.x)<36){dbl=true;last.t=0}else{dbl=false;last={t:t,x:e.clientX}}
    dragging=true;dragN++;root.classList.add('drag');dialOn();
  });
  function release(){
    if(!dragging)return;
    dragging=false;dragN=Math.max(0,dragN-1);if(!dragN)root.classList.remove('drag');
    if(dbl){dbl=false;commit(k,k.def)}
    dialOff(1000);
  }
  window.addEventListener('pointerup',release);window.addEventListener('pointercancel',release);
  range.addEventListener('input',function(){
    var v=parseFloat(range.value);
    if(k.detent&&Math.abs(v-k.def)<k.detent){v=k.def;range.value=String(k.def)}
    commit(k,v,true);
  });
  range.addEventListener('focus',dialOn);range.addEventListener('blur',function(){dialOff(1000)});
  nb.addEventListener('focus',dialOn);nb.addEventListener('blur',function(){nb.value=vals[k.id].toFixed(2);dialOff(1000)});
  nb.addEventListener('input',function(){var v=parseFloat(nb.value);if(isFinite(v))commit(k,v)});
  nb.addEventListener('change',function(){var v=parseFloat(nb.value);if(isFinite(v))commit(k,v);nb.value=vals[k.id].toFixed(2)});
  function key(e){
    var d=e.key==='ArrowUp'||e.key==='ArrowRight'?1:e.key==='ArrowDown'||e.key==='ArrowLeft'?-1:0;
    if(!d)return;
    e.preventDefault();dialOn();dialOff(1000);
    commit(k,vals[k.id]+d*k.step*(e.shiftKey?10:1));
  }
  range.addEventListener('keydown',key);nb.addEventListener('keydown',key);
  dial.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;
    var n=parseFloat(b.getAttribute('data-n'));
    if(n===0)commit(k,k.def);else commit(k,vals[k.id]+n*k.step);
    dialOn();dialOff(1000);
  });
}
function openPanel(){if(!root||!on)return;open=true;root.classList.add('open');bump()}
function close(){if(!root)return;open=false;root.classList.remove('open');clearTimeout(idleT)}
function bump(){clearTimeout(idleT);if(!open)return;idleT=setTimeout(function(){
  var ae=document.activeElement;
  if(dragN>0||(ae&&root.contains(ae)&&ae.tagName==='INPUT'&&ae.type==='number')){bump();return}
  close()},3000)}
function esc(s){return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
function loop(t){
  requestAnimationFrame(loop);
  var dt=t-(lastT||t);lastT=t;
  if(dt>0&&dt<500){ft+=(dt-ft)*.08;fps+=(1000/dt-fps)*.08}
  if(grainOn&&grainEl){
    var gx=(Math.random()*256)|0,gy=(Math.random()*256)|0;
    grainEl.style.transform='translate3d('+(-gx)+'px,'+(-gy)+'px,0)';
  }
  if(!on||!open||t-uiT<200)return;
  uiT=t;
  var rows=cfg.rows?cfg.rows():[];
  rows=rows.concat([
    ['fps / frame',fps.toFixed(1)+' / '+ft.toFixed(2)+' ms'],
    ['dpr / viewport',(window.devicePixelRatio||1).toFixed(2)+' / '+innerWidth+'x'+innerHeight],
    ['reduce motion',window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches?'on (same motion)':'off']
  ]);
  infoEl.innerHTML=rows.map(function(x){return '<span>'+esc(x[0])+'</span><span>'+esc(x[1])+'</span>'}).join('');
  if(cfg.list&&listEl){var l=cfg.list();listEl.innerHTML=l.map(function(s){return '<div>'+esc(s)+'</div>'}).join('')}
}
return {init:init,frame:function(){},val:function(id){return vals[id]},isOn:function(){return on},setP:setP,open:openPanel,close:close,state:function(){return {on:on,open:open,fps:fps}}};
})();
