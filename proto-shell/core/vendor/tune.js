/* proto-shell · the mark menu: list · contact · tune.
   Context-aware: reads the ladder room/level (and the active module's `tune` list) and shows that
   context's sliders first. Motion, safelight and ripples stay pinned at the bottom. "all rooms"
   is one tap away. Values are kept per room on this device. Reset this room / reset all.
   The menu repaints live when the ladder changes while it is open.
   Slider widgets and hooks are the same as preview-film-snap tune.js (GJ_TUNE, gj.vol / gj.flash,
   gj.amb.*, GJ_DEC). Nothing here grades a photograph or a film frame. */
(function(){
'use strict';
var $=function(id){return document.getElementById(id)};
function rd(k,d){try{var v=localStorage.getItem(k);if(v==null||v==='')return d;v=+v;return isFinite(v)?v:d}catch(e){return d}}
function wr(k,v){try{localStorage.setItem(k,String(v))}catch(e){}}
function rm(k){try{localStorage.removeItem(k)}catch(e){}}
function T(){return window.GJ_TUNE||null}
function tuneRow(k,label,min,max,def,note){
  return {k:'gj.tune.'+k,label:label,min:min,max:max,def:100,note:note,hook:'tune',
    get:function(){return rd('gj.tune.'+k,100)},
    apply:function(v){var t=T();if(!t)return;var o={};o[k]=def*v/100;t.set(o)}};
}
function lsRow(key,label,min,max,def,scale,after){
  return {k:key,label:label,min:min,max:max,def:def,hook:'ls',
    get:function(){var v=rd(key,null);return v==null?def:Math.round(v*scale)},
    apply:function(v,save){if(save)wr(key,v/scale);if(after)after(key)}};
}
function poke(key){try{window.dispatchEvent(new StorageEvent('storage',{key:key}))}catch(e){}}
function setFlash(key){var t=T();if(t)t.set({flash:rd('gj.flash',.6)});try{document.documentElement.style.setProperty('--flash',String(rd('gj.flash',.6)))}catch(e){}}
var D=(window.GJ_TUNE&&GJ_TUNE.defaults&&GJ_TUNE.defaults())||{map:1.3,stars:1.2,lineA:1,starS:1,starG:1,fdens:1,fgap:1};

/* Built-in room sets. A module may replace its chapter's context set with module.tune. */
var ROOMS=[
  {id:'sky',name:'sky',rows:[
    lsRow('gj.tune.mood','mood',0,200,100,1),
    tuneRow('map','star spread',60,160,D.map),
    tuneRow('starG','glow',0,200,D.starG),
    tuneRow('stars','stars',40,180,D.stars),
    tuneRow('starS','star size',50,200,D.starS),
    tuneRow('lineA','lines',0,200,D.lineA)]},
  {id:'film',name:'film',rows:[
    tuneRow('fdens','snap density',60,140,D.fdens),
    tuneRow('fgap','frame gap',25,300,D.fgap)]},
  {id:'sound',name:'sound',rows:[
    lsRow('gj.vol','volume',0,100,100,100,poke),
    lsRow('gj.flash','flash',0,100,60,100,setFlash),
    lsRow('gj.sound.invert','invert',0,100,0,1)]},
  {id:'objects',name:'objects',door:'../objects/',rows:[
    lsRow('gj.amb.objects.glow','glow',0,150,100,1),
    lsRow('gj.amb.objects.haze','haze',0,250,100,1),
    lsRow('gj.amb.objects.stars','rings',0,200,100,1),
    lsRow('gj.amb.objects.lamp','lamp',20,160,100,1)]},
  {id:'spaces',name:'spaces',door:'../spaces/forest-garden/',rows:[
    lsRow('gj.amb.garden.day','day – night',0,100,0,1),
    lsRow('gj.amb.garden.haze','haze',0,300,100,1),
    lsRow('gj.amb.garden.glow','glow',0,150,100,1),
    lsRow('gj.amb.garden.star','stars',0,200,100,1)]},
  {id:'photo',name:'photo',rows:[
    lsRow('gj.photo.room','room light',0,200,100,1),
    lsRow('gj.photo.lamp','lamp glow',0,200,100,1)]}
];
/* focused context rows (subset shown first). "all rooms" reveals the rest. */
var CTX_FOCUS={
  sky:['gj.tune.mood','gj.tune.map','gj.tune.starG'],
  film:['gj.tune.fdens','gj.tune.fgap'],
  sound:['gj.vol','gj.flash','gj.sound.invert'],
  objects:['gj.amb.objects.glow','gj.amb.objects.haze','gj.amb.objects.stars','gj.amb.objects.lamp'],
  spaces:['gj.amb.garden.day','gj.amb.garden.haze','gj.amb.garden.glow'],
  photo:['gj.photo.room','gj.photo.lamp']
};
var DECS=[
  {k:'film',n:'1 · film board',o:[['snap','both, snap'],['map','m4 map only'],['board','site-3d board only']]},
  {k:'mark',n:'2 · mark in the journey',o:[['fusion','fusion'],['full','full'],['partial','partial (fewer stars)']]},
  {k:'open',n:'3 · opening one film',o:[['mixed','board straight · map reveal'],['player','straight to the page'],['reveal','tile reveal always'],['old','old: tap, tap again']]},
  {k:'photo',n:'4 · photo',o:[['B','B · dark, night sky'],['A','A · silver shelf']]}
];
function D2(){return window.GJ_DEC||null}
function rowFromSpec(s){
  if(s&&s.get&&s.apply)return s;
  if(!s)return null;
  if(s.ls)return lsRow(s.ls,s.label,s.min,s.max,s.def,s.scale||1,s.after);
  if(s.key||s.k){var key=s.key||s.k;if(key.indexOf('gj.')===0)return lsRow(key,s.label,s.min,s.max,s.def!=null?s.def:100,s.scale||1,s.after);
    return tuneRow(key,s.label,s.min,s.max,s.def!=null?s.def:(D[key]!=null?D[key]:1),s.note)}
  return null;
}
function moduleRows(mod){
  if(!mod||!mod.tune||!mod.tune.length)return null;
  var out=[];mod.tune.forEach(function(s){var r=rowFromSpec(s);if(r)out.push(r)});
  return out.length?out:null;
}
function ctx(){
  var st=(window.__u1&&__u1.cur)||{lv:0,k:null,id:null};
  var room=(st.lv>0&&st.k)?String(st.k):'sky';
  var lv=st.lv||0;
  var levelName=lv===0?'sky':lv===1?'mid':lv===2?'board':lv===3?'work':'';
  var mod=(window.__shell&&__shell.mod)||(window.Shell&&Shell.mod)||null;
  return {room:room,lv:lv,levelName:levelName,mod:mod,st:st};
}
function roomById(id){for(var i=0;i<ROOMS.length;i++)if(ROOMS[i].id===id)return ROOMS[i];return null}
function contextRows(c){
  var R=roomById(c.room);
  var rows=null;
  if(c.mod&&c.mod.chapter===c.room)rows=moduleRows(c.mod);
  if(!rows&&R)rows=R.rows;
  if(!rows)return [];
  var focus=CTX_FOCUS[c.room];
  if(!focus)return rows.slice();
  /* if the module supplied rows, show those as the context set; otherwise the focused subset */
  if(c.mod&&c.mod.chapter===c.room&&c.mod.tune)return rows.slice();
  return rows.filter(function(r){return focus.indexOf(r.k)>=0});
}
var menu=null,open=false,tuneOn=false,allOn=false,hooked=false;
function safelight(){
  var G=D2(),el=document.getElementById('safelight');
  if(!el){el=document.createElement('div');el.id='safelight';el.setAttribute('aria-hidden','true');(document.getElementById('stage')||document.body).appendChild(el)}
  var on=G&&+G.get('safelight')===1,k=G?Math.max(0,Math.min(100,+G.get('safeK')))/100:0.6;
  el.hidden=!on;el.style.setProperty('--safe',on?String(k):'0');
}
function build(){
  menu=document.createElement('div');menu.id='markmenu';menu.hidden=true;menu.setAttribute('role','dialog');menu.setAttribute('aria-label','the mark menu');
  menu.innerHTML='<nav class="mm-top"><a href="list/">list</a><a href="contact/">contact</a><button type="button" class="mm-tune" aria-expanded="false">tune</button></nav>'+
    '<nav class="mm-rooms" aria-label="rooms"><button type="button" data-go="sky">sky</button><button type="button" data-go="film">film</button><button type="button" data-go="sound">sound</button><button type="button" class="mm-off" disabled aria-disabled="true" title="not in this shell yet">objects</button><button type="button" class="mm-off" disabled aria-disabled="true" title="not in this shell yet">spaces</button><button type="button" data-go="photo">photo</button></nav>'+
    '<div class="mm-plate" hidden></div>';
  document.body.appendChild(menu);
  menu.addEventListener('pointerdown',function(e){e.stopPropagation()});
  menu.addEventListener('click',function(e){
    e.stopPropagation();
    var b=e.target.closest('[data-go]');
    if(b){if(window.__depth)__depth.goTo(b.getAttribute('data-go'));return}
    if(e.target.closest('.mm-tune')){tuneOn=!tuneOn;paint();return}
    if(e.target.closest('.mm-all')){allOn=!allOn;paint();return}
    if(e.target.closest('.mm-reset-room')){resetRoom();return}
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
function findRow(k){for(var i=0;i<ROOMS.length;i++)for(var j=0;j<ROOMS[i].rows.length;j++)if(ROOMS[i].rows[j].k===k)return ROOMS[i].rows[j];
  var mod=(window.__shell&&__shell.mod)||(window.Shell&&Shell.mod)||null;
  var extra=moduleRows(mod);if(extra)for(var i=0;i<extra.length;i++)if(extra[i].k===k)return extra[i];
  return null}
function rowsHtml(rows){
  var h='';rows.forEach(function(r){var v=r.get();
    h+='<label><span>'+r.label+'</span><input type="range" min="'+r.min+'" max="'+r.max+'" step="1" value="'+v+'" data-k="'+r.k+'" aria-label="'+r.label+'"><output>'+v+'</output></label>'});
  return h;
}
function paint(){
  if(!menu)return;
  var pl=menu.querySelector('.mm-plate'),tb=menu.querySelector('.mm-tune');
  tb.setAttribute('aria-expanded',tuneOn?'true':'false');tb.classList.toggle('on',tuneOn);
  pl.hidden=!tuneOn;if(!tuneOn)return;
  var c=ctx(),here=c.room,level=c.levelName;
  var title=here+(level&&level!==here?' · '+level:'');
  var h='<section class="mm-ctx"><h3>'+title+' <span>here</span></h3>';
  h+=rowsHtml(contextRows(c));
  h+='</section>';
  h+='<button type="button" class="mm-all" aria-expanded="'+(allOn?'true':'false')+'">'+(allOn?'close rooms':'all rooms')+'</button>';
  if(allOn){
    h+='<div class="mm-more">';
    ROOMS.forEach(function(R){
      if(R.id===here)return;
      h+='<section class="mm-room"><h3>'+R.name+(R.door?' <em>applies in the room</em>':'')+'</h3>';
      h+=rowsHtml(R.rows);
      h+='</section>';
    });
    h+='<section class="mm-dec"><h3>decisions <em>the hero opener keeps the full mark in every mode; the Sound waveform player is in every combination</em></h3>';
    var G=D2();
    DECS.forEach(function(d){
      var v=G?G.get(d.k):'';
      h+='<div class="mm-seg" role="radiogroup" aria-label="'+d.n+'"><b>'+d.n+'</b><span>';
      d.o.forEach(function(o){h+='<button type="button" role="radio" aria-checked="'+(v===o[0])+'" data-dec="'+d.k+'" data-v="'+o[0]+'">'+o[1]+'</button>'});
      h+='</span></div>';
    });
    h+='</section></div>';
  }
  var G=D2();
  var mot=G?G.get('motion'):100,snap=G?G.get('snapAt'):34,sl=G?+G.get('safelight'):0,sk=G?+G.get('safeK'):60,rv=G?+G.get('ripples'):1;
  h+='<section class="mm-globals"><h3>globals</h3>';
  h+='<label><span>motion</span><input type="range" min="0" max="200" step="1" value="'+mot+'" data-dec-r="motion" aria-label="motion"><output>'+mot+'</output></label>';
  h+='<label><span>snap threshold</span><input type="range" min="15" max="70" step="1" value="'+snap+'" data-dec-r="snapAt" aria-label="snap threshold"><output>'+snap+'</output></label>';
  h+='<div class="mm-seg"><b>safelight (warm edge glow)</b><span><button type="button" role="radio" aria-checked="'+(sl===0)+'" data-dec="safelight" data-v="0">off</button><button type="button" role="radio" aria-checked="'+(sl===1)+'" data-dec="safelight" data-v="1">on</button></span></div>';
  h+='<label><span>safelight strength</span><input type="range" min="0" max="100" step="1" value="'+sk+'" data-dec-r="safeK" aria-label="safelight strength, 0 to 1"><output>'+(sk/100).toFixed(2)+'</output></label>';
  h+='<div class="mm-seg"><b>ripples (water)</b><span><button type="button" role="radio" aria-checked="'+(rv===1)+'" data-dec="ripples" data-v="1">on</button><button type="button" role="radio" aria-checked="'+(rv===0)+'" data-dec="ripples" data-v="0">off</button></span></div>';
  h+='</section>';
  h+='<p class="mm-foot"><span class="mm-resets"><button type="button" class="mm-reset mm-reset-room">reset '+here+'</button><button type="button" class="mm-reset">reset all</button></span></p>';
  pl.innerHTML=h;
  /* highlight the current room in the nav */
  menu.querySelectorAll('.mm-rooms [data-go]').forEach(function(el){el.classList.toggle('on',el.getAttribute('data-go')===here)});
}
function resetRoom(){
  var c=ctx(),R=roomById(c.room);
  var all=(c.mod&&c.mod.chapter===c.room&&moduleRows(c.mod))||(R?R.rows:contextRows(c));
  all.forEach(function(r){rm(r.k)});
  all.forEach(function(r){r.apply(r.get(),true)});
  poke('gj.vol');setFlash();
  paint();
}
function reset(){
  ROOMS.forEach(function(R){R.rows.forEach(function(r){rm(r.k)})});
  var extra=moduleRows((window.__shell&&__shell.mod)||(window.Shell&&Shell.mod));
  if(extra)extra.forEach(function(r){rm(r.k)});
  if(T())T().reset();
  if(D2())D2().reset();
  poke('gj.vol');setFlash();safelight();
  paint();
}
function show(on){
  if(!menu)build();
  open=!!on;menu.hidden=!open;
  var s=document.querySelector('#crumb .sig');if(s)s.setAttribute('aria-expanded',open?'true':'false');
  if(open)paint();
}
function hookLadder(){
  if(hooked)return;
  var sh=window.__shell;if(!sh||!sh.ladder)return;
  var prev=sh.ladder.onChange;
  sh.ladder.onChange=function(cur,old){
    if(typeof prev==='function')prev(cur,old);
    if(open&&tuneOn)paint();
  };
  hooked=true;
}
function restore(){
  var t=T();if(t){var o={},any=false;
    ['map','stars','starS','starG','lineA','fdens','fgap'].forEach(function(k){var v=rd('gj.tune.'+k,null);if(v!=null&&D[k]!=null){o[k]=D[k]*v/100;any=true}});
    if(any)t.set(o)}
  setFlash();
  safelight();
}
var tries=0;(function wait(){if(window.__u1&&__u1.ready&&window.__shell&&__shell.ladder){restore();hookLadder();return}if(++tries<200)setTimeout(wait,50)})();
window.GJ_MARKMENU={toggle:function(){show(!open)},show:show,get open(){return open},
  context:function(){return ctx()},
  rooms:function(){return ROOMS.map(function(R){return {id:R.id,rows:R.rows.map(function(r){return r.label})}})}};
})();
