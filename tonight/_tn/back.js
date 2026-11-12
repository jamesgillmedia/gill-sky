/* tonight · the way home (spec K12). There is no floating pill any more: the ᑕᐣᓯ mark already in each piece's own bar
 is the way home. Its own behaviour is kept (it flies to that piece's FAR in one move); tapped again at FAR it opens
 the constellation. Only a page with no mark of its own gets a small mark in its top-left corner. Nothing here moves on its own; Reduce Motion changes nothing.
 The page that loads this sets data-tn-root (relative path to the tonight/ root) and optionally data-tn-href. */
(function(){
  var s=document.currentScript,root=(s&&s.getAttribute('data-tn-root'))||'./',href=(s&&s.getAttribute('data-tn-href'))||(root+'hub/');
  try{if(window.self!==window.top)return}catch(e){return}
  if(s&&s.getAttribute('data-tn-mode')==='own')return;   /* the piece wires its own mark (the blend: FAR first, then home) */
  var MARK=/^\s*ᑕᐣᓯ\s*$/;
  function findMark(){
    var sel='a.sig,button.sig,.sig,[data-mark],#mark,.mark,.brand,.logo,a[lang="cr"],button[lang="cr"],span[lang="cr"]';
    var c=[].slice.call(document.querySelectorAll(sel));
    [].forEach.call(document.querySelectorAll('a,button,span,div,b,strong,h1'),function(e){if(e.children.length===0&&MARK.test(e.textContent||''))c.push(e)});
    for(var i=0;i<c.length;i++){var e=c[i],r=e.getBoundingClientRect();if(!r.width||!r.height)continue;
      if(r.top<140&&r.left<window.innerWidth*0.5&&(MARK.test(e.textContent||'')||e.querySelector('svg')||/sig|mark|brand|logo/.test(e.className)))return e}
    return null}
  /* the added mark never sits on the page's own controls: first free corner wins */
  function busy(x,y){var es=document.elementsFromPoint(x,y);for(var i=0;i<es.length;i++){var e=es[i];if(e.classList&&e.classList.contains('tn-mark'))continue;if(e.closest&&e.closest('a,button,input,select,textarea,[role=button],[role=slider],label'))return true}return false}
  function place(m){var W=innerWidth,H=innerHeight,c=[['left','top'],['right','top'],['left','bottom'],['right','bottom']];
    for(var i=0;i<c.length;i++){m.style.left=m.style.right=m.style.top=m.style.bottom='';
      m.style[c[i][0]]='calc(10px + env(safe-area-inset-'+c[i][0]+',0px))';m.style[c[i][1]]='calc(8px + env(safe-area-inset-'+c[i][1]+',0px))';
      var r=m.getBoundingClientRect(),pts=[[r.left+2,r.top+2],[r.right-2,r.top+2],[r.left+2,r.bottom-2],[r.right-2,r.bottom-2],[(r.left+r.right)/2,(r.top+r.bottom)/2]],hit=false;
      for(var k=0;k<pts.length;k++){if(busy(pts[k][0],pts[k][1])){hit=true;break}}
      if(!hit)return}
    /* every corner taken: sit just below the top-left controls */
    m.style.left='calc(10px + env(safe-area-inset-left,0px))';m.style.right='';m.style.bottom='';m.style.top='calc(64px + env(safe-area-inset-top,0px))'}
  function go(e){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();window.top.location.href=href}
  function wire(fallback){
    if(document.documentElement.hasAttribute('data-tn-home'))return;
    var m=findMark();
    if(!m){if(!fallback)return;m=document.createElement('a');m.className='tn-mark';m.lang='cr';m.textContent='ᑕᐣᓯ';(document.body||document.documentElement).appendChild(m);place(m)}
    document.documentElement.setAttribute('data-tn-home',m.classList.contains('tn-mark')?'added':'own');
    if(m.classList.contains('tn-mark')){m.href=href;m.target='_top';m.setAttribute('aria-label','home · the constellation');m.addEventListener('click',go,true)}
    else if(m.tagName==='A'&&m.getAttribute('href')&&m.getAttribute('href').charAt(0)!=='#'){/* the piece's own mark link (its FAR, K12): untouched */}
    else{/* the piece's own mark flies to its FAR (K12); tapped again at FAR it goes home */
      m.addEventListener('click',function(e){var h=document.documentElement;if(!h.classList.contains('deep')&&(!location.hash||location.hash==='#')&&!document.querySelector('[role=dialog]:not([hidden])'))go(e)},true)}
    m.style.cursor='pointer';
    ['pointerdown','touchstart','mousedown'].forEach(function(t){m.addEventListener(t,function(e){e.stopPropagation()},{passive:true,capture:true})});
  }
  function later(){wire();[300,1000,2000].forEach(function(t){setTimeout(function(){wire()},t)});setTimeout(function(){wire(true)},3200)}  /* pieces that build their bar after load */
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',later);else later();
})();
