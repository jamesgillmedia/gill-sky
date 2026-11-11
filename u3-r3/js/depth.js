/* Pinch is the only depth gesture.
   Boards nest. The film player gets richer. Sound is the sketch.
   Every pinch-in is a fast eased push: the view scales past the edges,
   near-lens bokeh brushes past, then the next level eases to a stop. */
(function(){
'use strict';
var board=null, filmLv=0, filmWork=null, filmAt=0, filmScale=1, still=null, soundOn=false, piece=null, joioReturn=null, linkFrames=0, fly=null, filmFocus=0, filmSrc='', snd=null;
var PL={on:0,e:0,t0:0,busy:0,applied:0,pending:null,ox:0,oy:0};
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
    var u=Math.min(1,(now-PL.t0)/960);
    PL.e=1-Math.pow(1-u,3);
    if(PL.pending&&!PL.applied&&PL.e>=0.38){PL.applied=1;var fn=PL.pending;PL.pending=null;fn()}
    if(u>=1){PL.on=0;PL.e=1;PL.busy=0;PL.applied=0;PL.pending=null}
  }
  if(FX.life>0 && !PL.on && FX.fly<=0){
    var age=(now-FX.t0)/900;
    if(age>1)FX.life=0;
  }
}
function rush(u){FX.fly=u;if(u>0&&!BOK.length)spawn(16)}
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
    if(it.id==='objects/joio')img='media/pro2/img/objects/cup-top-960.webp';
    if(!img){
      for(i=0;i<shots.length;i++){
        if(/c\/00\.|wood-fired/i.test((shots[i].src||'')+' '+(shots[i].title||'')))continue;
        if(shots[i].src){img=shots[i].src;break}
      }
    }
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
  still=null;filmLv=0;filmWork=null;piece=null;snd=null;
  dropFly();setBleed(false);hideSound();
  var st=history.state&&history.state.cur;
  if(st&&st.id){api.backHist();return}
  if(!board){api.backHist();return}
  api.setCur({lv:2,k:board.k,id:null});
  api.arrive();
  preload(board.items,api);
}
function openBoard(api,k){
  if(api.openBoard){api.openBoard(k);return}
  still=null;filmLv=0;filmWork=null;
  board=makeBoard(api,k);
  api.setCur({lv:2,k:k,id:null});
  api.push();
  api.arrive();
  preload(board.items,api);
}
function trackOf(work){
  if(!work)return 'togo';
  if(work.track&&work.track.k)return work.track.k;
  var m={'to-go':'togo','no-problem':'noproblem','lost-in-time':'lostintime','equals':'equals','ii':'ii'};
  return m[work.slug]||'togo';
}
function waveHtml(peaks){
  if(!peaks||!peaks.length)return '';
  return '<div class="syncwave">'+peaks.map(function(p,i){
    var x=(6+(i+0.5)*(88/peaks.length)).toFixed(2);
    var b=(10+Math.max(0,Math.min(1,p))*76).toFixed(1);
    return '<i'+(i===3?' class="on"':'')+' style="left:'+x+'%;bottom:'+b+'%"></i>';
  }).join('')+'</div>';
}
function songArt(work){
  var m=work&&work.media||{};
  return m.big||m.thumb||'';
}
function openCover(api, work){
  hideSound();
  piece=null;still=null;filmLv=0;filmWork=null;
  snd={work:work,lv:1};
  var src=songArt(work);
  var peaks=api.wave?api.wave(work):null;
  var box={l:innerWidth*0.08,t:innerHeight*0.3,w:innerWidth*0.84,h:96};
  if(api.tileBox){var b=api.tileBox(work);if(b&&b.w)box=b}
  api.setCur({lv:3,k:'sound',id:work.id});
  api.push();
  if(!src&&!(peaks&&peaks.length)){snd.empty=1;api.arrive();return}
  growInto(box, src, '', waveHtml(peaks)||'', true);
  api.arrive();
}
function showSound(track, into){
  soundOn=true;filmLv=0;still=null;piece=null;
  var f=document.getElementById('snd');
  if(!f)return;
  var src='player/index.html'+(track?'?track='+encodeURIComponent(track):'')+(into?'&in=1':'');
  if(f.getAttribute('data-src')!==src){f.setAttribute('data-src',src);f.src=src}
  f.hidden=false;
}
function openSound(api,track,into,work){
  showSound(track, into);
  var id=work&&work.id;
  if(id){api.setCur({lv:3,k:'sound',id:id});api.push()}
  else if(board)api.setCur({lv:2,k:board.k,id:null});
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
    var v=sk&&sk.view();
    var st=sk&&sk.state&&sk.state();
    if(st&&st.mode==='rising')return;
    if(st&&(st.mode==='in'||st.mode==='diving')){
      if(v&&v.z>4.2){sk.viewSet(Math.max(3.4,v.z/1.28),0,0);return}
      if(sk.goOut)sk.goOut();
      return;
    }
  }catch(e){}
  hideSound();
  snd=null;dropFly();setBleed(false);
  if(board)showBoard(api);
  else api.backHist();
}
function openFilm(api,work,shot){
  filmWork=work;filmLv=1;filmAt=(shot&&shot.t)||0;filmScale=1;still=null;piece=null;
  api.setCur({lv:3,k:work.chapter||'film',id:work.id});
  api.push();
  api.arrive();
}
function openStill(api,work,shot){
  filmLv=0;filmWork=null;
  still={work:work,shot:shot||null,scale:1};
  api.setCur({lv:3,k:work.chapter||api.cur().k,id:work.id});
  api.push();
  api.arrive();
}
function openTile(api,it){
  var cur=api.cur();
  var work=it._work||api.byId(it.id)||it;
  if(work.kind==='player'||work.id==='sound/waveform'||work.kind==='track'||work.chapter==='sound'||(work.track&&!it._shot)){
    snd=null;dropFly();setBleed(false);
    openSound(api,trackOf(work),false,work);
    return;
  }
  var kids=null;
  var filmish0=work.kind==='film'||work.kind==='reel';
  if(filmish0&&!it._shot){
    var reelShots=(work.kind==='reel'||work.slug==='demo-reel')?shotsOf(work):null;
    if(reelShots&&reelShots.length>1){
      board={k:cur.k||'film',title:work.title,items:tilesFrom(reelShots,work),fine:true,parent:board,work:work};
      api.setCur({lv:2,k:board.k,id:work.id});
      api.push();
      api.arrive();
      preload(board.items,api);
      return;
    }
    openFilm(api,work,null);return;
  }
  if((work.chapter==='objects'||cur.k==='objects')&&!it._shot){
    api.setCur({lv:3,k:'objects',id:work.id});
    api.push();
    stepPiece(api,work,0,0);
    api.arrive();
    return;
  }
  if(!it._shot&&!(board&&board.fine)){
    if(it._shots&&it._shots.length)kids=it._shots;
    else kids=shotsOf(work);
    if(kids&&kids.length>1){
      board={k:cur.k,title:work.title,items:tilesFrom(kids,work),fine:true,parent:board,work:work};
      api.setCur({lv:2,k:cur.k,id:work.id});
      api.push();
      api.arrive();
      preload(board.items,api);
      return;
    }
  }
  var shot=it._shot||(kids&&kids[0])||null;
  if(work.chapter==='photo'&&!it._shot){openPhoto(api,work);return}
  var filmish=work.kind==='film'||work.kind==='reel'||work.chapter==='film';
  if(filmish&&(work.kind==='film'||work.kind==='reel')){openFilm(api,work,shot);return}
  if(shot&&(shot.src||shot.clip||shot.text)){openStill(api,work,shot);return}
  still=null;filmLv=0;
  api.setCur({lv:3,k:work.chapter||cur.k,id:work.id});
  api.push();
  api.arrive();
}
function pieceShots(work, api){
  if(work.shots&&work.shots.length){
    var own=work.shots.filter(function(s){return s.src||s.clip});
    if(own.length)return own;
  }
  var bag=(work.id||'')+' '+(work.slug||'')+' '+(work.title||'')+' '+(work.meta||'');
  var srcId=/joio/i.test(bag)?'objects/joio':(/cedar|carved|spoon|process|hand-carved/i.test(bag)?'objects/hand-carved-piece':'');
  if(srcId){var g=api.byId(srcId);if(g&&g.shots&&g.shots.length)return g.shots.filter(function(s){return s.src||s.clip})}
  return [];
}
function shotClip(el){
  if(!el)return '';
  if(el.tagName==='VIDEO')return el.currentSrc||el.getAttribute('src')||'';
  var fig=el.closest&&el.closest('figure');
  return fig?(fig.getAttribute('data-clip')||''):'';
}
function cupRank(s){
  var t=(s.title||'')+' '+(s.src||'');
  if(/c\/00\.|wood-fired|pizza/i.test(t))return 8;
  if(/\bcups?\b/i.test(t))return 0;
  if(/paddle/i.test(t))return 1;
  if(/pour/i.test(t))return 2;
  if(/bowl/i.test(t))return 3;
  if(/brew/i.test(t))return 4;
  return 6;
}
function cupFirst(shots){
  var clips=(shots||[]).filter(function(s){return s.clip&&!/c\/00\.|wood-fired/i.test((s.src||'')+' '+(s.title||''))});
  clips.sort(function(a,b){return cupRank(a)-cupRank(b)});
  return clips;
}
function spiritBeside(){
  return '<div class="beside"><a href="#objects/spirit-eye" data-open="objects/spirit-eye"><img src="media/pro2/img/objects/spirit-eye.webp" alt="">Spirit Eye</a></div>';
}
function bindSpirit(root){
  var link=root&&root.querySelector&&root.querySelector('[data-open]');
  if(!link)return;
  link.addEventListener('click',function(ev){
    ev.preventDefault();ev.stopPropagation();
    joioReturn={id:piece&&piece.work?piece.work.id:'objects/joio',lv:piece?piece.lv:3,scale:piece&&piece.scale||1};
    if(window.__u1&&__u1.open)__u1.open(link.getAttribute('data-open'));
  });
}
function stepPiece(api, work, x, y, preset){
  if(!piece||piece.work.id!==work.id){
    piece={work:work,lv:1,scale:1,shots:pieceShots(work,api)};
    api.paint();return;
  }
  if(piece.lv===1){piece.lv=2;piece.scale=1;api.paint();return}
  if(piece.lv===2){
    var hit=preset||nearestStill(x,y,'#layer .cutgrid img, #layer .cutgrid video');
    piece.lv=3;piece.scale=1;
    if(!hit){api.paint();return}
    var clip=shotClip(hit.el);
    var beside=/joio/i.test(work.id||'')?spiritBeside():'';
    growInto(hit.box, hit.src, clip, beside, !clip);
    if(fly)fly.i=hit.i;
    bindSpirit(fly&&fly.el);
    return;
  }
  piece.scale=Math.min(2.4,(piece.scale||1)*1.16);
  if(fly&&fly.el)fly.el.style.transform='scale('+piece.scale.toFixed(3)+')';
  else api.paint();
}
function openPhoto(api, work){
  var ch=api.ch('photo');
  var items=ch&&ch.items?ch.items:[];
  var idx=0,i;
  for(i=0;i<items.length;i++)if(items[i].id===work.id)idx=i;
  var series=items.slice(Math.max(0,idx-1),idx+2);
  if(!series.length)series=[work];
  var sheet=items.slice(Math.max(0,idx-6),idx+6);
  if(sheet.length<6)sheet=items.slice(0,12);
  piece={work:work,lv:1,scale:1,shots:[],photo:1,series:series,sheet:sheet};
  still=null;filmLv=0;filmWork=null;
  api.setCur({lv:3,k:'photo',id:work.id});
  api.push();
  api.arrive();
}
function shownTitle(work){
  var t=work&&work.title||'';
  if(/^photograph\s+\d+$/i.test(t)||t==='untitled')return '';
  return t;
}
function stepPhoto(api, work, x, y, preset){
  if(!piece||!piece.photo||piece.work.id!==work.id){openPhoto(api,work);return}
  if(piece.lv<2){piece.lv++;piece.scale=1;api.paint();return}
  if(piece.lv===2){
    var hit=preset||nearestStill(x,y,'#layer .contact img');
    piece.lv=3;piece.scale=1;piece.print=hit?hit.src:'';
    if(!hit){api.paint();return}
    growInto(hit.box, hit.src, '', '', true);
    if(fly)fly.i=hit.i;
    return;
  }
  if(piece.lv===3){
    piece.lv=4;piece.scale=1;
    dropFly();setBleed(false);
    api.paint();
    return;
  }
  piece.scale=Math.min(2.2,(piece.scale||1)*1.16);
  api.paint();
}
function zoomSound(){
  var f=document.getElementById('snd');
  try{
    var sk=f&&f.contentWindow&&f.contentWindow.__sk;
    if(!sk)return;
    var st=sk.state();
    if(st.mode!=='in'&&st.mode!=='diving')sk.goIn();
    else {var v=sk.view();sk.viewSet(Math.min(8.5,(v.z||1)*1.28),0,0)}
  }catch(e){}
}
function planIn(x,y,api){
  var cur=api.cur();
  if(soundOn)return function(){zoomSound()};
  if(snd&&!soundOn)return function(){openSound(api,trackOf(snd.work),false,snd.work)};
  if(filmLv===2){var fh=nearestStill(x,y,'#layer .framewall img[data-hi="1"]');return function(){enterFilm(x,y,api,fh)}}
  if(filmLv===3)return function(){dropFly();setBleed(false);filmLv=4;api.paint()};
  if(filmLv>=1){
    return function(){
      var cap=(filmWork&&filmWork.id==='film/weird-kid')?6:5;
      if(filmLv<cap){filmLv++;api.paint()}
      else if(document.getElementById('filmfield')){filmScale=Math.min(2.15,filmScale*1.16);paintField()}
    };
  }
  if(still){
    return function(){still.scale=Math.min(2.5,still.scale*1.2);api.paint()};
  }
  if(cur.lv===0){
    var h=api.hit(x,y);
    if(!h)return null;
    if(h.type==='ch')return function(){api.openCat(h.k)};
    if(h.type==='poem')return function(){api.openId('about/poem')};
    if(h.type==='work'||h.prog)return function(){api.openCat(h.prog?'progress':h.k)};
    return null;
  }
  if(cur.lv===1&&cur.k)return function(){api.openBoard(cur.k)};
  if(cur.lv>=3&&cur.id&&!filmLv&&!still){
    var wk=api.byId(cur.id);
    if(wk&&wk.chapter==='sound')return function(){openSound(api,trackOf(wk),false,wk)};
    if(wk&&wk.chapter==='objects'){
      var oph=piece&&piece.work&&piece.work.id===wk.id&&piece.lv===2?nearestStill(x,y,'#layer .cutgrid img, #layer .cutgrid video'):null;
      return function(){stepPiece(api,wk,x,y,oph)};
    }
    if(wk&&wk.chapter==='photo'){
      var pph=piece&&piece.photo&&piece.work.id===wk.id&&piece.lv===2?nearestStill(x,y,'#layer .contact img'):null;
      return function(){stepPhoto(api,wk,x,y,pph)};
    }
  }
  if(cur.lv===2&&board){
    var it=api.tileAt(x,y);
    if(!it&&cur.id){
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
  if(snd)return function(){dropFly();setBleed(false);snd=null;if(board)showBoard(api);else api.backHist()};
  if(fly&&piece&&piece.scale>1.12)return function(){
    piece.scale=Math.max(1,piece.scale/1.22);
    if(piece.scale<=1.08)piece.lv=piece.photo?3:2;
    if(fly.el)fly.el.style.transform=piece.scale>1.05?'scale('+piece.scale.toFixed(3)+')':'';
  };
  if(fly&&((piece&&piece.lv>1)||filmLv===3))return function(){leaveFly()};
  if(piece&&piece.scale>1.12)return function(){piece.scale=Math.max(1,piece.scale/1.22);api.paint()};
  if(joioReturn&&cur.id==='objects/spirit-eye'){
    return function(){
      var back=joioReturn;joioReturn=null;
      var w=api.byId(back.id);
      if(!w){api.backHist();return}
      piece={work:w,lv:back.lv,scale:back.scale||1,shots:pieceShots(w,api)};
      still=null;filmLv=0;filmWork=null;
      api.setCur({lv:3,k:'objects',id:w.id});
      try{history.replaceState({u1:1,cur:{lv:3,k:'objects',id:w.id}},'','#objects/'+w.slug)}catch(e){}
      api.arrive();
    };
  }
  if(piece&&piece.lv>1)return function(){piece.lv--;piece.scale=1;api.paint()};
  if(piece)return function(){piece=null;showBoard(api)};
  if(filmLv>1)return function(){dropFly();filmLv--;filmScale=1;api.paint()};
  if(filmLv===1)return function(){filmLv=0;filmWork=null;if(board)showBoard(api);else api.backHist()};
  if(still&&still.scale>1.18)return function(){still.scale=Math.max(1,still.scale/1.2);api.paint()};
  if(still)return function(){still=null;if(board)showBoard(api);else api.backHist()};
  if(cur.lv>=3&&board)return function(){filmLv=0;still=null;piece=null;showBoard(api)};
  if(board&&board.fine)return function(){board=board.parent;showBoard(api)};
  if(board)return function(){board=null;api.backHist()};
  return null;
}
function pinchIn(x,y,api){
  if(PL.busy)return true;
  if(typeof x==='number')PL.ox=x;
  if(typeof y==='number')PL.oy=y;
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
  if(!cur||cur.lv===0){board=null;filmLv=0;filmWork=null;still=null;piece=null;snd=null;dropFly();setBleed(false);hideSound();return}
  if(cur.k!=='sound'&&soundOn)hideSound();
  if(cur.lv===1){
    board=null;filmLv=0;still=null;filmWork=null;piece=null;snd=null;dropFly();setBleed(false);hideSound();
    return;
  }
  if(cur.lv===2&&!cur.id){
    filmLv=0;still=null;filmWork=null;piece=null;snd=null;dropFly();setBleed(false);hideSound();
    if(!board||board.k!==cur.k||board.fine)board=makeBoard(api,cur.k);
    preload(board.items,api);
    return;
  }
  if(cur.lv===2&&cur.id&&board&&board.fine&&board.work&&board.work.id===cur.id)return;
  if((cur.lv>=3||cur.id)&&cur.id){
    var it=api.byId(cur.id);
    if(!board||board.k!==cur.k)board=makeBoard(api,cur.k);
    if(piece&&piece.work&&piece.work.id!==cur.id)piece=null;
    if(!it)return;
    if(it.kind==='film'||it.kind==='reel'){
      if(snd||soundOn||piece||(filmWork&&filmWork.id!==it.id)){
        snd=null;hideSound();dropFly();setBleed(false);piece=null;
      }
      if(!filmWork||filmWork.id!==it.id){filmLv=1;filmScale=1}
      filmWork=it;if(filmLv<1)filmLv=1;still=null;piece=null;
      return;
    }
    if(it.chapter==='sound'||it.kind==='track'){
      filmLv=0;filmWork=null;still=null;piece=null;
      snd=null;dropFly();setBleed(false);
      if(!soundOn)openSound(api,trackOf(it),false,it);
      return;
    }
    if(it.chapter==='photo'){
      filmLv=0;filmWork=null;still=null;
      if(snd||soundOn||!(piece&&piece.photo&&piece.work.id===it.id)){
        snd=null;hideSound();dropFly();setBleed(false);
      }
      if(!(piece&&piece.photo&&piece.work.id===it.id))openPhoto(api,it);
      return;
    }
    if(it.chapter==='objects'){
      filmLv=0;filmWork=null;still=null;
      if(snd||soundOn||!(piece&&!piece.photo&&piece.work&&piece.work.id===it.id)){
        snd=null;hideSound();dropFly();setBleed(false);
      }
      if(!(piece&&!piece.photo&&piece.work&&piece.work.id===it.id)){
        piece={work:it,lv:1,scale:1,shots:pieceShots(it,api),photo:0};
      }
      return;
    }
    if(!piece){filmLv=0;filmWork=null}
  }
}

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function owns(){return filmLv>0||!!still||!!piece||!!snd}
var KIESZA_FILES={
  '22/01.webp':1,'22/03.webp':1,'22/04.webp':1,'22/05.webp':1,'22/10.webp':1,
  '22/12.webp':1,'22/13.webp':1,'22/14.webp':1,'22/15.webp':1,'22/17.webp':1,
  '22/18.webp':1,'22/36.webp':1,'22/37.webp':1,'22/51.webp':1,'22/52.webp':1,
  '22/59.webp':1,'22/61.webp':1,'22/62.webp':1,'22/67.webp':1,'22/68.webp':1,
  '22/69.webp':1,'a/019.webp':1,'b/052.webp':1
};
function isKiesza(src){
  if(!src)return false;
  var name=src.slice(src.lastIndexOf('/')+1);
  var folder=src.slice(0,src.lastIndexOf('/'));
  folder=folder.slice(folder.lastIndexOf('/')+1);
  return !!(KIESZA_FILES[folder+'/'+name]||KIESZA_FILES[name]);
}
function gallery(work){
  var all=(shotsOf(work)||[]).slice(),seen={},i;
  for(i=0;i<all.length;i++)if(all[i].src)seen[all[i].src]=1;
  if(work&&work.id==='film/weird-kid'&&window.GJ_REEL){
    GJ_REEL.forEach(function(r){
      if(String(r.l)!=='22')return;
      var src='media/pro2/reel/'+r.f+'.webp';
      if(!seen[src]){seen[src]=1;all.push({src:src,t:0,clip:'',title:r.b||''})}
    });
  }
  ((work&&work.bts)||[]).forEach(function(src){
    if(src&&!seen[src]){seen[src]=1;all.push({src:src,t:0,clip:'',title:''})}
  });
  return all;
}
function fieldShots(work){
  var all=gallery(work),i,best=0,bd=1e9,prefer;
  if(work&&work.id==='film/weird-kid'){
    prefer=(filmLv>=4)?'22/12.webp':'22/13.webp';
    for(i=0;i<all.length;i++)if(all[i].src&&all[i].src.indexOf(prefer)>=0){best=i;bd=-1;break}
  }
  if(bd>=0){
    for(i=0;i<all.length;i++){
      var d=Math.abs((all[i].t||0)-filmAt);
      if(d<bd){bd=d;best=i}
    }
  }
  if(all.length>16&&!(work&&work.id==='film/weird-kid')){
    var out=[],n=8,idx;
    for(i=0;i<n;i++){
      idx=Math.round(i*(all.length-1)/(n-1));
      out.push(all[idx]);
    }
    return {list:out,focus:0};
  }
  return {list:all,focus:best};
}
function relHtml(work){
  var bits=[];
  (work.related||[]).forEach(function(id){
    var o=window.__u1&&__u1.byId?__u1.byId(id):null;
    if(!o)return;
    var name=shownTitle(o);
    if(!name)return;
    bits.push('<a href="'+o.chapter+'/'+o.slug+'/">'+esc(name)+'</a>');
  });
  return bits.length?'<p class="rel">'+bits.join(' · ')+'</p>':'';
}
function creditList(work){
  var bits=(work.credits||[]).slice().filter(Boolean);
  if(work.role)bits=bits.filter(function(s){return s!==work.role});
  return bits;
}
function credHtml(work){
  var bits=creditList(work).map(function(c){return '<li>'+esc(c)+'</li>'}).join('');
  return bits?'<ul class="credits">'+bits+'</ul>':'';
}
function paintConstellation(el,work,withClip){
  var m=work.media||{};
  var clip=m.pv||m.clip||'';
  var poster=m.big||m.thumb||'';
  var pack=fieldShots(work),list=pack.list||[],focus=pack.focus||0;
  if(!list.length)list=[{src:poster,t:0,clip:clip}];
  el.innerHTML='<div class="filmfield" id="filmfield"><canvas id="zfield"></canvas><h2>'+esc(work.title)+'</h2></div>';
  var host=document.getElementById('filmfield');
  host._list=list;host._focus=focus;host._lines=0;host._work=work;
  if(withClip){
    var s=list[focus]||list[0],src=s&&(s.clip||clip);
    if(src){
      var vid=document.createElement('video');
      vid.muted=true;vid.loop=true;vid.autoplay=true;vid.playsInline=true;
      vid.poster=(s&&s.src)||poster;vid.src=src;
      host.appendChild(vid);host._vids=[vid];
      var p=vid.play();if(p&&p.catch)p.catch(function(){});
    }
  }
  paintField();
}
function paintCreditStars(el,work){
  var poster=(work.media&&(work.media.big||work.media.thumb))||'';
  var bits=creditList(work);
  if(!bits.length&&work.role)bits=[work.role];
  if(!bits.length)bits=[work.title];
  var lines=bits.map(function(c){return '<li>'+esc(c)+'</li>'}).join('');
  el.innerHTML='<div class="credsky">'+(poster?'<img src="'+esc(poster)+'" alt="">':'')+'<h2>'+esc(work.title)+'</h2><ul class="credlist">'+lines+'</ul></div>';
}
function boxOf(el){
  var r=el.getBoundingClientRect();
  return {l:r.left,t:r.top,w:r.width,h:r.height};
}
function nearestStill(x,y,sel){
  var nodes=document.querySelectorAll(sel),best=null,bd=1e15,i;
  for(i=0;i<nodes.length;i++){
    var r=nodes[i].getBoundingClientRect();
    if(r.width<8||r.height<8)continue;
    var inside=x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;
    var d=inside?0:Math.hypot((r.left+r.width/2)-x,(r.top+r.height/2)-y);
    if(d<bd){bd=d;best={el:nodes[i],i:i,box:boxOf(nodes[i]),src:nodes[i].currentSrc||nodes[i].getAttribute('src')||''}}
  }
  return best;
}
function dropFly(){
  if(fly&&fly.el&&fly.el.parentNode)fly.el.parentNode.removeChild(fly.el);
  fly=null;
}
function growInto(box, src, clip, extra, push){
  dropFly();
  var host=document.getElementById('layer');if(!host||!box)return;
  var el=document.createElement('div');
  el.className='enterframe';
  var face=/22\/12\.webp/.test(src||'');
  if(face)el.classList.add('face');
  if(push&&!clip)el.classList.add('push');
  var img=src?'<img src="'+esc(src)+'" alt="">':'';
  var vid=clip?'<video muted loop autoplay playsinline poster="'+esc(src||'')+'" src="'+esc(clip)+'"></video>':'';
  var veil='',cap=extra||'';
  if(cap.indexOf('syncwave')>=0||cap.indexOf('beside')>=0){veil=cap;cap='';}
  el.innerHTML=img+vid+veil+(cap?'<div class="entercap">'+cap+'</div>':'');
  el.style.transition='none';
  el.style.left=box.l+'px';el.style.top=box.t+'px';el.style.width=box.w+'px';el.style.height=box.h+'px';
  host.appendChild(el);
  var v=el.querySelector('video');
  if(v){
    var p=v.play();if(p&&p.catch)p.catch(function(){})
  }
  setBleed(true);
  fly={el:el,i:0};
  void el.offsetWidth;
  requestAnimationFrame(function(){
    el.style.transition='';
    requestAnimationFrame(function(){
      el.style.left='0px';el.style.top='0px';
      el.style.width=innerWidth+'px';el.style.height=innerHeight+'px';
      el.classList.add('in');
    });
  });
}
function shrinkBack(box, done){
  var el=fly&&fly.el;
  if(!el){fly=null;if(done)done();return}
  var once=0;
  function fin(){if(once)return;once=1;if(el.parentNode)el.parentNode.removeChild(el);fly=null;if(done)done()}
  el.classList.remove('in');
  el.style.transform='';
  if(box&&box.w){el.style.left=box.l+'px';el.style.top=box.t+'px';el.style.width=box.w+'px';el.style.height=box.h+'px'}
  el.addEventListener('transitionend',function(e){if(e.propertyName==='width'||e.propertyName==='left')fin()});
  setTimeout(fin,1000);
}
function leaveFly(){
  var sel=filmLv===3?'#layer .framewall img[data-hi="1"]':(piece&&piece.photo?'#layer .contact img':'#layer .cutgrid img, #layer .cutgrid video');
  var nodes=document.querySelectorAll(sel);
  var back=nodes[filmLv===3?filmFocus:(fly&&fly.i)||0]||nodes[0];
  var box=back?boxOf(back):null;
  shrinkBack(box,function(){
    if(filmLv===3)filmLv=2;
    else if(piece){piece.lv=2;piece.scale=1}
  });
}
function setBleed(on){
  document.documentElement.classList.toggle('bleed', !!on);
}
function momentClip(src, work){
  var reel=src&&String(src).match(/\/reel\/(.+)\.webp$/);
  if(reel)return 'media/pro2/reel/'+reel[1]+'.mp4';
  var m=work&&work.media||{};
  if(work&&work.id==='film/weird-kid')return '';
  if(m.pv&&!/\/sc\//.test(m.pv))return m.pv;
  if(m.clip&&!/\/sc\//.test(m.clip)&&!/youtube|youtu\.be/i.test(m.clip))return m.clip;
  return '';
}
function masterSrc(src){
  return /\/frames\//.test(src)||/\/owtd\/stills\//.test(src)||/\/reel\/.+\.webp$/.test(src);
}
function enterFilm(x,y,api,preset){
  var hit=preset||nearestStill(x,y,'#layer .framewall img[data-hi="1"]');
  filmLv=3;
  if(!hit||!filmWork){filmLv=2;return}
  filmFocus=hit.i;
  filmSrc=hit.src||'';
  var clip=hit.el.getAttribute('data-clip')||momentClip(hit.src, filmWork);
  growInto(hit.box, hit.src, clip);
  if(fly)fly.i=hit.i;
}
function paintNeighbours(el,work){
  var frames=gallery(work),at=0,i;
  for(i=0;i<frames.length;i++){
    if(filmSrc&&frames[i].src&&frames[i].src.indexOf(filmSrc.slice(filmSrc.lastIndexOf('/')+1))>=0){at=i;break}
  }
  var from=Math.max(0,at-4),list=frames.slice(from,Math.min(frames.length,at+5));
  if(!list.length)list=frames.slice(0,8);
  var wall=list.map(function(s){
    return s.src?'<img src="'+esc(s.src)+'" alt="">':'';
  }).join('');
  el.innerHTML='<div class="sheet film lv2 full"><h2>'+esc(work.title)+'</h2><div class="framewall near">'+wall+'</div></div>';
}
function paintFilm(el,work){
  var m=work.media||{};
  var clip=m.pv||m.clip||'';
  var poster=m.big||m.thumb||'';
  el.classList.add('on');
  var wk=work.id==='film/weird-kid';
  if(filmLv===3&&document.querySelector('.enterframe'))return;
  if(filmLv!==3){dropFly();setBleed(false)}
  if(filmLv===1){
    var hero=wk?'media/pro2/frames/22/12.webp':(poster||'');
    var media=(!wk&&clip)
      ? (hero?'<img src="'+esc(hero)+'" alt="">':'')+'<video muted playsinline loop autoplay poster="'+esc(hero)+'" src="'+esc(clip)+'"></video>'
      : (hero?'<img src="'+esc(hero)+'" alt="">':'');
    var role=work.role||'';
    if(role==='Director · Director of Photography'&&creditList(work).length)role='';
    el.innerHTML='<div class="sheet film lv1 full"><h2>'+esc(work.title)+'</h2><div class="heroframe">'+media+'</div>'+
      (role?'<p class="role">'+esc(role)+'</p>':'')+credHtml(work)+relHtml(work)+'</div>';
    var v1=el.querySelector('video');
    if(v1){
      function showFrame(){if(v1.readyState>=2)v1.classList.add('live')}
      v1.addEventListener('loadeddata',showFrame);
      v1.addEventListener('playing',showFrame);
      var p1=v1.play();if(p1&&p1.catch)p1.catch(function(){});
    }
    return;
  }
  if(filmLv===2||filmLv===3){
    var frames=gallery(work);
    if(!frames.length&&m.frames)frames=m.frames.map(function(src){return {src:src}});
    var wall=frames.map(function(s){
      if(!s.src)return '';
      var hi=masterSrc(s.src)?1:0;
      var shot=momentClip(s.src, work);
      return '<img src="'+esc(s.src)+'" data-hi="'+hi+'"'+(shot?' data-clip="'+esc(shot)+'"':'')+' alt="">';
    }).join('');
    el.innerHTML='<div class="sheet film lv2 full"><h2>'+esc(work.title)+'</h2><div class="framewall">'+wall+'</div></div>';
    if(filmLv===3){
      var imgs=el.querySelectorAll('.framewall img[data-hi="1"]');
      var im=imgs[filmFocus]||imgs[0];
      if(im)growInto(boxOf(im), im.getAttribute('src'), im.getAttribute('data-clip')||'');
    }
    return;
  }
  if(filmLv===3&&!wk){
    var shots=shotsOf(work);
    var marks=shots.length?shots:(m.frames||[]).map(function(src){return {src:src,t:0}});
    var step=Math.max(1,Math.floor(marks.length/10));
    function band(from){
      var html='';
      for(var i=from;i<marks.length;i+=step){
        html+='<img src="'+esc(marks[i].src)+'" alt="" data-t="'+(marks[i].t||0)+'">';
      }
      return html;
    }
    el.innerHTML='<div class="sheet film lv2 full"><h2>'+esc(work.title)+'</h2>'+
      '<div class="sprocket" id="rail"><div class="holes"></div><div class="band">'+band(0)+'</div><div class="holes"></div><i class="head" id="rhead"></i></div>'+
      '<div class="sprocket thin"><div class="holes"></div><div class="band">'+band(Math.max(1,step>>1))+'</div><div class="holes"></div></div>'+
      relHtml(work)+'</div>';
    var v=document.createElement('video');
    v.id='fv';v.muted=true;v.playsInline=true;v.preload='metadata';
    if(clip)v.src=clip;
    v.style.display='none';
    el.appendChild(v);
    var railEl=document.getElementById('rail'),head=document.getElementById('rhead');
    function place(t){if(!head||!v.duration)return;head.style.left=(t/v.duration*100)+'%'}
    if(railEl){
      function seek(e){var r=railEl.getBoundingClientRect();var t=Math.max(0,Math.min(0.998,(e.clientX-r.left)/r.width));if(v.duration){v.currentTime=t*v.duration;filmAt=v.currentTime;place(v.currentTime)}}
      railEl.addEventListener('pointerdown',function(e){seek(e)});
      railEl.addEventListener('pointermove',function(e){if(e.buttons)seek(e)});
    }
    return;
  }
  if(filmLv===4&&wk){paintNeighbours(el,work);return}
  if(filmLv===4&&!wk){paintConstellation(el,work,1);return}
  if(filmLv===5&&!wk){paintCreditStars(el,work);return}
  if(filmLv>=6){paintCreditStars(el,work);return}
  var kiesza=wk&&filmLv===5;
  var pack=fieldShots(work),list=pack.list||pack,focus=pack.focus||0;
  if(kiesza){
    var kept=list.filter(function(s){return isKiesza(s.src)});
    if(kept.length){
      var want=-1,fi;
      for(fi=0;fi<kept.length;fi++)if(kept[fi].src&&kept[fi].src.indexOf('22/12.webp')>=0)want=fi;
      list=kept;focus=want<0?0:want;
    }
  }
  if(!list.length){list=[{src:poster,t:0,clip:clip}];focus=0}
  var label=kiesza?'Kiesza':work.title;
  el.innerHTML='<div class="filmfield'+(kiesza?' kiesza':'')+'" id="filmfield"><canvas id="zfield"></canvas><h2>'+esc(label)+'</h2>'+
    '<div class="filmcap">'+credHtml(work)+'</div></div>';
  var host=document.getElementById('filmfield');
  var s=list[focus]||list[0];
  var src=!kiesza&&s&&(s.clip||clip);
  if(src){
    var vid=document.createElement('video');
    vid.muted=true;vid.loop=true;vid.autoplay=true;vid.playsInline=true;vid.setAttribute('playsinline','');
    vid.poster=(s&&s.src)||poster;vid.src=src;vid.dataset.i=String(focus);
    host.appendChild(vid);
    var p=vid.play();if(p&&p.catch)p.catch(function(){});
    host._vids=[vid];
  }
  host._list=list;host._focus=focus;host._work=work;
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
  var list=host._list,focus=host._focus||0,sc=filmScale,n=list.length;
  var cols=3;
  var rows=Math.max(1,Math.ceil(n/cols));
  var dw=Math.min(W*0.64,(H/rows)*2.39*1.15);
  list.forEach(function(s,i){
    var c=i%cols,r=(i/cols)|0;
    s._x=(c+0.5)*W/cols;
    s._y=((r+0.5)/rows)*H;
    s._dw=dw;
    s._blur=(i%9===4)?0.45:0;
  });
  var fx=W*0.40,fy=H*0.42;
  var fw=Math.min(W*0.72,420)*Math.min(sc,1.35),fh=fw/2.39;
  var focal=list[focus];
  if(focal){focal._x=fx;focal._y=fy}
  if(host._lines&&list.length>1){
    g.strokeStyle='rgba(214,226,236,.5)';g.lineWidth=1;g.beginPath();
    for(var li=1;li<list.length;li++){g.moveTo(list[li-1]._x,list[li-1]._y);g.lineTo(list[li]._x,list[li]._y)}
    g.moveTo(list[0]._x,list[0]._y);g.lineTo(list[list.length-1]._x,list[list.length-1]._y);
    g.stroke();
  }
  list.forEach(function(s,i){
    if(i===focus)return;
    var im=s.src&&img(s.src);
    if(!(im&&im._ok))return;
    drawFrame(g,s,s._x,s._y,s._dw,s._dw/2.39,s._blur);
  });
  if(focal){
    drawFrame(g,focal,fx,fy,fw,fh,0);
    if(host._vids){
      host._vids.forEach(function(v){
        v.style.left=(fx-fw/2)+'px';v.style.top=(fy-fh/2)+'px';
        v.style.width=fw+'px';v.style.height=fh+'px';
      });
    }
  }
}
function drawFrame(g,s,x,y,dw,dh,blur){
  var im=s.src&&img(s.src);
  g.save();
  if(blur)g.filter='blur('+blur.toFixed(1)+'px)';
  g.globalAlpha=blur?0.72:1;
  if(im&&im._ok){
    g.beginPath();g.rect(x-dw/2,y-dh/2,dw,dh);g.clip();
    var iw=im.naturalWidth,ih=im.naturalHeight,k=Math.max(dw/iw,dh/ih);
    g.drawImage(im,x-iw*k/2,y-ih*k/2,iw*k,ih*k);
  }else{
    g.fillStyle='rgba(16,22,34,.95)';g.fillRect(x-dw/2,y-dh/2,dw,dh);
  }
  g.restore();
}
var ICACHE={};
function img(src){
  if(!src)return null;
  if(ICACHE[src])return ICACHE[src];
  var im=new Image();im.decoding='async';
  im.onload=function(){im._ok=1;if(filmLv>=2)paintField()};
  im.src=src;
  if(im.complete&&im.naturalWidth)im._ok=1;
  ICACHE[src]=im;return im;
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
function paintPhoto(el){
  var work=piece.work,sc=piece.scale||1;
  var src=work.media&&(work.media.big||work.media.thumb)||'';
  el.classList.add('on');
  function cells(list,cls){
    return (list||[]).map(function(it){
      var im=it.media&&(it.media.big||it.media.thumb)||'';
      var cap=shownTitle(it);
      return '<figure'+(it.id===work.id?' class="on"':'')+'><img src="'+esc(im)+'" alt="'+(cap?esc(cap):'')+'">'+(cap?'<figcaption>'+esc(cap)+'</figcaption>':'')+'</figure>';
    }).join('');
  }
  var head=shownTitle(work);
  head=head?'<h2>'+esc(head)+'</h2>':'';
  if(piece.lv<=1){
    el.innerHTML='<div class="sheet full photoseries">'+head+'<div class="series">'+cells(piece.series)+'</div></div>';
    return;
  }
  if(piece.lv===2){
    el.innerHTML='<div class="sheet full">'+head+'<div class="contact">'+cells(piece.sheet)+'</div></div>';
    return;
  }
  if(piece.lv===3){
    if(fly){el.classList.add('on');return}
    el.innerHTML='<div class="herobleed"><img src="'+esc(piece.print||src)+'" alt="">'+(shownTitle(work)?'<h2>'+esc(shownTitle(work))+'</h2>':'')+'</div>';
    return;
  }
  var print=piece.print||src;
  var crops=[[0,0],[70,0],[0,60],[40,45]];
  var cropsHtml=crops.map(function(c){
    return '<figure><img style="object-position:'+c[0]+'% '+c[1]+'%;transform:scale('+(sc||1).toFixed(3)+')" src="'+esc(print)+'" alt=""></figure>';
  }).join('');
  el.innerHTML='<div class="sheet full grainbox">'+head+'<div class="graincrops">'+cropsHtml+'</div></div>';
}
function paintPiece(el){
  if(piece.photo){
    if(piece.lv>=3&&fly){el.classList.add('on');return}
    paintPhoto(el);return;
  }
  if(piece.lv>=2&&fly){el.classList.add('on');return}
  var work=piece.work,shots=piece.shots||[],sc=piece.scale||1;
  el.classList.add('on');
  if(piece.lv<=1){
    var face=work.media&&(work.media.big||work.media.thumb)||'';
    if(work.id==='objects/joio')face='media/pro2/img/objects/cup-top-960.webp';
    if(!face){
      el.innerHTML='<div class="sheet full"><h2>'+esc(work.title)+'</h2><div class="empty-slot">no picture of this piece</div></div>';
      return;
    }
    el.innerHTML='<div class="sheet full"><h2>'+esc(work.title)+'</h2><div class="heroframe push"><img src="'+esc(face)+'" alt=""></div></div>';
    return;
  }
  if(piece.lv===2){
    var ordered=cupFirst(shots).filter(function(s){return s.src});
    var stills=shots.filter(function(s){return !s.clip&&s.src&&!/c\/00\./.test(s.src)}).slice(0,6);
    var show=(ordered.length?ordered.concat(stills):shots.filter(function(s){return s.src}).slice(0,18));
    if(!show.length){
      el.innerHTML='<div class="sheet full"><h2>'+esc(work.title)+'</h2><div class="empty-slot">no process pictures for this piece</div></div>';
      return;
    }
    var cells=show.map(function(s,i){
      var vid=s.clip&&i<6?'<video muted loop autoplay playsinline poster="'+esc(s.src||'')+'" src="'+esc(s.clip)+'"></video>':'';
      var img=s.src?'<img src="'+esc(s.src)+'" alt="">':'';
      return '<figure'+(s.clip?' data-clip="'+esc(s.clip)+'"':'')+'>'+(vid||img)+'</figure>';
    }).join('');
    el.innerHTML='<div class="sheet full cutsheet"><h2>'+esc(work.title)+'</h2><div class="cutgrid">'+cells+'</div></div>';
    return;
  }
  if(fly){el.classList.add('on');return}
  var moving=null,si;
  for(si=0;si<shots.length;si++){
    if(shots[si].clip&&!/c\/00\.|wood-fired/i.test((shots[si].src||'')+' '+(shots[si].title||''))){moving=shots[si];break}
  }
  var stillFace='';
  if(work.id==='objects/joio')stillFace='media/pro2/img/objects/cup-top-960.webp';
  else if(work.media)stillFace=work.media.big||work.media.thumb||'';
  if(!stillFace){for(si=0;si<shots.length;si++)if(shots[si].src){stillFace=shots[si].src;break}}
  if(moving){
    var beside=/joio/i.test(work.id||'')?spiritBeside():'';
    el.innerHTML='<div class="herobleed"><video muted loop autoplay playsinline poster="'+esc(moving.src||stillFace||'')+'" src="'+esc(moving.clip)+'"></video>'+beside+'</div>';
    bindSpirit(el);
    var mv=el.querySelector('video');if(mv){var mp=mv.play();if(mp&&mp.catch)mp.catch(function(){})}
    return;
  }
  if(stillFace){
    el.innerHTML='<div class="herobleed"><img class="push" src="'+esc(stillFace)+'" alt=""></div>';
    return;
  }
  el.innerHTML='<div class="sheet full"><h2>'+esc(work.title)+'</h2><div class="empty-slot">no moving picture of this piece</div></div>';
}
function fitLongTitle(el){
  if(!el)return;
  var nodes=el.querySelectorAll('h2');
  function pass(){
    for(var i=0;i<nodes.length;i++){
      var h=nodes[i],text=h.textContent||'';
      if(text.length<18)continue;
      h.style.whiteSpace='nowrap';
      h.style.letterSpacing='.01em';
      h.style.textTransform='none';
      h.style.fontSize='13px';
      h.style.display='block';
      h.style.transformOrigin='left center';
      h.style.transform='none';
      var max=h.clientWidth||0;
      if(max<48){var p=h.parentElement;max=(p?p.clientWidth:innerWidth)-36}
      if(h.scrollWidth>max-2){
        var s=Math.max(0.62,(max-2)/h.scrollWidth);
        h.style.transform='scaleX('+s.toFixed(3)+')';
      }
    }
  }
  pass();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(pass);
}
function paintLayer(el){
  if(snd&&(fly||snd.empty)){
    el.classList.add('on');
    if(snd.empty&&!fly)el.innerHTML='<div class="sheet full"><h2>'+esc(snd.work.title)+'</h2><div class="empty-slot">no picture for this song</div></div>';
    return;
  }
  if(soundOn){el.classList.remove('on');el.innerHTML='';return}
  if(piece){paintPiece(el);fitLongTitle(el);return}
  if(filmLv>0&&filmWork){paintFilm(el,filmWork);fitLongTitle(el);return}
  if(still){paintStill(el);return}
}

function state(){
  return {
    film:filmLv, scale:+((piece&&piece.scale)||(still?still.scale:filmScale)).toFixed(2),
    board:board?board.title:null, fine:!!(board&&board.fine),
    n:board?board.items.length:0, sound:soundOn?1:0,
    plunge:+(PL.e||0).toFixed(2), work:(filmWork&&filmWork.id)||(piece&&piece.work&&piece.work.id)||null,
    piece:piece?piece.lv:0,
    label:(filmWork&&filmWork.id==='film/weird-kid'&&filmLv===5)?'Kiesza':''
  };
}

window.GJ_DEPTH={
  tick:tick, fly:rush, burst:burst, viewScale:viewScale, drawFx:drawFx,
  pinchIn:pinchIn, pinchOut:pinchOut, sync:sync, owns:owns, paintLayer:paintLayer,
  paintField:paintField, board:function(){return board}, soundOn:function(){return soundOn},
  state:state,
  origin:function(){return {x:PL.ox||0,y:PL.oy||0}}
};
})();
