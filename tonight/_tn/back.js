/* tonight · shared back-to-constellation control. The page that loads this sets data-tn-root on the script tag
   (relative path to the tonight/ root). Nothing here moves on its own; Reduce Motion changes nothing. */
(function(){
  var s=document.currentScript,root=(s&&s.getAttribute('data-tn-root'))||'./',lbl=(s&&s.getAttribute('data-tn-label'))||'constellation',href=(s&&s.getAttribute('data-tn-href'))||(root+'hub/');
  try{if(window.self!==window.top)return}catch(e){return}   /* framed (opener shell, embedded index): the outer page carries the control */
  function add(){
    if(document.querySelector('.tn-back'))return;
    var a=document.createElement('a');a.className='tn-back';a.href=href;a.target='_top';
    a.setAttribute('aria-label','back to the constellation');a.innerHTML='<i aria-hidden="true"></i>'+lbl;
    a.addEventListener('click',function(e){e.stopPropagation()},true);
    ['pointerdown','touchstart','mousedown'].forEach(function(t){a.addEventListener(t,function(e){e.stopPropagation()},{passive:true})});
    (document.body||document.documentElement).appendChild(a);
  }
  if(document.body)add();else document.addEventListener('DOMContentLoaded',add);
})();
