/* Pinch is the only depth gesture.
   Boards nest. The film player gets richer. Sound is the sketch.
   Every pinch-in is a fast eased push: the view scales past the edges,
   near-lens bokeh brushes past, then the next level eases to a stop. */
(function(){
'use strict';
var board=null, filmLv=0, filmWork=null, filmAt=0, filmScale=1, still=null, soundOn=false;
var PL={on:0,e:0,t0:0,busy:0,applied:0,pending:null};
var FX={t0:0,life:0,fly:0};
var BOK=[], SPR=null;

function sprite(){
  if(SPR)return SPR;
  var sz=96,c=document.createElement('canvas');c.width=c.height=sz;
  var x=c.getContext('2d'),i;
  for(i=0;i<2;i++){
    var g=x.createRadialGradient(sz/2,sz/2,0,sz/2,sz/2,sz/2);
    if(i===0){
      g.addColorStop(0,'rgba(255,252,248,.92)');
      g.addColorStop(.18,'rgba(214,228,242,.42)');
      g.addColorStop(.5,'rgba(170,198,220,.12)');
      g.addColorStop(1,'rgba(170,198,220,0)');
    }else{
      g.addColorStop(0,'rgba(255,236,228,.7)');
      g.addColorStop(.2,'rgba(255,190,170,.22)');
      g.addColorStop(1,'rgba(255,180,160,0)');
    }
    x.fillStyle=g;x.beginPath();x.arc(sz/2,sz/2,sz/2-1,0,7);x.fill();
  }
  SPR=c;return c;
}
function rnd(n){var x=Math.sin(n*127.1+19.2)*43758.5453;return x-Math.floor(x)}
function spawn(n){
  BOK=[];
  var i;
  for(i=0;i<n;i++){
    BOK.push({
      x:rnd(i+1), y:rnd(i+40),
      ang:rnd(i+7)*6.2832,
      sp:0.15+rnd(i+3)*0.10,
      lag:rnd(i+11),
      warm:rnd(i+5)>.62?1:0
    });
  }
  FX.t0=performance.now(); FX.life=1;
}
function tick(now){
  if(PL.on){
    var u=Math.min(1,(now-PL.t0)/780);
    PL.e=1-Math.pow(1-u,3);
    if(PL.pending&&!PL.applied&&PL.e>=0.38){PL.applied=1;var fn=PL.pending;PL.pending=null;fn()}
    if(u>=1){PL.on=0;PL.e=1;PL.busy=0;PL.applied=0;PL.pending=null}
  }
  if(FX.life>0 && !PL.on && FX.fly<=0){
    var age=(now-FX.t0)/900;
    if(age>1)FX.life=0;
  }
}
function fly(u){FX.fly=u;if(u>0&&!BOK.length)spawn(16)}
function viewScale(){
  if(!PL.on)return 1;
  var e=PL.e;
  if(e<0.38){
    var k=e/0.38;
    return 1+1.2*(1-Math.pow(1-k,2));
  }
  var k2=(e-0.38)/0.62;
  var settle=1-Math.pow(1-k2,3);
  return 1.1-0.1*settle;
}
function drawFx(g,W,H){
  var now=performance.now();
  var age=FX.t0?(now-FX.t0)/900:1;
  var show=PL.on||FX.life>0||FX.fly>0.02;
  if(!show||!BOK.length)return;
  var spr=sprite(),i,b,near,diam,x,y,a;
  g.save();
  g.globalCompositeOperation='lighter';
  for(i=0;i<BOK.length;i++){
    b=BOK[i];
    near=PL.on?Math.min(1,PL.e*(0.55+b.lag*0.7)):Math.min(1,(FX.fly>0?FX.fly:age)*(0.45+b.lag));
    if(near<0.02)continue;
    diam=Math.min(W,H)*b.sp*(0.45+near*1.15);
    var push=near*near;
    x=W*(0.5+(b.x-0.5)*(0.35+push*1.7))+Math.cos(b.ang+near*2)*W*0.04;
    y=H*(0.5+(b.y-0.5)*(0.28+push*1.5))+Math.sin(b.ang+near)*H*0.03;
    a=(0.22+0.55*near)*(1-Math.max(0,near-0.92)/0.08);
    if(a<=0.02)continue;
    g.globalAlpha=Math.min(0.85,a);
    g.drawImage(spr,x-diam/2,y-diam/2,diam,diam);
  }
  g.restore();
  g.globalAlpha=1;
  g.globalCompositeOperation='source-over';
  var blur=0;
  if(PL.on&&PL.e<0.62)blur=(PL.e/0.62)*10;
  else if(FX.fly>0.05&&FX.fly<0.85)blur=FX.fly*12;
  var poem=document.getElementById('poem'),water=document.getElementById('water');
  if(poem)poem.style.filter=blur?'blur('+blur.toFixed(1)+'px)':'';
  if(water)water.style.filter=blur?'blur('+blur.toFixed(1)+'px)':'';
}

function shotsOf(it){
  if(window.GJ_INNER&&GJ_INNER.shotsOf)return GJ_INNER.shotsOf(it)||[];
  return [];
}
function tilesFrom(shots,work){
  return shots.map(function(s,i){
    return {
      id:(work.id||'s')+'@'+i,
      title:s.title||s.text||'',
      _cap:s.title||s.text||'',
      chapter:work.chapter||'film',
      kind:s.clip?'film':'photo',
      media:{thumb:s.src||'',big:s.src||''},
      _shot:s,_work:work,_crop:s.crop||null,_text:s.text||''
    };
  });
}
function objectTiles(api){
  var subs=window.GJ_INNER&&GJ_INNER.groups?GJ_INNER.groups():[];
  return subs.map(function(it){
    var shots=it.shots||[],img='',i;
    for(i=0;i<shots.length;i++)if(shots[i].src){img=shots[i].src;break}
    if(!img&&it.media)img=it.media.thumb||it.media.big||'';
    return {
      id:it.id,title:it.title,_cap:it._subLabel||it.title,role:it._subLabel||'',
      chapter:'objects',kind:it.kind||'object',
      media:{thumb:img},_shots:shots,_work:it
    };
  });
}
function makeBoard(api,k){
  if(k==='objects')return {k:k,title:'OBJECTS',items:objectTiles(api),fine:false,parent:null,work:null};
  if(k==='progress')return {k:k,title:'IN PROGRESS',items:api.progress(),fine:false,parent:null,work:null};
  var ch=api.ch(k);
  return {k:k,title:String(k||'').toUpperCase(),items:ch?ch.items.slice():[],fine:false,parent:null,work:null};
}
function preload(items,api){
  var seen={};
  items.forEach(function(it){
    var src=it.media&&(it.media.thumb||it.media.big);
    if(it._crop&&src&&seen[src]){
      var im=seen[src];it._im=im;
      if(im.complete&&im.naturalWidth)it.ld=1;
      else im.addEventListener('load',function(){it.ld=1});
      return;
    }
    api.load(it);
    if(src&&it._im)seen[src]=it._im;
  });
}
function showBoard(api){
  if(!board)return;
  still=null;filmLv=0;
  api.setCur({lv:1,k:board.k,id:board.work?board.work.id:null});
  api.arrive();
  preload(board.items,api);
}
function openBoard(api,k){
  still=null;filmLv=0;filmWork=null;
  board=makeBoard(api,k);
  api.setCur({lv:1,k:k,id:null});
  api.push();
  api.arrive();
  preload(board.items,api);
}
function showSound(track){
  soundOn=true;filmLv=0;still=null;
  var f=document.getElementById('snd');
  if(!f)return;
  var src='player/index.html'+(track?'?track='+encodeURIComponent(track):'');
  if(f.getAttribute('data-src')!==src){f.setAttribute('data-src',src);f.src=src}
  f.hidden=false;
}
function openSound(api,track){
  var fromBoard=board;
  showSound(track);
  if(fromBoard)api.setCur({lv:2,k:fromBoard.k,id:null});
  else {api.setCur({lv:1,k:'sound',id:null});api.push()}
  api.arrive();
}
function hideSound(){
  soundOn=false;
  var f=document.getElementById('snd');
  if(f)f.hidden=true;
}
function soundStep(api){
  var f=document.getElementById('snd');
  try{
    var sk=f&&f.contentWindow&&f.contentWindow.__sk;
    var st=sk&&sk.state();
    if(st&&st.mode!=='sky'&&st.dive>0.04){sk.goOut();return}
  }catch(e){}
  if(board){hideSound();showBoard(api);return}
  api.backHist();
}
function openFilm(api,work,shot){
  filmWork=work;filmLv=1;filmAt=(shot&&shot.t)||0;filmScale=1;still=null;
  api.setCur({lv:2,k:work.chapter||'film',id:work.id});
  api.arrive();
}
function openStill(api,work,shot){
  filmLv=0;filmWork=null;
  still={work:work,shot:shot||null,scale:1};
  api.setCur({lv:2,k:work.chapter||api.cur().k,id:work.id});
  api.arrive();
}
function openTile(api,it){
  var cur=api.cur();
  var work=it._work||api.byId(it.id)||it;
  if(work.kind==='track'||(work.track&&!it._shot)){
    openSound(api,(work.track&&work.track.k)||work.k||'togo');
    return;
  }
  var kids=null;
  if(!it._shot&&!(board&&board.fine)){
    if(it._shots&&it._shots.length)kids=it._shots;
    else kids=shotsOf(work);
    if(kids&&kids.length>1){
      board={k:cur.k,title:work.title,items:tilesFrom(kids,work),fine:true,parent:board,work:work};
      api.setCur({lv:1,k:cur.k,id:work.id});
      api.arrive();
      preload(board.items,api);
      return;
    }
  }
  var shot=it._shot||(kids&&kids[0])||null;
  var filmish=work.kind==='film'||work.kind==='reel'||work.chapter==='film';
  if(filmish&&(work.kind==='film'||work.kind==='reel')){openFilm(api,work,shot);return}
  if(shot&&(shot.src||shot.clip||shot.text)){openStill(api,work,shot);return}
  still=null;filmLv=0;
  api.setCur({lv:2,k:work.chapter||cur.k,id:work.id});
  api.arrive();
}
function planIn(x,y,api){
  var cur=api.cur();
  if(soundOn)return null;
  if(filmLv>=1){
    return function(){
      if(filmLv<4){filmLv++;api.paint()}
      else {filmScale=Math.min(2.15,filmScale*1.16);paintField()}
    };
  }
  if(still){
    return function(){still.scale=Math.min(2.5,still.scale*1.2);api.paint()};
  }
  if(cur.lv===0){
    var h=api.hit(x,y);
    if(!h)return null;
    if(h.type==='ch'&&h.k==='sound')return function(){openSound(api,null)};
    if(h.type==='ch')return function(){openBoard(api,h.k)};
    if(h.type==='poem')return function(){api.openId('about/poem')};
    if(h.prog)return function(){openBoard(api,'progress')};
    return null;
  }
  if(cur.lv>=1&&board){
    var it=api.tileAt(x,y);
    if(!it&&cur.lv>=2){
      var w=api.byId(cur.id);
      if(w)return function(){openTile(api,w)};
      return null;
    }
    if(!it)return null;
    return function(){openTile(api,it)};
  }
  if(cur.lv>=2){
    var w2=api.byId(cur.id);
    if(!w2)return null;
    return function(){openTile(api,w2)};
  }
  return null;
}
function planOut(api){
  var cur=api.cur();
  if(soundOn)return function(){soundStep(api)};
  if(filmLv>1)return function(){filmLv--;filmScale=1;api.paint()};
  if(filmLv===1)return function(){filmLv=0;filmWork=null;if(board)showBoard(api);else api.backHist()};
  if(still&&still.scale>1.18)return function(){still.scale=Math.max(1,still.scale/1.2);api.paint()};
  if(still)return function(){still=null;if(board)showBoard(api);else api.backHist()};
  if(cur.lv>=2&&board)return function(){filmLv=0;still=null;showBoard(api)};
  if(board&&board.fine)return function(){board=board.parent;showBoard(api)};
  if(board)return function(){board=null;api.backHist()};
  return null;
}
function pinchIn(x,y,api){
  if(PL.busy)return true;
  var act=planIn(x,y,api);
  if(!act)return false;
  PL.busy=1;PL.pending=act;PL.applied=0;PL.on=1;PL.e=0;PL.t0=performance.now();
  spawn(16);
  return true;
}
function pinchOut(api){
  if(PL.busy)return true;
  var act=planOut(api);
  if(!act)return false;
  act();
  return true;
}
function burst(){spawn(18);FX.fly=0.01}

function sync(cur,api){
  if(!cur||cur.lv===0){board=null;filmLv=0;filmWork=null;still=null;hideSound();return}
  if(cur.k==='sound'){if(!soundOn)showSound(null);return}
  if(soundOn)hideSound();
  if(cur.lv===1){
    filmLv=0;still=null;filmWork=null;
    if(!board||board.k!==cur.k||board.fine)board=makeBoard(api,cur.k);
    preload(board.items,api);
    return;
  }
  if(cur.lv>=2&&cur.id){
    var it=api.byId(cur.id);
    if(!board||board.k!==cur.k)board=makeBoard(api,cur.k);
    if(it&&(it.kind==='film'||it.kind==='reel')){filmWork=it;if(filmLv<1)filmLv=1;still=null}
    else {filmLv=0;filmWork=null}
  }
}

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function owns(){return filmLv>0||!!still}
function fieldShots(work){
  var all=shotsOf(work);
  if(all.length<=16)return all;
  var out=[],n=14,i,idx,best=-1,bd=1e9;
  for(i=0;i<n;i++){
    idx=Math.round(i*(all.length-1)/(n-1));
    out.push(all[idx]);
  }
  for(i=0;i<out.length;i++){
    var d=Math.abs((out[i].t||0)-filmAt);
    if(d<bd){bd=d;best=i}
  }
  return {list:out,focus:Math.max(0,best)};
}
function relHtml(work){
  var bits=[];
  (work.related||[]).forEach(function(id){
    var o=window.__u1&&__u1.byId?__u1.byId(id):null;
    if(o)bits.push('<a href="'+o.chapter+'/'+o.slug+'/">'+esc(o.title)+'</a>');
  });
  return '<p class="rel">Related'+(bits.length?' · '+bits.join(' · '):'')+'</p>';
}
function paintFilm(el,work){
  var m=work.media||{};
  var clip=m.pv||m.clip||'';
  var poster=m.big||m.thumb||'';
  el.classList.add('on');
  if(filmLv<=2){
    var shots=shotsOf(work);
    var rail='',strip='';
    if(filmLv>=2){
      var marks=shots.length?shots: (m.frames||[]).map(function(src){return {src:src,t:0}});
      var step=Math.max(1,Math.floor(marks.length/12));
      var thumbs='';
      for(var i=0;i<marks.length;i+=step){
        var p=marks.length>1?i/(marks.length-1):0;
        thumbs+='<img src="'+esc(marks[i].src)+'" alt="" style="left:'+(4+p*92).toFixed(2)+'%" data-t="'+(marks[i].t||0)+'">';
      }
      rail='<div class="rail" id="rail"><div class="railthumbs">'+thumbs+'</div><i class="head" id="rhead"></i></div>';
      var shown=marks.length>48?marks.filter(function(s,i){return i%Math.ceil(marks.length/24)===0}):marks;
      strip='<div class="strip">'+shown.map(function(s,i){
        return '<button type="button" data-t="'+(s.t||0)+'"><img src="'+esc(s.src)+'" alt=""></button>';
      }).join('')+'</div>';
    }
    el.innerHTML='<div class="sheet film lv'+filmLv+'"><div class="frame239"><video id="fv" playsinline preload="metadata" poster="'+esc(poster)+'"'+(clip?' src="'+esc(clip)+'"':'')+'></video></div>'+
      '<button type="button" class="play" id="play">play</button><h2>'+esc(work.title)+'</h2>'+
      (work.role?'<p class="role">'+esc(work.role)+'</p>':'')+
      relHtml(work)+
      rail+strip+'</div>';
    var v=document.getElementById('fv'),btn=document.getElementById('play');
    if(v&&filmAt)v.addEventListener('loadedmetadata',function(){try{v.currentTime=Math.min(filmAt,(v.duration||filmAt+1)-0.05)}catch(e){}});
    if(btn&&v)btn.onclick=function(e){e.stopPropagation();if(v.paused){var p=v.play();if(p&&p.catch)p.catch(function(){})}else v.pause()};
    var railEl=document.getElementById('rail'),head=document.getElementById('rhead');
    function place(t){if(!head||!v||!v.duration)return;head.style.left=(t/v.duration*100)+'%'}
    if(v)v.addEventListener('timeupdate',function(){place(v.currentTime)});
    if(railEl&&v){
      function seek(e){var r=railEl.getBoundingClientRect();var t=Math.max(0,Math.min(0.998,(e.clientX-r.left)/r.width));if(v.duration){v.currentTime=t*v.duration;place(v.currentTime)}}
      railEl.addEventListener('pointerdown',function(e){seek(e);railEl.setPointerCapture&&railEl.setPointerCapture(e.pointerId)});
      railEl.addEventListener('pointermove',function(e){if(e.buttons)seek(e)});
    }
    el.querySelectorAll('.strip button').forEach(function(b){
      b.onclick=function(e){e.stopPropagation();var t=+b.getAttribute('data-t')||0;if(v){try{v.currentTime=t}catch(err){}var p=v.play();if(p&&p.catch)p.catch(function(){})}};
    });
    return;
  }
  var pack=fieldShots(work),list=pack.list||pack,focus=pack.focus||0;
  if(!list.length){list=[{src:poster,t:0,clip:clip}];focus=0}
  el.innerHTML='<div class="filmfield" id="filmfield"><canvas id="zfield"></canvas><h2>'+esc(work.title)+'</h2>'+relHtml(work)+'</div>';
  var host=document.getElementById('filmfield');
  var vids=[];
  [focus,(focus+3)%list.length].forEach(function(idx,n){
    var s=list[idx];if(!s)return;
    var src=s.clip||clip;if(!src)return;
    var v=document.createElement('video');
    v.muted=true;v.loop=true;v.autoplay=true;v.playsInline=true;v.setAttribute('playsinline','');
    v.poster=s.src||poster;v.src=src;v.dataset.i=String(idx);
    var t0=(s.t||0)+n*1.5;
    v.addEventListener('loadedmetadata',function(){try{if(t0)v.currentTime=Math.min(t0,(v.duration||t0+1)-0.1)}catch(e){}});
    host.appendChild(v);vids.push(v);
    var p=v.play();if(p&&p.catch)p.catch(function(){});
  });
  host._list=list;host._focus=focus;host._work=work;host._vids=vids;
  paintField();
}
function paintField(){
  var host=document.getElementById('filmfield');if(!host||!host._list)return;
  var c=document.getElementById('zfield');if(!c)return;
  var W=host.clientWidth||innerWidth,H=host.clientHeight||innerHeight,dpr=Math.min(2,devicePixelRatio||1);
  if(c._w!==W||c._h!==H){c.width=(W*dpr)|0;c.height=(H*dpr)|0;c._w=W;c._h=H}
  var g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);
  g.clearRect(0,0,W,H);
  g.fillStyle='#04070b';g.fillRect(0,0,W,H);
  var list=host._list,focus=host._focus,sc=filmScale,n=list.length;
  var R=Math.min(W,H)*(n>10?0.34:0.28)*sc;
  var cx=W/2,cy=H*0.46;
  g.strokeStyle='rgba(190,210,230,.22)';g.lineWidth=1;g.beginPath();
  list.forEach(function(s,i){
    var a=-Math.PI/2+i/n*Math.PI*2;
    s._x=cx+Math.cos(a)*R;s._y=cy+Math.sin(a)*R*0.86;
    if(i)g.lineTo(s._x,s._y);else g.moveTo(s._x,s._y);
  });
  g.closePath();g.stroke();
  list.forEach(function(s,i){
    var dw=i===focus?Math.min(W*0.62,280)*sc:Math.min(W*0.22,96);
    var dh=dw*(i===focus?0.5:0.62);
    var im=s.src&&img(s.src);
    g.save();
    if(im&&im._ok){
      g.beginPath();g.rect(s._x-dw/2,s._y-dh/2,dw,dh);g.clip();
      var iw=im.naturalWidth,ih=im.naturalHeight,k=Math.max(dw/iw,dh/ih);
      g.drawImage(im,s._x-iw*k/2,s._y-ih*k/2,iw*k,ih*k);
    }else{
      g.fillStyle='rgba(20,28,42,.9)';g.fillRect(s._x-dw/2,s._y-dh/2,dw,dh);
    }
    g.restore();
    var spr=sprite(),gs=i===focus?dw*0.9:dw*0.55;
    g.globalCompositeOperation='lighter';g.globalAlpha=i===focus?0.55:0.28;
    g.drawImage(spr,s._x-gs/2,s._y-gs/2,gs,gs);
    g.globalCompositeOperation='source-over';g.globalAlpha=1;
    if(host._vids){
      host._vids.forEach(function(v){
        if(+v.dataset.i!==i)return;
        v.style.left=(s._x-dw/2)+'px';v.style.top=(s._y-dh/2)+'px';
        v.style.width=dw+'px';v.style.height=dh+'px';
      });
    }
  });
  if(filmLv>=4&&host._work){
    var bits=(host._work.credits||[]).slice(0,3);
    if(host._work.role)bits.unshift(host._work.role);
    if(host._work.meta)bits.push(host._work.meta);
    bits=bits.slice(0,5);
    g.font='300 11px Poppins,sans-serif';g.textAlign='center';g.fillStyle='rgba(226,234,242,.86)';
    bits.forEach(function(f,i){
      var col=i%2,row=(i/2)|0;
      var x=col?W*0.78:W*0.22;
      var y=H*0.78+row*26;
      g.globalAlpha=.9;g.drawImage(sprite(),x-7,y-16,14,14);
      g.globalAlpha=1;g.fillText(String(f).slice(0,42),x,y);
    });
  }
}
var ICACHE={};
function img(src){
  if(!src)return null;
  if(ICACHE[src])return ICACHE[src];
  var im=new Image();im.decoding='async';
  im.onload=function(){im._ok=1;if(filmLv>=3)paintField()};
  im.src=src;ICACHE[src]=im;return im;
}
function paintStill(el){
  var work=still.work,s=still.shot||{},sc=still.scale;
  var src=s.src||(work.media&&(work.media.big||work.media.thumb))||'';
  var clip=s.clip||'';
  el.classList.add('on');
  var frame=clip
    ? '<video muted loop autoplay playsinline poster="'+esc(src)+'" src="'+esc(clip)+'"></video>'
    : (src?'<img src="'+esc(src)+'" alt="'+esc(s.title||work.title||'')+'">':'');
  var cap=s.text||s.title||'';
  el.innerHTML='<div class="sheet full stillview" style="transform:scale('+sc.toFixed(3)+');transform-origin:50% 40%">'+
    (frame?'<div class="stillframe">'+frame+'</div>':'')+
    '<h2>'+esc(work.title||'')+'</h2>'+relHtml(work)+(cap&&cap!==work.title?'<p class="meta">'+esc(cap)+'</p>':'')+
    (s.text?'<p class="role">'+esc(s.text)+'</p>':'')+'</div>';
}
function paintLayer(el){
  if(soundOn){el.classList.remove('on');el.innerHTML='';return}
  if(filmLv>0&&filmWork){paintFilm(el,filmWork);return}
  if(still){paintStill(el);return}
}

function state(){
  return {
    film:filmLv, scale:+(still?still.scale:filmScale).toFixed(2),
    board:board?board.title:null, fine:!!(board&&board.fine),
    n:board?board.items.length:0, sound:soundOn?1:0,
    plunge:+(PL.e||0).toFixed(2), work:filmWork&&filmWork.id
  };
}

window.GJ_DEPTH={
  tick:tick, fly:fly, burst:burst, viewScale:viewScale, drawFx:drawFx,
  pinchIn:pinchIn, pinchOut:pinchOut, sync:sync, owns:owns, paintLayer:paintLayer,
  paintField:paintField, board:function(){return board}, soundOn:function(){return soundOn},
  state:state
};
})();
