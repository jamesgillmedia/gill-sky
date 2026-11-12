/* The board level: the chapter's work, laid out in its own shape.
 Film floats offset 2.39 cards at different depths. Photo is loose stacks of
 rotated prints. Sound is offset waveform bands that play in place. Objects are
 cut-outs on an off-kilter grid. About is text. Every board but About flips to
 a list. The cards grow out of the thumbnails they were in the constellation. */
(function(){
'use strict';
var ctx=null,host=null,K=null,items=[],flip={},opened=0,io=null,bau=null,bk=null,raf=0;
var EASE='cubic-bezier(.22,.7,.2,1)';
var COVER={togo:'media/pro2/img/sound/to-go-480.webp',gone:'media/pro2/img/sound/purple.webp',noproblem:'media/pro2/img/sound/moonloop.webp',lostintime:'media/pro2/img/sound/moonloop.webp',equals:'media/pro2/img/sound/moonloop.webp',ii:'media/pro2/img/sound/moonloop.webp'};
var SID={togo:'sound/to-go',gone:'sound/mothers-moniker'};
function $(id){return document.getElementById(id)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function mmss(s){s=Math.max(0,s|0);return (s/60|0)+':'+(s%60<10?'0':'')+(s%60)}
function untitled(t){return !t||t==='untitled'||/^photograph\s+\d+$/i.test(t)}
function typeOf(it){var m=(it.meta||'').split(' · ');return m[0]||''}
function lenOf(it){var m=(it.meta||'').split(' · ');return m.length>1&&/^\d+:\d\d$/.test(m[1])?m[1]:''}

function filmLine(it){
  var t=typeOf(it),bits=[];
  if(t&&!/shots/.test(t))bits.push(t);
  var l=lenOf(it);if(l)bits.push(l.replace(/^0(\d:)/,'$1'));
  if(it.year&&String(it.meta||'').indexOf(String(it.year))<0)bits.push(it.year);
  return bits.join(' · ');
}
function summary(k){
  if(k==='film'){
    var n={};items.forEach(function(it){var t=typeOf(it);if(/shots/.test(t))t='reel';n[t]=(n[t]||0)+1});
    var order=['commercial','music video','brand film','short','reel'],out=[];
    order.forEach(function(t){if(n[t])out.push(n[t]+' '+(t==='reel'&&n[t]>1?'reels':t==='short'&&n[t]>1?'shorts':t))});
    return out.join(' · ');
  }
  if(k==='photo')return 'untitled prints · no place or year in the files';
  if(k==='objects')return 'joio.co ceramics · Spirit Eye · carving and design';
  if(k==='sound')return 'Lost Coffee · Mothers Moniker';
  if(k==='progress')return 'the carve, the three boards, and the Lost Coffee songs';
  return '';
}
function count(k){
  var n=items.length;
  if(k==='film')return n+' films';
  if(k==='photo')return n+' photographs';
  if(k==='objects')return n+' works';
  if(k==='sound')return n+' songs';
  if(k==='progress')return n+' in progress';
  return '';
}

/* ---------- shapes ---------- */
var FW=[88,60,74,56,82,64,70,58],FX=[0,40,12,44,6,36,22,42],FD=[1,.8,.92,.76,1,.84,.9,.78];
function filmCard(it,i){
  var m=it.media||{},q=i%FW.length,w=FW[q],x=Math.min(FX[q],100-w);
  var narrow=w<66,side=x>20?'left':'right';
  var thumb=m.thumb||m.big||'',pv=m.pv||'';
  var role=it.role||'';
  if(role==='Director · Director of Photography')role='Director · DP';
  var cap='<span class="cap"><b>'+esc(it.title)+'</b>'+(role?'<i>'+esc(role)+'</i>':'')+'<small>'+esc(filmLine(it))+'</small></span>';
  return '<a class="card fc'+(narrow?' side '+side:'')+'" href="'+esc(it.chapter+'/'+it.slug+'/')+'" data-id="'+esc(it.id)+'" style="--w:'+w+'%;--x:'+x+'%;--d:'+FD[q]+'">'+
    '<span class="fr"><img src="'+esc(thumb)+'" alt="" loading="'+(i<6?'eager':'lazy')+'" decoding="async">'+(pv?'<video muted loop playsinline preload="none" data-src="'+esc(pv)+'"></video>':'')+'</span>'+cap+'</a>';
}
var PW=[94,80,88,74,90,78],PR=[-1.6,1.2,-.6,2.1,-2.2,.8,1.6,-1.1];
function photoCard(it,i){
  var m=it.media||{},ar=(m.w&&m.h)?(m.w/m.h):.8;
  var w=PW[i%PW.length],r=PR[i%PR.length],lap=(i%3===2)?1:0;
  return '<a class="card pc'+(lap?' lap':'')+'" href="'+esc(it.chapter+'/'+it.slug+'/')+'" data-id="'+esc(it.id)+'" style="--w:'+w+'%;--r:'+r+'deg;--ar:'+ar.toFixed(3)+';--al:'+(i%2?'flex-end':'flex-start')+'">'+
    '<span class="fr"><img src="'+esc(m.thumb||m.big||'')+'" alt="" loading="'+(i<8?'eager':'lazy')+'" decoding="async"></span></a>';
}
var OS=[4,2,3,3,2,4,3,3],OY=[0,28,6,34,12,0,22,8],OR=[-.8,1.4,.4,-1.2,1,-.4,1.6,-1];
function objectCard(it,i){
  var m=it.media||{},q=i%OS.length,ar=(m.w&&m.h)?(m.w/m.h):.8;
  var sub=it._meta||it.meta||'';
  return '<a class="card oc" href="'+esc(it.chapter+'/'+it.slug+'/')+'" data-id="'+esc(it.id)+'" style="--s:'+OS[q]+';--y:'+OY[q]+'px;--r:'+OR[q]+'deg;--ar:'+Math.max(.62,Math.min(1.3,ar)).toFixed(3)+'">'+
    '<span class="fr">'+((m.thumb||m.big)?'<img src="'+esc(m.thumb||m.big)+'" alt="" loading="'+(i<6?'eager':'lazy')+'" decoding="async">':'<em>no picture of this piece</em>')+'</span>'+
    '<span class="cap"><b>'+esc(it.title)+'</b>'+(sub?'<small>'+esc(sub)+'</small>':'')+'</span></a>';
}
var SX=[0,26,8,34,4,18];
function dots(peaks,n){
  var out='',i;n=n||40;
  for(i=0;i<n;i++){
    var a=Math.floor(i/n*peaks.length),b=Math.max(a+1,Math.floor((i+1)/n*peaks.length)),p=0,j;
    for(j=a;j<b;j++)p=Math.max(p,peaks[j]||0);
    out+='<i style="--p:'+p.toFixed(2)+'"></i>';
  }
  return out;
}
function soundCard(it,i){
  var t=it.track,x=SX[i%SX.length];
  return '<div class="card sc" data-id="'+esc(it.id)+'" style="--x:'+x+'px">'+
    '<span class="fr"><img src="'+esc(COVER[t.k]||'')+'" alt="" decoding="async"></span>'+
    '<span class="mid"><b>'+esc(t.title)+'</b><small>'+esc(t.artist)+'</small><span class="dw" data-k="'+esc(t.k)+'">'+dots(t.peaks||[],36)+'</span></span>'+
    '<span class="len">'+mmss(t.dur||0)+'</span>'+
    '<button type="button" class="pp" data-play="'+esc(t.k)+'" aria-label="play '+esc(t.title)+'">▶</button></div>';
}
function listRow(it){
  var right='';
  if(K==='film')right=filmLine(it);
  else if(K==='sound')right=it.track.artist+' · '+mmss(it.track.dur||0);
  else right=it._meta||it.meta||'';
  return '<li><a class="card lr" href="'+esc((it.chapter||K)+'/'+(it.slug||'')+'/')+'" data-id="'+esc(it.id)+'"><b>'+esc(it.title)+'</b><small>'+esc(right)+'</small></a></li>';
}
function aboutBoard(){
  var d=ctx.data(),mail=d.email||'imjamesgill@gmail.com';
  return '<div class="ab">'+
    '<p class="k">about</p>'+
    '<h2>Gill James</h2>'+
    '<p class="roles">Cinematographer + Artist + Spatial Designer</p>'+
    '<p class="place">Vancouver</p>'+
    '<ol class="idx">'+
      '<li><button type="button" class="card" data-id="about/bio"><b>the bio</b><small>seven layers on the calculator, then the moon grid</small></button></li>'+
      '<li><button type="button" class="card" data-id="about/poem"><b>the poem</b><small>15 lines · ᑕᐣᓯ</small></button></li>'+
      '<li><a class="card" href="mailto:'+esc(mail)+'"><b>'+esc(mail)+'</b><small>contact</small></a></li>'+
      '<li><a class="card" href="https://www.joioco.com" rel="noopener"><b>joio.co</b><small>ceramics shop ↗</small></a></li>'+
      '<li><button type="button" class="card" data-hire="1"><b>Hire</b><small>film, objects, space and sound</small></button></li>'+
    '</ol>'+
    '<p class="proof">BMW · Coca-Cola · AXE · Band-Aid</p>'+
  '</div>';
}
function render(){
  var head='';
  if(K!=='about'){
    head='<div class="bh"><p class="nm">'+esc(K==='progress'?'in progress':K)+'<small>'+esc(count(K))+'</small></p>'+
      '<button type="button" class="fl" id="bflip" aria-pressed="'+(flip[K]?'true':'false')+'">'+(flip[K]?'board':'list')+'</button>'+
      '<p class="sum">'+esc(summary(K))+'</p></div>';
  }
  var body='';
  if(K==='about')body=aboutBoard();
  else if(flip[K]&&K==='photo')body='<div class="contactlist">'+items.map(function(it){var m=it.media||{};return '<a class="card" href="'+esc(it.chapter+'/'+it.slug+'/')+'" data-id="'+esc(it.id)+'"><img src="'+esc(m.thumb||'')+'" alt="" loading="lazy"></a>'}).join('')+'</div>';
  else if(flip[K])body='<ol class="blist">'+items.map(listRow).join('')+'</ol>';
  else if(K==='film')body='<div class="films">'+items.map(filmCard).join('')+'</div>';
  else if(K==='photo'){
    var a='',b='',ha=0,hb=0;
    items.forEach(function(it,i){var m=it.media||{},h=(m.h&&m.w)?m.h/m.w:1.25,html=photoCard(it,i);if(ha<=hb){a+=html;ha+=h}else{b+=html;hb+=h}});
    body='<div class="prints"><div class="col">'+a+'</div><div class="col">'+b+'</div></div>';
  }
  else if(K==='sound')body='<div class="bands">'+items.map(soundCard).join('')+'</div>'+
    '<p class="lives"><button type="button" class="card wv" data-id="sound/waveform">inside the waveform ›</button></p>'+
    '<p class="lives">the songs also live on <a href="https://open.spotify.com/artist/5boqZWhWg5ZwPAURnNQDYK" rel="noopener">Spotify</a> and <a href="https://music.apple.com/ca/artist/lost-coffee/1690001432" rel="noopener">Apple Music</a></p>';
  else body='<div class="objs">'+items.map(objectCard).join('')+'</div>';
  host.className='k-'+K+(flip[K]?' flipped':'');
  host.innerHTML='<div class="bwrap">'+head+body+'</div>';
  watch();
  syncDots();
}

/* ---------- previews: only cards on screen play ---------- */
function watch(){
  if(io)io.disconnect();
  if(!('IntersectionObserver' in window))return;
  io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      var v=e.target;
      if(e.isIntersecting){if(!v.src)v.src=v.getAttribute('data-src');var p=v.play();if(p&&p.catch)p.catch(function(){});v.classList.add('on')}
      else {v.pause();v.classList.remove('on')}
    });
  },{root:host,threshold:.35});
  [].forEach.call(host.querySelectorAll('video[data-src]'),function(v){io.observe(v)});
}
function stopPreviews(){
  if(io){io.disconnect();io=null}
  if(!host)return;
  [].forEach.call(host.querySelectorAll('video'),function(v){v.pause()});
}

/* ---------- songs play in place ---------- */
function audio(){
  if(bau)return bau;
  bau=document.createElement('audio');bau.preload='none';bau.id='bau';
  document.body.appendChild(bau);
  bau.addEventListener('ended',function(){bk=null;syncDots()});
  bau.addEventListener('pause',syncDots);bau.addEventListener('play',syncDots);
  return bau;
}
function track(k){var d=ctx.data();return (d.tracks||[]).filter(function(t){return t.k===k})[0]||null}
function play(k){
  var t=track(k);if(!t)return;var a=audio();
  if(bk===k&&!a.paused){a.pause();return}
  if(bk!==k){a.src=t.file;bk=k}
  var p=a.play();if(p&&p.catch)p.catch(function(){});
  loop();
}
function pause(){if(bau&&!bau.paused)bau.pause()}
function loop(){
  cancelAnimationFrame(raf);
  (function step(){syncDots();if(bau&&!bau.paused)raf=requestAnimationFrame(step)})();
}
function syncDots(){
  var a=bau,at=(a&&a.duration)?a.currentTime/a.duration:0,on=!!(a&&!a.paused);
  if(host)[].forEach.call(host.querySelectorAll('.dw'),function(w){
    var me=w.getAttribute('data-k')===bk,ds=w.children,n=ds.length,i;
    for(i=0;i<n;i++)ds[i].classList.toggle('lit',me&&i/n<=at);
    var card=w.closest('.sc');if(card){card.classList.toggle('playing',me&&on);var b=card.querySelector('.pp');if(b)b.textContent=me&&on?'❚❚':'▶'}
  });
  var r=$('srail');
  if(r&&!r.hidden){
    var t=track(bk||'togo');
    var b2=r.querySelector('.pp'),f=r.querySelector('.fill'),tl=r.querySelector('.tl'),tc=r.querySelector('.tc');
    if(b2)b2.textContent=on?'❚❚':'▶';
    if(f)f.style.width=(at*100).toFixed(2)+'%';
    if(tl&&t)tl.innerHTML='<b>'+esc(t.title)+'</b> '+esc(t.artist);
    if(tc&&t)tc.textContent=mmss(a&&a.currentTime||0)+' / '+mmss(t.dur||0);
  }
}
/* The small rail on the Sound constellation: a song is one tap away. */
function rail(on){
  var r=$('srail');if(!r)return;
  r.hidden=!on;
  if(on&&!r._b){
    r._b=1;
    r.querySelector('.pp').addEventListener('click',function(e){e.stopPropagation();play(bk||'togo')});
    r.querySelector('.bar').addEventListener('click',function(e){
      e.stopPropagation();var a=audio();if(!a.duration)return;
      var b=this.getBoundingClientRect();a.currentTime=a.duration*Math.max(0,Math.min(1,(e.clientX-b.left)/b.width));syncDots();
    });
  }
  if(on)syncDots();
}

/* ---------- growing out of the constellation ---------- */
function rectOf(el){var r=el.getBoundingClientRect();return {l:r.left,t:r.top,w:r.width,h:r.height}}
function cardsOnScreen(){
  var out=[],H=innerHeight;
  [].forEach.call(host.querySelectorAll('.card[data-id]'),function(el){var r=el.getBoundingClientRect();if(r.bottom>0&&r.top<H)out.push(el)});
  return out;
}
function grow(from){
  var els=cardsOnScreen();
  host.classList.add('growing');
  els.forEach(function(el,i){
    var id=el.getAttribute('data-id'),it=byId(id),r0=it&&from?from(it):null,r1=rectOf(el);
    el.style.transition='none';el.style.transformOrigin='0 0';
    if(r0&&r1.w>0){
      var s=Math.max(.04,r0.w/r1.w);
      el.style.transform='translate('+(r0.l-r1.l).toFixed(1)+'px,'+(r0.t-r1.t).toFixed(1)+'px) scale('+s.toFixed(3)+')';
    }else el.style.transform='translateY(24px) scale(.92)';
    el.style.opacity='0';
    el._d=Math.min(i,14)*28;
  });
  void host.offsetWidth;
  requestAnimationFrame(function(){
    els.forEach(function(el){
      el.style.transition='transform .95s '+EASE+' '+el._d+'ms,opacity .5s linear '+el._d+'ms';
      el.style.transform='';el.style.opacity='';
    });
    setTimeout(function(){host.classList.remove('growing');els.forEach(function(el){el.style.transition='';el.style.transformOrigin=''})},1100+14*28);
  });
}
function shrink(to,done){
  var els=cardsOnScreen();
  els.forEach(function(el){
    var id=el.getAttribute('data-id'),it=byId(id),r0=it&&to?to(it):null,r1=rectOf(el);
    el.style.transformOrigin='0 0';
    el.style.transition='transform .6s '+EASE+',opacity .45s linear .1s';
    if(r0&&r1.w>0)el.style.transform='translate('+(r0.l-r1.l).toFixed(1)+'px,'+(r0.t-r1.t).toFixed(1)+'px) scale('+Math.max(.04,r0.w/r1.w).toFixed(3)+')';
    else el.style.transform='translateY(24px) scale(.92)';
    el.style.opacity='0';
  });
  host.classList.add('leaving');
  setTimeout(function(){host.classList.remove('leaving');done()},620);
}

function byId(id){
  for(var i=0;i<items.length;i++)if(items[i].id===id)return items[i];
  return ctx.byId(id);
}
function bind(){
  host.addEventListener('click',function(e){
    var pp=e.target.closest('[data-play]');
    if(pp){e.preventDefault();e.stopPropagation();play(pp.getAttribute('data-play'));return}
    if(e.target.closest('#bflip')){e.preventDefault();e.stopPropagation();flip[K]=!flip[K];stopPreviews();render();host.scrollTop=0;return}
    if(e.target.closest('[data-hire]')){e.preventDefault();e.stopPropagation();ctx.hire();return}
    var c=e.target.closest('.card[data-id]');
    if(!c)return;
    e.preventDefault();e.stopPropagation();
    var it=byId(c.getAttribute('data-id'));if(!it)return;
    ctx.open(it,rectOf(c.querySelector('.fr')||c),e.clientX,e.clientY);
  });
}

window.GJ_BOARD={
  init:function(c){ctx=c;host=$('board');if(host)bind()},
  /* k, the items to show, from(it) = the rect the card grows out of */
  open:function(k,list,from,focus){
    if(!host)return;
    var again=opened&&K===k;
    K=k;items=list||[];
    if(!again)render();
    host.hidden=false;opened=1;
    document.documentElement.classList.add('boarded');
    if(!again){host.scrollTop=0;if(focus){var f=host.querySelector('.card[data-id="'+focus+'"]');if(f){var r=f.getBoundingClientRect(),y=r.top-host.getBoundingClientRect().top;if(y+r.height>host.clientHeight*.85)host.scrollTop=Math.max(0,y-host.clientHeight*.35)}}}
    else watch();
    grow(again?null:from);
  },
  /* back to the constellation: the cards return to their thumbnails */
  close:function(to){
    if(!host||host.hidden)return;
    stopPreviews();
    shrink(to,function(){host.hidden=true;opened=0;document.documentElement.classList.remove('boarded')});
  },
  /* a piece took the screen: keep the board as it is underneath */
  cover:function(){if(!host)return;stopPreviews();host.hidden=true;document.documentElement.classList.remove('boarded')},
  hide:function(){if(!host)return;stopPreviews();host.hidden=true;opened=0;K=null;document.documentElement.classList.remove('boarded')},
  key:function(){return opened?K:null},
  tileAt:function(x,y){
    if(!host||host.hidden)return null;
    var el=document.elementFromPoint(x,y),c=el&&el.closest&&el.closest('#board .card[data-id]');
    if(!c){
      var best=null,bd=60;
      [].forEach.call(host.querySelectorAll('.card[data-id]'),function(n){var r=n.getBoundingClientRect(),d=Math.hypot(r.left+r.width/2-x,r.top+r.height/2-y);if(r.bottom>0&&r.top<innerHeight&&d<bd+Math.max(r.width,r.height)/2){bd=d;best=n}});
      c=best;
    }
    return c?byId(c.getAttribute('data-id')):null;
  },
  box:function(it){
    if(!host)return null;
    var c=host.querySelector('.card[data-id="'+(it&&it.id)+'"]');
    if(!c)return null;var r=rectOf(c.querySelector('.fr')||c);
    return r.w?{l:r.l,t:r.t,w:r.w,h:r.h}:null;
  },
  rail:rail,play:play,pause:pause,
  playing:function(){return bau&&!bau.paused?bk:null},
  state:function(){return {k:opened?K:null,list:!!(K&&flip[K]),n:items.length,song:bk,playing:!!(bau&&!bau.paused),t:bau?+bau.currentTime.toFixed(2):0}}
};
})();
