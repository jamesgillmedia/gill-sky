/* tonight · the way back (restore, Nov 12). Nothing floats, nothing is drawn in another face, no page is taken over.
 - In the opener's frame it stands aside (the outer page has its own mark).
 - A piece's own ᑕᐣᓯ that pointed off the page (the old index, the tiled moon, the opener) now flies to the whole sky:
   the constellation, at its whole field (K12). The piece's own in-page mark keeps its own job (its own FAR); pressed
   again at that FAR, it flies to the whole sky.
 - Entered from the constellation: Esc at the piece's top level, a pinch-out at its top, or Back goes out one level, to
   the star you entered from (the constellation saved its camera when you went in). A page with no way out of its own
   gets one quiet "‹" (no mark is added).
 Nothing here moves on its own; there is no Reduce Motion branch. The page sets data-tn-root (path to tonight/). */
(function(){
  var s=document.currentScript,root=(s&&s.getAttribute('data-tn-root'))||'./';
  try{if(window.self!==window.top)return}catch(e){return}
  if(s&&s.getAttribute('data-tn-mode')==='own')return;
  var SKY=new URL(root+'#far',location.href),ROOT=new URL(root,location.href);
  var OFF=[new URL(root+'constellation-blend/',location.href).pathname,new URL(root+'hub/',location.href).pathname,new URL(root+'tiled-moon/',location.href).pathname,ROOT.pathname,ROOT.pathname+'index.html'];
  function ret(){try{var r=JSON.parse(sessionStorage.getItem('tn-ret')||'null'),room=sessionStorage.getItem('tn-room');
      if(r&&room&&location.pathname.indexOf(room)===0)return r}catch(e){}return null}
  function atTop(){var h=document.documentElement;return !h.classList.contains('deep')&&(!location.hash||location.hash==='#'||location.hash==='#/')&&!document.querySelector('[role=dialog]:not([hidden]),dialog[open]')}
  function sky(){location.href=SKY.href}
  /* one level out, to the star you came in from */
  var leaving=false;
  function out(){if(leaving)return;var r=ret();if(!r){sky();return}leaving=true;setTimeout(function(){leaving=false},1500);
    var ref='';try{ref=document.referrer?new URL(document.referrer).pathname:''}catch(e){}
    /* a piece with its own ladder keeps one history entry per place: step over them all, back to the star */
    var n=1+(window.LAB&&LAB.layer&&LAB.layer.depth?LAB.layer.depth():0);
    if(ref===ROOT.pathname&&history.length>n){history.go(-n);return}
    location.href=new URL(r.href,location.href).pathname+'#back'}
  var MARK=/^\s*ᑕᐣᓯ\s*$/;
  function marks(){var c=[].slice.call(document.querySelectorAll('a.sig,button.sig,.sig'));
    [].forEach.call(document.querySelectorAll('a,button'),function(e){if(e.children.length===0&&MARK.test(e.textContent||'')&&c.indexOf(e)<0)c.push(e)});
    return c.filter(function(e){return MARK.test(e.textContent||'')&&!e.classList.contains('tn-ret')})}
  function wireMark(m){if(m.hasAttribute('data-tn-w'))return;m.setAttribute('data-tn-w','1');
    var href=m.tagName==='A'?m.getAttribute('href'):null,u=null;try{u=href?new URL(href,location.href):null}catch(e){}
    if(u&&(OFF.indexOf(u.pathname)>=0||(u.pathname!==location.pathname&&ret()))){m.setAttribute('href',SKY.href);m.removeAttribute('target');m.setAttribute('aria-label','the whole sky');return}
    /* its own mark (its own FAR): its own job first; pressed again at that FAR, the whole sky */
    m.addEventListener('click',function(e){if(atTop()&&(!u||u.pathname===location.pathname)){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();sky()}},true)}
  function wire(){var ms=marks();ms.forEach(wireMark);
    var x=document.querySelector('.tn-ret'),r=ret();
    if(ms.length||!r){if(x)x.remove();return}
    if(x)return;
    /* entered from the constellation and no way out of its own: one quiet "‹", top left, nothing else */
    var a=document.createElement('a');a.className='tn-ret';a.href=new URL(r.href,location.href).pathname+'#back';a.setAttribute('aria-label','back to the constellation, where you were');a.textContent='‹';
    a.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();out()},true);
    ['pointerdown','touchstart','mousedown'].forEach(function(t){a.addEventListener(t,function(e){e.stopPropagation()},{passive:true,capture:true})});
    (document.body||document.documentElement).appendChild(a)}
  /* pieces with their own ladder of layers (the Darkroom and the Photo lab: LAB.layer, where Back / Esc / pinch-out
     rise one place): at the bottom of that ladder they used to reload themselves; now the last step out is ours */
  function hookLab(){var L=window.LAB;if(!L||!L.leave||L.leave._tn)return;var orig=L.leave;
    L.leave=function(href){var u=null;try{u=new URL(href||'',location.href)}catch(e){}
      if(!u||u.pathname===location.pathname||OFF.indexOf(u.pathname)>=0){if(ret())out();else sky();return}return orig.apply(this,arguments)};L.leave._tn=1}
  function own(){return !!(window.LAB&&window.LAB.layer)}
  /* its ladder's last place (the room itself): Esc there, or Back to below it, is the step out to the star */
  addEventListener('keydown',function(e){if(e.key!=='Escape'||!own()||!ret())return;var d=LAB.layer.depth(),t=LAB.layer.top();
    setTimeout(function(){if(!e.defaultPrevented&&d<=1&&LAB.layer.depth()===d&&(!d||(LAB.rooms&&t===LAB.rooms.current)))out()},0)});
  addEventListener('popstate',function(){if(!own()||!ret())return;setTimeout(function(){if(LAB.layer.depth()===0)out()},0)});
  /* Esc and pinch-out at the piece's top level: only when the piece itself did not use them */
  addEventListener('keydown',function(e){if(e.key!=='Escape'||!ret()||own())return;setTimeout(function(){if(!e.defaultPrevented&&atTop())out()},0)});
  var T=null;function dist(t){return Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY)||1}
  function labTop(){var L=window.LAB.layer,d=L.depth();return d===0||(d===1&&LAB.rooms&&L.top()===LAB.rooms.current)}
  function top2(){return own()?labTop():atTop()}
  addEventListener('touchstart',function(e){T=(e.touches.length===2&&!e.defaultPrevented&&ret()&&top2()&&(!window.visualViewport||visualViewport.scale<=1.01)&&(window.scrollY||0)<4)?{d:dist(e.touches),h:location.hash}:null},{passive:true});
  addEventListener('touchmove',function(e){if(!T||e.touches.length!==2)return;if(dist(e.touches)/T.d<.55&&location.hash===T.h&&top2()){T=null;out()}},{passive:true});
  addEventListener('touchend',function(e){if(e.touches.length<2)T=null},{passive:true});
  /* pieces that build their bar after load */
  function later(){wire();hookLab();[400,1200,2500].forEach(function(t){setTimeout(function(){wire();hookLab()},t)})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',later);else later();
})();
