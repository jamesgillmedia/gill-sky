/* preview-film-snap · the mark menu: list · contact · tune (decisions 1-4 and switches first, then room sliders).
 Press the ᑕᐣᓯ mark (top left) and a hairline menu opens under it. "tune" shows sliders for the room you are in first,
 then the other rooms. Every slider drives a hook that already exists:
   sky     GJ_TUNE map / stars / starS / starG / lineA (the sky as written = 100)
   film    GJ_TUNE fdens / fgap (the film board's snap density and frame gap, added with the snap)
   sound   gj.vol / gj.flash (the player's own volume and flash)
   objects gj.amb.objects.glow / haze / stars / lamp (read by the Objects room's own GLOW plate when it opens)
   spaces  gj.amb.garden.day / star / glow / haze (read by the Forest garden's own dial when it opens)
 Values are kept on this device (localStorage). Reset puts every one back. Nothing here grades a photograph or a film frame. */
(function(){
'use strict';
var $=function(id){return document.getElementById(id)};
function rd(k,d){try{var v=localStorage.getItem(k);if(v==null||v==='')return d;v=+v;return isFinite(v)?v:d}catch(e){return d}}
function wr(k,v){try{localStorage.setItem(k,String(v))}catch(e){}}
function rm(k){try{localStorage.removeItem(k)}catch(e){}}
function T(){return window.GJ_TUNE||null}
function tuneRow(k,label,min,max,def,note){
  /* shown as a percentage of the sky as written */
  return {k:'gj.tune.'+k,label:label,min:min,max:max,def:100,note:note,
    get:function(){return rd('gj.tune.'+k,100)},
    apply:function(v){var t=T();if(!t)return;var o={};o[k]=def*v/100;t.set(o)}};
}
function lsRow(key,label,min,max,def,scale,after){
  return {k:key,label:label,min:min,max:max,def:def,
    get:function(){var v=rd(key,null);return v==null?def:Math.round(v*scale)},
    apply:function(v,save){if(save)wr(key,v/scale);if(after)after(key)}};
}
function poke(key){try{window.dispatchEvent(new StorageEvent('storage',{key:key}))}catch(e){}}
var D=(window.GJ_TUNE&&GJ_TUNE.defaults&&GJ_TUNE.defaults())||{map:1.3,stars:1.2,lineA:1,starS:1,starG:1,fdens:1,fgap:1};
var ROOMS=[
  {id:'sky',name:'sky',rows:[
    tuneRow('map','star spread',60,160,D.map),
    tuneRow('stars','stars',40,180,D.stars),
    tuneRow('starS','star size',50,200,D.starS),
    tuneRow('starG','star glow',0,200,D.starG),
    tuneRow('lineA','lines',0,200,D.lineA)]},
  {id:'film',name:'film',rows:[
    tuneRow('fdens','snap density',60,140,D.fdens),
    tuneRow('fgap','frame gap',25,300,D.fgap)]},
  {id:'sound',name:'sound',rows:[
    lsRow('gj.vol','volume',0,100,100,100,poke),
    lsRow('gj.flash','flash',0,100,60,100,function(){var t=T();if(t)t.set({flash:rd('gj.flash',.6)})})]},
  {id:'objects',name:'objects',door:'../objects/',rows:[
    lsRow('gj.amb.objects.glow','all rings',0,150,100,1),
    lsRow('gj.amb.objects.haze','haze',0,250,100,1),
    lsRow('gj.amb.objects.stars','stars',0,200,100,1),
    lsRow('gj.amb.objects.lamp','lamp',20,160,100,1)]},
  {id:'spaces',name:'spaces',door:'../spaces/forest-garden/',rows:[
    lsRow('gj.amb.garden.day','day – night',0,100,0,1),
    lsRow('gj.amb.garden.star','stars',0,200,100,1),
    lsRow('gj.amb.garden.glow','glow',0,150,100,1),
    lsRow('gj.amb.garden.haze','haze',0,300,100,1)]}
];
/* tune-room rows that only take effect inside that room say so */
/* Gill's four decisions, every option we considered, plus the other switches that have a hook. */
var DECS=[
  {k:'film',n:'1 · film board',o:[['snap','both, snap'],['map','m4 map only'],['board','site-3d board only']]},
  {k:'mark',n:'2 · mark in the journey',o:[['fusion','fusion'],['full','full'],['partial','partial (fewer stars)']]},
  {k:'open',n:'3 · opening one film',o:[['mixed','board straight · map reveal'],['player','straight to the page'],['reveal','tile reveal always'],['old','old: tap, tap again']]},
  {k:'photo',n:'4 · photo',o:[['B','B · dark, night sky'],['A','A · silver shelf']]}
];
var MORE=[
  {k:'motion',label:'motion',min:0,max:200},
  {k:'snapAt',label:'snap threshold',min:15,max:70},
];
/* Safelight: a warm edge glow from the Darkroom. It lives in a 10px band at the very edges of the screen, under every page
 layer and outside every board (boards start 14px in), so it never tints or grades a photograph or a film frame. */
function safelight(){
  var G=D2();if(!G)return;
  var el=document.getElementById('safelight');
  if(!el){el=document.createElement('div');el.id='safelight';el.setAttribute('aria-hidden','true');var st=document.getElementById('stage')||document.body;st.appendChild(el)}
  var on=+G.get('safelight')===1,k=Math.max(0,Math.min(100,+G.get('safeK')))/100;
  el.hidden=!on||k<=0;
  el.style.setProperty('--safe',(on?k:0).toFixed(2));
}
function D2(){return window.GJ_DEC||null}
var NEXT='next: moon glow, snow, mist, reflection, ripple, drift, film spill, film sound';
function room(){
  var c=window.__u1&&__u1.cur;var k=c&&c.k;
  if(k==='film'||k==='sound'||k==='objects')return k;
  return 'sky';
}
var menu=null,open=false,tuneOn=false;
function build(){
  menu=document.createElement('div');menu.id='markmenu';menu.hidden=true;menu.setAttribute('role','dialog');menu.setAttribute('aria-label','the mark menu');
  menu.innerHTML='<nav class="mm-top"><a href="list/">list</a><a href="contact/">contact</a><button type="button" class="mm-tune" aria-expanded="false">tune</button></nav>'+
    '<nav class="mm-rooms" aria-label="rooms"><button type="button" data-go="film">film</button><button type="button" data-go="sound">sound</button><a href="../objects/">objects</a><a href="../spaces/forest-garden/">spaces</a><button type="button" data-go="photo">photo</button></nav>'+
    '<div class="mm-plate" hidden></div>';
  document.body.appendChild(menu);
  menu.addEventListener('pointerdown',function(e){e.stopPropagation()});
  menu.addEventListener('click',function(e){
    e.stopPropagation();
    var b=e.target.closest('[data-go]');
    if(b){show(false);if(window.__depth)__depth.goTo(b.getAttribute('data-go'));return}
    if(e.target.closest('.mm-tune')){tuneOn=!tuneOn;paint();return}
    if(e.target.closest('.mm-reset')){reset();return}
    var db=e.target.closest('[data-dec]');
    if(db&&D2()){D2().set(db.getAttribute('data-dec'),db.getAttribute('data-v'));safelight();paint();return}
  });
  menu.addEventListener('input',function(e){
    var dr=e.target.closest('input[data-dec-r]');
    if(dr&&D2()){var dk=dr.getAttribute('data-dec-r');D2().set(dk,+dr.value);var oo=dr.parentNode.querySelector('output');if(oo)oo.textContent=dk==='safeK'?(dr.value/100).toFixed(2):dr.value;if(dk==='safeK')safelight();return}
    var r=e.target.closest('input[data-k]');if(!r)return;
    var row=findRow(r.getAttribute('data-k'));if(!row)return;
    var v=+r.value;
    if(row.k.indexOf('gj.tune.')===0)wr(row.k,v);
    row.apply(v,true);
    var o=r.parentNode.querySelector('output');if(o)o.textContent=v;
  });
  menu.addEventListener('keydown',function(e){if(e.key==='Escape'){e.stopPropagation();show(false)}});
  document.addEventListener('pointerdown',function(e){if(open&&!e.target.closest('#markmenu,#crumb .sig'))show(false)},true);
}
function findRow(k){for(var i=0;i<ROOMS.length;i++)for(var j=0;j<ROOMS[i].rows.length;j++)if(ROOMS[i].rows[j].k===k)return ROOMS[i].rows[j];return null}
function paint(){
  var pl=menu.querySelector('.mm-plate'),tb=menu.querySelector('.mm-tune');
  tb.setAttribute('aria-expanded',tuneOn?'true':'false');tb.classList.toggle('on',tuneOn);
  pl.hidden=!tuneOn;if(!tuneOn)return;
  var here=room(),order=ROOMS.slice().sort(function(a,b){return (b.id===here)-(a.id===here)});
  var h='<section class="mm-dec"><h3>decisions <em>the hero opener keeps the full mark in every mode; the Sound waveform player is in every combination</em></h3>';
  var G=D2();
  DECS.forEach(function(d){
    var v=G?G.get(d.k):'';
    h+='<div class="mm-seg" role="radiogroup" aria-label="'+d.n+'"><b>'+d.n+'</b><span>';
    d.o.forEach(function(o){h+='<button type="button" role="radio" aria-checked="'+(v===o[0])+'" data-dec="'+d.k+'" data-v="'+o[0]+'">'+o[1]+'</button>'});
    h+='</span></div>';
  });
  MORE.forEach(function(m){var v=G?G.get(m.k):0;h+='<label><span>'+m.label+'</span><input type="range" min="'+m.min+'" max="'+m.max+'" step="1" value="'+v+'" data-dec-r="'+m.k+'" aria-label="'+m.label+'"><output>'+v+'</output></label>'});
  var sl=G?+G.get('safelight'):0,sk=G?+G.get('safeK'):60;
  h+='<div class="mm-seg"><b>safelight (warm edge glow)</b><span><button type="button" role="radio" aria-checked="'+(sl===0)+'" data-dec="safelight" data-v="0">off</button><button type="button" role="radio" aria-checked="'+(sl===1)+'" data-dec="safelight" data-v="1">on</button></span></div>';
  h+='<label><span>safelight strength</span><input type="range" min="0" max="100" step="1" value="'+sk+'" data-dec-r="safeK" aria-label="safelight strength, 0 to 1"><output>'+(sk/100).toFixed(2)+'</output></label>';
  var rv=G?+G.get('ripples'):1;
  h+='<div class="mm-seg"><b>ripples (water)</b><span><button type="button" role="radio" aria-checked="'+(rv===1)+'" data-dec="ripples" data-v="1">on</button><button type="button" role="radio" aria-checked="'+(rv===0)+'" data-dec="ripples" data-v="0">off</button></span></div>';
  h+='</section>';
  order.forEach(function(R){
    h+='<section class="mm-room'+(R.id===here?' here':'')+'"><h3>'+R.name+(R.id===here?' <span>here</span>':'')+(R.door?' <em>applies in the room</em>':'')+'</h3>';
    R.rows.forEach(function(r){
      var v=r.get();
      h+='<label><span>'+r.label+'</span><input type="range" min="'+r.min+'" max="'+r.max+'" step="1" value="'+v+'" data-k="'+r.k+'" aria-label="'+R.name+' '+r.label+'"><output>'+v+'</output></label>';
    });
    h+='</section>';
  });
  h+='<p class="mm-foot"><button type="button" class="mm-reset">reset all</button><span>'+NEXT+'</span></p>';
  pl.innerHTML=h;
}
function reset(){
  ROOMS.forEach(function(R){R.rows.forEach(function(r){rm(r.k)})});
  if(T())T().reset();
  if(D2())D2().reset();
  safelight();
  poke('gj.vol');
  paint();
}
function show(on){
  if(!menu)build();
  open=!!on;menu.hidden=!open;
  var s=document.querySelector('#crumb .sig');if(s)s.setAttribute('aria-expanded',open?'true':'false');
  if(open)paint();
}
/* saved sky + film values come back on load */
function restore(){
  var t=T();if(!t)return;var o={},any=false;
  ['map','stars','starS','starG','lineA','fdens','fgap'].forEach(function(k){var v=rd('gj.tune.'+k,null);if(v!=null&&D[k]!=null){o[k]=D[k]*v/100;any=true}});
  if(any)t.set(o);
}
var tries=0;(function wait(){if(window.__u1&&__u1.ready){restore();safelight();return}if(++tries<200)setTimeout(wait,50)})();
window.GJ_MARKMENU={toggle:function(){show(!open)},show:show,get open(){return open},rooms:function(){return ROOMS.map(function(R){return {id:R.id,rows:R.rows.map(function(r){return r.label})}})}};
})();
