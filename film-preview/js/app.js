/* Film mockup: Photo lab horizon + contact sheet, then an Objects-style wireframe case.
   Titles, credits and posters come from the existing film pages. Same motion with Reduce Motion on.
   Nothing auto-advances. External video sites are not linked. */
(function(){
'use strict';
var F=window.FILMS||[];
function $(id){return document.getElementById(id)}
function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])})}
function num(n){return (n<10?'0':'')+n}

/* ---------- hint ---------- */
var hintT=0;
function hint(t,ms){var h=document.querySelector('.lab-hint');if(!h){h=el('div','lab-hint gone');document.body.appendChild(h)}
  h.textContent=t;void h.offsetWidth;h.classList.remove('gone');clearTimeout(hintT);hintT=setTimeout(function(){h.classList.add('gone')},ms||4200)}

/* ---------- layers (history so phone back / Esc rise one place) ---------- */
var stack=[];
var layer={
  push:function(name,leave){stack.push({name:name,leave:leave});try{history.pushState({film:stack.length},'')}catch(e){}},
  top:function(){return stack.length?stack[stack.length-1].name:''},
  depth:function(){return stack.length},
  back:function(){if(stack.length)history.back()}
};
window.addEventListener('popstate',function(e){if(leaving)return;var d=(e.state&&e.state.film)||0;while(stack.length>d){var s=stack.pop();try{s.leave&&s.leave()}catch(x){}}syncChrome()});

/* ---------- pinch: one level per gesture ---------- */
var gcool=0;
function fire(fn){var n=Date.now();if(n<gcool||!fn)return;gcool=n+850;fn()}
function pinch(node,o){
  var d0=0,done=false;
  function dist(t){return Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY)}
  node.addEventListener('touchstart',function(e){if(e.touches.length===2){d0=dist(e.touches);done=false;if(e.cancelable)e.preventDefault()}},{passive:false});
  node.addEventListener('touchmove',function(e){if(e.touches.length!==2||!d0)return;if(e.cancelable)e.preventDefault();if(done)return;var r=dist(e.touches)/d0;
    /* Spread opens the contact sheet. Closing fingers on the sheet leaves it, back to the horizon. */
    if(r>1.28){done=true;fire(o.out)}else if(r<0.78){done=true;fire(o.in)}},{passive:false});
  node.addEventListener('touchend',function(e){if(e.touches.length<2)d0=0},{passive:true});
  var acc=0,cool=0;
  node.addEventListener('wheel',function(e){if(!e.ctrlKey)return;e.preventDefault();var now=Date.now();if(now<cool)return;acc+=e.deltaY;
    if(acc<-40){acc=0;cool=now+700;fire(o.out)}else if(acc>40){acc=0;cool=now+700;fire(o.in)}},{passive:false});
}
['gesturestart','gesturechange','gestureend'].forEach(function(n){document.addEventListener(n,function(e){e.preventDefault()},{passive:false})});

/* ---------- horizon ---------- */
var sky=$('sky'),framesE=$('frames'),reflE=$('refl'),nowE=$('now'),where=$('where');
var sheet=$('sheet'),grid=$('grid'),sheetB=$('sheetBtn');
var pos=0,target=0,raf=0,els=[],rels=[],W,H,HY,FH,cols=6;

function colCount(){return (innerWidth<720)?3:(innerWidth<1100?4:6)}
function buildHorizon(){
  framesE.innerHTML='';reflE.innerHTML='';els=[];rels=[];
  F.forEach(function(p,i){
    var f=el('div','fm');f.dataset.i=i;
    var im=new Image();im.alt=p.short;im.decoding='async';im.src=p.poster;im.width=p.w;im.height=p.h;f.appendChild(im);
    framesE.appendChild(f);els.push(f);
    var r=el('div','fm');var im2=new Image();im2.alt='';im2.decoding='async';im2.src=p.poster;r.appendChild(im2);
    reflE.appendChild(r);rels.push(r);
  });
  $('phd').textContent=F.length+' frames';
  size();buildSheet();
}
function size(){
  W=innerWidth;H=innerHeight;var land=W>H;HY=Math.round(H*(land&&H<500?.70:.64));
  FH=land?Math.min(H*.52,HY-64):Math.min(H*.40,HY-96);
  els.forEach(function(f,i){var p=F[i],h=FH,w=h*(p.w/p.h);if(w>W*(land?.62:.88)){w=W*(land?.62:.88);h=w*(p.h/p.w)}
    [f,rels[i]].forEach(function(e){e.style.width=w+'px';e.style.height=h+'px';e.style.marginLeft=(-w/2)+'px'});
    f.style.marginTop=(-h)+'px';f._w=w});
  sky.style.setProperty('--hy',HY+'px');
  lastCur=-1;paint();
  var c=colCount();if(c!==cols){cols=c;grid.style.setProperty('--cols',cols)}
  sizeCases();
}
var lastCur=-1;
function paint(){
  if(!els.length)return;
  var cur=Math.round(pos),g=Math.max(10,W*.018),cw=els[cur]._w,nw=FH*.8*.46;
  for(var i=0;i<els.length;i++){
    var d=i-pos,a=Math.abs(d),f=els[i],r=rels[i];
    if(a>7.5){if(f._v!==0){f.style.display=r.style.display='none';f._v=0;f.classList.remove('cur')}continue}
    if(!f._v){f.style.display=r.style.display='';f._v=1}
    var s=a<1?1-.54*a:Math.max(.2,.46-.05*(a-1)),reach=cw/2+g+nw/2,x=a<1?d*reach:Math.sign(d)*(reach+(a-1)*(nw+g)),
        sink=a<1.6?0:(a-1.6)*FH*.11;
    f.style.transform='translate('+x.toFixed(1)+'px,'+sink.toFixed(1)+'px) scale('+s.toFixed(3)+')';
    r.style.transform='translate('+x.toFixed(1)+'px,'+(-sink).toFixed(1)+'px) scale('+s.toFixed(3)+','+(-s).toFixed(3)+')';
    f.style.zIndex=r.style.zIndex=100-Math.round(a*10);
    f.style.filter=a>.5?'brightness('+(1-Math.min(.45,(a-.5)*.12)).toFixed(2)+')':'';
    f.classList.toggle('cur',i===cur);
  }
  if(cur!==lastCur){lastCur=cur;var p=F[cur];nowE.textContent=num(p.n)+'  ·  '+p.short;markSheetCur()}
}
function loop(){raf=0;var d=target-pos;if(Math.abs(d)<.002){pos=target;paint();return}pos+=d*.11;paint();raf=requestAnimationFrame(loop)}
function go(t,now){target=Math.max(0,Math.min(F.length-1,t));if(now){pos=target;paint()}else if(!raf)raf=requestAnimationFrame(loop)}

/* ---------- contact sheet ---------- */
function edgeLabel(p){
  var credit=p.credits&&p.credits[0]?p.credits[0]:(p.role||p.meta||'');
  return '<b>'+esc(num(p.n)+'  '+p.short)+'</b>'+(credit?'<i>'+esc(credit)+'</i>':'');
}
function buildSheet(){
  cols=colCount();grid.style.setProperty('--cols',cols);grid.innerHTML='';
  F.forEach(function(p,i){
    var b=el('button','cell');b.type='button';b.dataset.i=i;
    b.setAttribute('aria-label',p.title);
    var win=el('span','win');
    var im=new Image();im.alt='';im.decoding='async';im.src=p.poster;im.width=p.w;im.height=p.h;win.appendChild(im);
    b.appendChild(win);b.appendChild(el('span','no',edgeLabel(p)));
    grid.appendChild(b);
  });
  markSheetCur();
}
function markSheetCur(){if(!grid.children.length)return;var cur=Math.round(pos);
  for(var i=0;i<grid.children.length;i++)grid.children[i].classList.toggle('cur',i===cur)}
function scrollCur(){var cur=grid.children[Math.round(pos)];if(cur)cur.scrollIntoView({block:'center',behavior:'smooth'})}

function syncChrome(){
  var top=layer.top();
  var onSheet=top==='sheet';
  var onCase=top==='case';
  var onDay=top==='day';
  document.body.classList.toggle('sheet-open',onSheet);
  document.body.classList.toggle('case-open',onCase);
  document.body.classList.toggle('day-open',onDay);
  sheetB.classList.toggle('on',onSheet);
  sheetB.setAttribute('aria-pressed',onSheet);
  $('back').hidden=!(onSheet||onCase||onDay);
  where.textContent=onDay?'the film':onCase?'case':onSheet?'contact sheet':'horizon';
}

function showSheet(on){
  if(on){sheet.hidden=false;void sheet.offsetWidth;sheet.classList.add('open');
    markSheetCur();requestAnimationFrame(function(){scrollCur()});
    hint('tap a frame to open it in the case · close your fingers to go back to the horizon',4200)}
  else{sheet.classList.remove('open');
    setTimeout(function(){if(!sheet.classList.contains('open'))sheet.hidden=true},1000)}
  syncChrome();
}
function openSheet(){
  if(layer.top()==='sheet')return;
  if(layer.top()==='day'){layer.back();return}
  if(layer.top()==='case'){/* leave case first via push on top */}
  showSheet(true);
  layer.push('sheet',function(){showSheet(false);if(!layer.depth())syncChrome()});
  syncChrome();
}
function closeSheetToHorizon(){if(layer.top()==='sheet')layer.back();else if(!layer.depth())showSheet(false)}

grid.addEventListener('click',function(e){var b=e.target.closest('.cell');if(!b)return;var i=+b.dataset.i;go(i,true);openCase(i)});
sheetB.addEventListener('click',function(){
  var top=layer.top();
  if(top==='day'){layer.back();return}
  if(top==='case'){openSheet();return}
  if(top==='sheet')layer.back();else openSheet();
});
pinch(sheet,{in:function(){closeSheetToHorizon()},out:function(){}});

/* ---------- horizon scrub ---------- */
var dr=null,fingers=0;
sky.addEventListener('pointerdown',function(e){
  if(e.pointerType==='touch')fingers++;
  if(fingers>1){if(dr){go(Math.round(dr.p));dr=null}return}
  dr={x:e.clientX,y:e.clientY,p:target,m:false,t:Date.now(),vx:0,lx:e.clientX,lt:Date.now(),id:e.pointerId};try{sky.setPointerCapture(e.pointerId)}catch(err){}});
sky.addEventListener('pointermove',function(e){if(!dr||fingers>1)return;var dx=e.clientX-dr.x;if(Math.abs(dx)>6)dr.m=true;var now=Date.now();dr.vx=(e.clientX-dr.lx)/Math.max(1,now-dr.lt);dr.lx=e.clientX;dr.lt=now;
  if(dr.m)go(dr.p-dx/(FH*.2))});
sky.addEventListener('pointerup',function(e){
  if(e.pointerType==='touch')fingers=Math.max(0,fingers-1);
  if(!dr||(dr.id!=null&&e.pointerId!==dr.id))return;
  if(fingers>0){dr=null;return}
  if(dr.m){go(Math.round(target-dr.vx*900/(FH*.2)))}else{var node=document.elementFromPoint(e.clientX,e.clientY),f=node&&node.closest('.fm');
  if(f){var i=+f.dataset.i;if(i===Math.round(pos))openCase(i);else go(i)}}dr=null});
sky.addEventListener('pointercancel',function(e){if(e.pointerType==='touch')fingers=Math.max(0,fingers-1);dr=null;go(Math.round(target))});
var wt=0;sky.addEventListener('wheel',function(e){if(e.ctrlKey)return;e.preventDefault();var d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;go(target+d/120);clearTimeout(wt);wt=setTimeout(function(){go(Math.round(target))},160)},{passive:false});
pinch(sky,{in:function(){},out:function(){openSheet()}});

/* ---------- wireframe case ---------- */
var hall=$('hall'),casesE=$('cases'),caseI=0,caseX=0,caseT=0,craf=0,caseEls=[];
function sizeCases(){
  var land=innerWidth>innerHeight;
  var bw=Math.min(innerWidth* (land?.56:.84), 760);
  var bh=bw*9/16;
  casesE.style.setProperty('--bw',bw+'px');
  casesE.style.setProperty('--bh',bh+'px');
  caseEls.forEach(function(c){c.style.setProperty('--bw',bw+'px');c.style.setProperty('--bh',bh+'px')});
  paintCases();
}
function buildCases(){
  casesE.innerHTML='';caseEls=[];
  F.forEach(function(p,i){
    var c=el('div','case');c.dataset.i=i;
    c.innerHTML='<div class="box"><div class="face"><img alt="" src="'+esc(p.poster)+'" width="'+p.w+'" height="'+p.h+'" decoding="async"></div><div class="wire" aria-hidden="true"></div><div class="side l" aria-hidden="true"></div><div class="side r" aria-hidden="true"></div><div class="plinth" aria-hidden="true"></div></div>';
    casesE.appendChild(c);caseEls.push(c);
  });
  sizeCases();
}
function paintCases(){
  var bw=parseFloat(getComputedStyle(casesE).getPropertyValue('--bw'))||320;
  var gap=Math.max(56, innerWidth*.08);
  for(var i=0;i<caseEls.length;i++){
    var d=i-caseX,a=Math.abs(d),c=caseEls[i];
    if(a>3.2){c.style.display='none';continue}
    c.style.display='';
    var z=-Math.abs(d)*220;
    var x=d*(bw+gap)*0.72;
    var s=1-Math.min(.28,a*.16);
    c.style.transform='translate3d('+x.toFixed(1)+'px,0,'+z.toFixed(1)+'px) scale('+s.toFixed(3)+')';
    c.style.zIndex=100-Math.round(a*10);
    c.classList.toggle('dim',a>.45);
  }
  var p=F[Math.round(caseX)]||F[caseI];
  if(p){document.querySelector('#clabel .t').textContent=p.title+'  —  whole piece'}
  $('prevC').disabled=Math.round(caseX)<=0;
  $('nextC').disabled=Math.round(caseX)>=F.length-1;
}
function caseLoop(){craf=0;var d=caseT-caseX;if(Math.abs(d)<.002){caseX=caseT;paintCases();return}caseX+=d*.14;paintCases();craf=requestAnimationFrame(caseLoop)}
function goCase(t,now){caseT=Math.max(0,Math.min(F.length-1,t));if(now){caseX=caseT;paintCases()}else if(!craf)craf=requestAnimationFrame(caseLoop)}

function showHall(on){
  if(on){hall.hidden=false;void hall.offsetWidth;hall.classList.add('open')}
  else{hall.classList.remove('open');setTimeout(function(){if(!hall.classList.contains('open'))hall.hidden=true},1000)}
  syncChrome();
}
function openCase(i){
  if(i==null)i=Math.round(pos);
  i=Math.max(0,Math.min(F.length-1,i));
  caseI=i;go(i,true);goCase(i,true);
  if(layer.top()==='sheet')showSheet(false);
  if(layer.top()==='case'){paintCases();syncChrome();return}
  showHall(true);
  layer.push('case',function(){
    showHall(false);
    if(layer.top()==='sheet')showSheet(true);
    syncChrome();
  });
  syncChrome();
}

var cdr=null;
hall.addEventListener('pointerdown',function(e){if(e.target.closest('.chud, #inb, .sidebtn, .clabel'))return;
  cdr={x:e.clientX,p:caseT,m:false,vx:0,lx:e.clientX,lt:Date.now()};try{hall.setPointerCapture(e.pointerId)}catch(x){}});
hall.addEventListener('pointermove',function(e){if(!cdr)return;var dx=e.clientX-cdr.x;if(Math.abs(dx)>8)cdr.m=true;var now=Date.now();cdr.vx=(e.clientX-cdr.lx)/Math.max(1,now-cdr.lt);cdr.lx=e.clientX;cdr.lt=now;
  if(cdr.m)goCase(cdr.p-dx/(innerWidth*.55))});
hall.addEventListener('pointerup',function(e){if(!cdr)return;if(cdr.m)goCase(Math.round(caseT-cdr.vx*420/(innerWidth*.55)));
  else if(e.target.closest('.case')){/* already current, in › is the way deeper */}
  cdr=null});
hall.addEventListener('pointercancel',function(){cdr=null;goCase(Math.round(caseT))});
var cwt=0;hall.addEventListener('wheel',function(e){if(e.ctrlKey)return;e.preventDefault();var d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;goCase(caseT+d/140);clearTimeout(cwt);cwt=setTimeout(function(){goCase(Math.round(caseT))},160)},{passive:false});
pinch(hall,{in:function(){openDay(F[Math.round(caseX)])},out:function(){layer.back()}});
$('prevC').addEventListener('click',function(){goCase(Math.round(caseT)-1)});
$('nextC').addEventListener('click',function(){goCase(Math.round(caseT)+1)});
$('inb').addEventListener('click',function(){openDay(F[Math.round(caseX)])});
$('up').addEventListener('click',function(){layer.back()});
$('home').addEventListener('click',function(){while(layer.depth()){/* pop via history would be async */ } goHome()});
$('sheetFromCase').addEventListener('click',function(){openSheet()});
$('board').addEventListener('click',function(){openSheet()});

var leaving=false;
function goHome(){
  leaving=true;
  var n=stack.length;
  while(stack.length){var s=stack.pop();try{s.leave&&s.leave()}catch(e){}}
  leaving=false;
  try{if(n)history.go(-n)}catch(e){}
  syncChrome();
}

/* ---------- player (existing film page layer: poster + real credits; clips omitted pending video child-check) ---------- */
var day=$('day'),hero=$('hero'),cred=$('cred');
function fillDay(p){
  hero.innerHTML='';
  var im=new Image();im.alt=p.title;im.src=p.poster;im.width=p.w;im.height=p.h;hero.appendChild(im);
  var bits=[];
  bits.push('<span>'+esc(p.title)+'</span>');
  if(p.role)bits.push('<span>role <b>'+esc(p.role)+'</b></span>');
  (p.credits||[]).forEach(function(c){bits.push('<span>credit <b>'+esc(c)+'</b></span>')});
  if(p.meta)bits.push('<span>'+esc(p.meta)+'</span>');
  cred.innerHTML=bits.join('');
}
function showDay(on){
  if(on){day.hidden=false;void day.offsetWidth;day.classList.add('open');$('dsc').scrollTop=0}
  else{day.classList.remove('open');setTimeout(function(){if(!day.classList.contains('open'))day.hidden=true},1000)}
  syncChrome();
}
function openDay(p){
  if(!p)return;
  fillDay(p);
  if(layer.top()==='day'){syncChrome();return}
  showDay(true);
  layer.push('day',function(){showDay(false);syncChrome()});
  syncChrome();
}
$('dayBack').addEventListener('click',function(){layer.back()});
pinch(day,{in:function(){},out:function(){layer.back()}});

/* ---------- chrome ---------- */
$('back').addEventListener('click',function(){if(layer.depth())layer.back()});
$('top').querySelector('.sig').addEventListener('click',function(e){if(layer.depth()){e.preventDefault();goHome()}});
document.addEventListener('keydown',function(e){
  var top=layer.top();
  if(top==='day'){if(e.key==='Escape')layer.back();return}
  if(top==='case'){
    if(e.key==='ArrowRight'){goCase(Math.round(caseT)+1);e.preventDefault()}
    else if(e.key==='ArrowLeft'){goCase(Math.round(caseT)-1);e.preventDefault()}
    else if(e.key==='Enter')openDay(F[Math.round(caseX)]);
    else if(e.key==='Escape')layer.back();
    return;
  }
  if(top==='sheet'){
    if(e.key==='ArrowRight'){go(Math.round(target)+1,true);scrollCur();e.preventDefault()}
    else if(e.key==='ArrowLeft'){go(Math.round(target)-1,true);scrollCur();e.preventDefault()}
    else if(e.key==='Enter'){openCase(Math.round(pos));e.preventDefault()}
    else if(e.key==='Escape')layer.back();
    return;
  }
  if(e.key==='ArrowRight'){go(Math.round(target)+1);e.preventDefault()}
  else if(e.key==='ArrowLeft'){go(Math.round(target)-1);e.preventDefault()}
  else if(e.key==='Enter')openCase(Math.round(pos));
});
addEventListener('resize',size);

buildHorizon();
buildCases();
hint('drag sideways: every film, in the list order · spread your fingers for the contact sheet · tap the one standing there',5600);
syncChrome();
window.__film={go:go,openSheet:openSheet,openCase:openCase,openDay:openDay,F:F,top:function(){return layer.top()},pos:function(){return Math.round(pos)},closeSheet:closeSheetToHorizon};
})();
