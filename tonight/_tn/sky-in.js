/* tonight · the way in from the opener's sky (restore, Nov 12).
 Pinch is the only gesture that moves you in. Once the sky has settled on the constellation, a pinch spread over a
 cluster carries on into that cluster inside the one constellation; the camera keeps going, there is no list page.
 A tap on a cluster's name shows its name and a small "open ›"; a tap anywhere else is only the ripple.
 The ᑕᐣᓯ settles this sky (its whole sky) and never leaves it.
 Desktop, the same moves and nothing new on screen: a wheel-in over a cluster is the same zoom from the pointer, a click
 is a tap; keys: + / Enter go in, ← → choose a name, Esc steps back. Nothing moves on its own and there is no Reduce
 Motion branch, so the output is the same with it on. The page that loads this sets data-tn-root (path to tonight/). */
(function(){
  var s=document.currentScript,root=(s&&s.getAttribute('data-tn-root'))||'../../';
  var O=null,on=false,chip=null,sel=-1,going=false;
  function blend(k){return new URL(root+'constellation-blend/#in/'+(k||''),location.href).href}
  function settled(){return O&&(+O.P||0)>=.9}
  /* where each cluster's name sits: the page's own list when it has one, else above that cluster's stars */
  function names(){
    if(O.clu&&O.clu.length)return O.clu.map(function(c){return {k:c.k,x:c.x,y:c.y,tint:c.tint}});
    var pts=O.pts||[],b={};
    for(var i=0;i<pts.length;i++){var p=pts[i];if(!p||!p.node||p.chap==null||p.chap<0||!isFinite(p.px))continue;var q=b[p.chap]||(b[p.chap]={x0:1e9,y0:1e9,x1:-1e9,y1:-1e9});
      q.x0=Math.min(q.x0,p.px);q.y0=Math.min(q.y0,p.py);q.x1=Math.max(q.x1,p.px);q.y1=Math.max(q.y1,p.py)}
    var K=['film','photo','objects','sound','about'],T=['150,220,255','170,245,212','255,236,205','255,182,176','214,222,236'];
    return Object.keys(b).map(function(i){var q=b[i];return {k:K[i]||'',x:(q.x0+q.x1)/2,y:q.y0-14,tint:T[i]||'214,222,236'}})}
  /* the cluster under a point: its stars' box, padded */
  function clusterAt(x,y,pad){var pts=O.pts||[],b={},best=null,bd=1e9;
    for(var i=0;i<pts.length;i++){var p=pts[i];if(!p||!p.node||p.chap==null||p.chap<0||!isFinite(p.px))continue;var q=b[p.chap]||(b[p.chap]={x0:1e9,y0:1e9,x1:-1e9,y1:-1e9,sx:0,sy:0,n:0});
      q.x0=Math.min(q.x0,p.px);q.y0=Math.min(q.y0,p.py);q.x1=Math.max(q.x1,p.px);q.y1=Math.max(q.y1,p.py);q.sx+=p.px;q.sy+=p.py;q.n++}
    var nm=names();
    Object.keys(b).forEach(function(i){var q=b[i];if(x<q.x0-pad||x>q.x1+pad||y<q.y0-pad-30||y>q.y1+pad)return;var d=Math.hypot(x-q.sx/q.n,y-q.sy/q.n);if(d<bd){bd=d;best=nm[i]?nm[i].k:null}});
    return best}
  function nameAt(x,y){var nm=names(),hit=-1;nm.forEach(function(c,i){if(Math.abs(x-c.x)<=Math.max(40,c.k.length*5+18)&&Math.abs(y-c.y)<=20)hit=i});return hit}
  /* the chip: the name in its tint, then "open ›" — text in the sky with one hairline, no box */
  function chipOn(i){var nm=names(),c=nm[i];if(!c)return;sel=i;
    if(!chip){chip=document.createElement('div');chip.className='tn-chip';chip.innerHTML='<span class="nm"></span><a class="op" href="#">open ›</a>';document.body.appendChild(chip);
      chip.addEventListener('pointerdown',function(e){e.stopPropagation()},true);
      chip.querySelector('a').addEventListener('click',function(e){e.preventDefault();e.stopPropagation();go(chip.getAttribute('data-k'))})}
    chip.setAttribute('data-k',c.k);chip.querySelector('.nm').textContent=c.k;chip.querySelector('.nm').style.color='rgb('+c.tint+')';
    chip.querySelector('a').href=blend(c.k);chip.hidden=false;
    var w=chip.offsetWidth,x=Math.max(10,Math.min(innerWidth-w-10,c.x-w/2)),y=c.y+14;if(y>innerHeight-60)y=c.y-50;
    chip.style.transform='translate('+x.toFixed(0)+'px,'+y.toFixed(0)+'px)';requestAnimationFrame(function(){chip.classList.add('on')})}
  function chipOff(){sel=-1;if(chip){chip.classList.remove('on');chip.hidden=true}}
  /* hand the move on: the sky keeps zooming toward the point for a moment, then the constellation carries on */
  function go(k,x,y){if(going)return;going=true;chipOff();
    var st=document.getElementById('stage')||document.body,nm=names(),c=null;nm.forEach(function(q){if(q.k===k)c=q});
    var ox=x!=null?x:(c?c.x:innerWidth/2),oy=y!=null?y:(c?c.y+40:innerHeight/2);
    document.documentElement.classList.add('tn-going');st.style.transformOrigin=ox.toFixed(0)+'px '+oy.toFixed(0)+'px';
    var url=blend(k);setTimeout(function(){try{window.top.location.href=url}catch(e){location.href=url}},260)}
  function start(){
    O=window.GJ_OPENER;if(!O||!document.body)return setTimeout(start,60);
    if(/^#sky/.test(location.hash)){if(O.set)O.set(1);else O.go(1);history.replaceState(null,'',location.pathname+location.search)}
    var st=document.getElementById('stage');if(!st)return;
    /* taps and pinches: listened to, never stopped, so the ripple and the opener's own pinch stay as they are */
    var tp={},pz=null,down=null;
    st.addEventListener('pointerdown',function(e){tp[e.pointerId]={x:e.clientX,y:e.clientY};var ks=Object.keys(tp);
      if(ks.length===1)down={x:e.clientX,y:e.clientY,t:performance.now(),id:e.pointerId};else down=null;
      if(ks.length===2&&settled()){var a=tp[ks[0]],b=tp[ks[1]];pz={d:Math.hypot(a.x-b.x,a.y-b.y)||1,cx:(a.x+b.x)/2,cy:(a.y+b.y)/2};chipOff()}},true);
    st.addEventListener('pointermove',function(e){if(!tp[e.pointerId])return;tp[e.pointerId]={x:e.clientX,y:e.clientY};var ks=Object.keys(tp);
      if(pz&&ks.length>=2&&settled()){var a=tp[ks[0]],b=tp[ks[1]],d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d/pz.d>1.45){var k=clusterAt(pz.cx,pz.cy,70);var x=pz.cx,y=pz.cy;pz=null;go(k||'',x,y)}}},true);
    function up(e){var d=down;delete tp[e.pointerId];if(Object.keys(tp).length<2)pz=null;down=null;
      if(!d||d.id!==e.pointerId||e.type==='pointercancel')return;
      if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>8||performance.now()-d.t>450)return;
      if(!settled()){chipOff();return}
      var i=nameAt(e.clientX,e.clientY);if(i>=0)chipOn(i);else chipOff()}
    st.addEventListener('pointerup',up,true);st.addEventListener('pointercancel',up,true);
    /* desktop: a wheel-in at the settled sky is the same zoom, from the pointer */
    var acc=0,accT=0,onT=0;
    st.addEventListener('wheel',function(e){if(!settled()){onT=performance.now();return}if(performance.now()-onT<450)return;
      var dy=e.deltaY*(e.deltaMode===1?18:1);if(dy>=0){acc=0;return}
      e.preventDefault();e.stopPropagation();var t=performance.now();if(t-accT>500)acc=0;accT=t;acc+=-dy*(e.ctrlKey?4:1);
      if(acc>=180){acc=0;go(clusterAt(e.clientX,e.clientY,60)||'',e.clientX,e.clientY)}},{capture:true,passive:false});
    /* keys at the settled sky; before it settles the opener's own keys run it */
    addEventListener('keydown',function(e){var t=e.target;if(t&&t.closest&&t.closest('#ambui,input,select,textarea'))return;
      if(t&&t.closest&&t.closest('.tn-chip a')&&(e.key==='Enter'||e.key===' '))return;
      if(!settled())return;var k=e.key,n=names().length;
      if(k==='Enter'||k==='+'||k==='='||k==='ArrowUp'){e.preventDefault();e.stopPropagation();go(sel>=0?names()[sel].k:'');return}
      if(k==='ArrowRight'||k==='ArrowLeft'){e.preventDefault();e.stopPropagation();if(!n)return;var i=sel<0?(k==='ArrowRight'?0:n-1):(sel+(k==='ArrowRight'?1:n-1))%n;chipOn(i);return}
      if(k==='Escape'&&sel>=0){e.preventDefault();e.stopPropagation();chipOff()}},true);
    /* the mark: this sky is home. It settles the sky in one move and never leaves. */
    var m=document.querySelector('#hud .sig,a.sig');
    if(m){m.setAttribute('href','./');m.removeAttribute('target');m.setAttribute('aria-label','the whole sky');
      m.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();chipOff();O.go(1)},true);
      ['pointerdown','touchstart','mousedown'].forEach(function(t){m.addEventListener(t,function(e){e.stopPropagation()},{passive:true,capture:true})})}
    /* the "pinch in, or tap" line leaves the reading order once it has faded */
    (function hint(){requestAnimationFrame(hint);var foot=document.getElementById('foot');if(!foot)return;var gone=foot.classList.contains('gone')||(+O.P||0)>=.03;
      if(gone&&foot.getAttribute('aria-hidden')!=='true')foot.setAttribute('aria-hidden','true');else if(!gone&&foot.getAttribute('aria-hidden')==='true')foot.removeAttribute('aria-hidden');
      if(!settled()&&sel>=0)chipOff()})();
    addEventListener('resize',chipOff);
    addEventListener('pageshow',function(e){if(e.persisted){going=false;document.documentElement.classList.remove('tn-going')}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
