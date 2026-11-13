/* proto-shell · the theme layer's script half. css/theme.css holds the tokens (night, red); this file
   - keeps the choice (gj.theme: 'night' | 'red', per device; ?theme=red|night in the URL sets it) and puts it on <html data-theme>,
   - hands the canvas code the same tokens as one live object, GJ_THEME.pal (rebuilt from the CSS variables on every change),
   - mounts the quiet colour-mode button next to the A/B/C pills,
   - tells the shell which room you are in, so a room with its own look (Photo) keeps it: red applies everywhere else,
   - tracks what is being adjusted in the tune menu (red only: that part lights up gold for a moment).
   Night is the default and is the look the shell always had. Reduce Motion changes nothing here: no transitions, no timers that move anything.
   Modules: paint with GJ_THEME.pal; GJ_THEME.on(fn) tells you when it changed. Never hard-code a colour. */
(function(w){
'use strict';
var KEY='gj.theme',EXEMPT={photo:1},root=document.documentElement;
var pref='night',eff='night',room=null,adj=null,adjT=0,hooks=[],btn=null;
var P={name:'night'};
function lsGet(){try{return localStorage.getItem(KEY)}catch(e){return null}}
function lsSet(v){try{localStorage.setItem(KEY,v)}catch(e){}}
(function(){var q=/(?:^|[?&])theme=(night|red)(?:&|$)/.exec(location.search),v=q?q[1]:lsGet();if(q)lsSet(q[1]);pref=v==='red'?'red':'night'})();
function css(n){return getComputedStyle(root).getPropertyValue(n).trim()}
function tri(n){var v=css(n);return v==='none'||!v?null:v}
function nums(n){return css(n).split(',').map(Number)}
function hex(h){h=h.replace('#','');if(h.length===3)h=h.replace(/./g,'$&$&');return [0,2,4].map(function(i){return parseInt(h.substr(i,2),16)})}
function build(){
  P.name=eff;
  ['bg','ink','dim','meta','mint','line'].forEach(function(k){P[k]=css('--'+k)});
  P.bgRGB=css('--bg-rgb');
  P.field=nums('--c-field');P.fieldCool=nums('--c-field-cool');P.fieldWarm=nums('--c-field-warm');P.wash=tri('--c-wash');P.glow=css('--c-glow');P.core=css('--c-core');P.coreRGB=hex(css('--c-core'));P.coreCool=hex(css('--c-core-cool'));P.coreWarm=hex(css('--c-core-warm'));
  P.chapter=tri('--c-chapter');P.active=tri('--c-active');P.grid=tri('--c-grid');
  P.label=css('--c-label');P.slot=css('--c-slot');
  P.sndOn=css('--c-snd-on');P.sndOff=css('--c-snd-off');P.sndLblOn=css('--c-snd-lbl-on');P.sndLbl=css('--c-snd-lbl');
  P.railLine=css('--c-rail-line');P.railOn=css('--c-rail-on');P.railOff=css('--c-rail-off');
  P.railStarOn=css('--c-rail-star-on');P.railStarOff=css('--c-rail-star-off');P.railHead=css('--c-rail-head');
  P.adj=adj;
}
function apply(force){
  var e=(pref==='red'&&!(room&&EXEMPT[room]))?'red':'night';
  if(e===eff&&!force)return;
  eff=e;root.setAttribute('data-theme',eff);build();
  var m=document.querySelector('meta[name=theme-color]');if(m)m.setAttribute('content',P.bg);
  label();hooks.forEach(function(f){f('theme',eff)});
}
function label(){if(!btn)return;var to=pref==='red'?'night':'red';
  btn.setAttribute('aria-label','colour mode: '+pref+(EXEMPT[room]?' (this room keeps its own look)':'')+'. switch to '+to);btn.title=pref+' · switch to '+to}
var T={pal:P,get pref(){return pref},get eff(){return eff},get room(){return room},get adjusting(){return adj},
  exempt:function(k){return !!EXEMPT[k]},
  set:function(v){v=v==='red'?'red':'night';if(v===pref){return}pref=v;lsSet(v);apply(true);label();hooks.forEach(function(f){f('pref',pref)})},
  toggle:function(){T.set(pref==='red'?'night':'red')},
  /* the ladder room (null at the whole sky) */
  setRoom:function(k){k=k||null;if(k===room)return;room=k;apply();label()},
  /* red only: the part being adjusted (a room id from the tune menu) lights up gold for a moment */
  adjust:function(k,info){if(eff!=='red')return;adj=k;P.adj=adj;T.adjInfo=info||null;clearTimeout(adjT);adjT=setTimeout(function(){adj=null;P.adj=null;T.adjInfo=null;hooks.forEach(function(f){f('adj',null)})},1400);hooks.forEach(function(f){f('adj',k)})},
  on:function(f){hooks.push(f)},
  mount:function(){var lab=document.getElementById('lab');if(!lab||btn)return;btn=document.createElement('button');btn.type='button';btn.id='themeBtn';btn.innerHTML='<i></i>';
    btn.addEventListener('click',function(e){e.stopPropagation();T.toggle()});btn.addEventListener('pointerdown',function(e){e.stopPropagation()});
    lab.insertBefore(btn,lab.firstChild);label()}};
w.GJ_THEME=T;
root.setAttribute('data-theme',pref==='red'?'red':'night');
eff=pref==='red'?'red':'night';
build();
document.addEventListener('DOMContentLoaded',function(){build();T.mount();var m=document.querySelector('meta[name=theme-color]');if(m)m.setAttribute('content',P.bg)});
})(window);
