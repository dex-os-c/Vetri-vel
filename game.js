if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect)CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h){this.rect(x,y,w,h)};
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
const W=960,H=540,GROUND=405,WORLD=6000;
const M={"idle": {"CW": 198, "CH": 208, "AX": 119.60000000000001, "AY": 204.8, "cols": 7, "n": 28}, "walk": {"CW": 186, "CH": 254, "AX": 74.8, "AY": 250.4, "cols": 8, "n": 33}, "run": {"CW": 236, "CH": 197, "AX": 127.60000000000001, "AY": 192.4, "cols": 10, "n": 20}, "attack": {"CW": 272, "CH": 197, "AX": 158.4, "AY": 193.20000000000002, "cols": 7, "n": 34}, "weary": {"CW": 130, "CH": 223, "AX": 75.2, "AY": 219.60000000000002, "cols": 8, "n": 37}, "jump": {"CW": 182, "CH": 224, "AX": 90.4, "AY": 219.60000000000002, "cols": 8, "n": 31}, "hurt": {"CW": 261, "CH": 208, "AX": 158.0, "AY": 203.60000000000002, "cols": 8, "n": 24}, "talk": {"CW": 140, "CH": 236, "AX": 66.0, "AY": 231.60000000000002, "cols": 8, "n": 43}, "soldierA": {"CW": 182, "CH": 253, "AX": 94.0, "AY": 248.4, "cols": 8, "n": 30}, "soldierB": {"CW": 134, "CH": 214, "AX": 66.8, "AY": 210.4, "cols": 8, "n": 47}, "archer": {"CW": 177, "CH": 227, "AX": 81.19999999999999, "AY": 219.1, "cols": 8, "n": 32}, "shield": {"CW": 132, "CH": 217, "AX": 60.9, "AY": 210.7, "cols": 8, "n": 33}, "bearer": {"CW": 179, "CH": 252, "AX": 75.6, "AY": 244.29999999999998, "cols": 8, "n": 37}, "msgRun": {"CW": 174, "CH": 223, "AX": 113.2, "AY": 219.60000000000002, "cols": 5, "n": 10}, "msgStop": {"CW": 163, "CH": 238, "AX": 87.2, "AY": 234.0, "cols": 5, "n": 9}, "msgAnn": {"CW": 154, "CH": 248, "AX": 100.0, "AY": 243.60000000000002, "cols": 7, "n": 21}, "fall": {"CW": 327, "CH": 292, "AX": 150.8, "AY": 253.60000000000002, "cols": 9, "n": 45}, "kidle": {"CW": 180, "CH": 295, "AX": 100.80000000000001, "AY": 285.6, "cols": 8, "n": 37}, "kspeak": {"CW": 187, "CH": 301, "AX": 104.0, "AY": 290.40000000000003, "cols": 8, "n": 44}, "kread": {"CW": 172, "CH": 292, "AX": 92.80000000000001, "AY": 284.0, "cols": 8, "n": 57}};
/* =====================================================================================
   STORY + DIALOGUE  (edit the text here — everything on screen comes from these lists)
   ===================================================================================== */
const STORY=[
 {t:'CHOLA EMPIRE',s:'The reign of Rajendra Chola I'},
 {t:'The long war is over.'},
 {t:'Commander Vetri Vel, the Maharaja\u2019s most trusted commando, leads the surviving soldiers home to Thanjai, the capital.'},
 {t:'Many are wounded. Many did not return. The road is long, and every man on it is tired.'},
 {t:'Walk with them.'}
];
const MSG_LINES=[{who:'Royal Messenger',text:'Commander. His Majesty Rajendra Chola summons you to the palace. Immediately.'}];
/* DRAFT lines marked (draft) are my bridge text — replace them with your own. Your lines are exact. */
const COURT_A=[
 {who:'Rajendra',text:'The campaign is won, Commander. But something stirs on our frontier \u2014 and it is quiet. Too quiet. (draft)'},
 {who:'Vetri',text:'Quiet frontiers do not worry kings, Maharaja. What has been found? (draft)'},
 {who:'Rajendra',text:'Nothing. Rider after rider has gone, and none have returned. (draft)'},
 {who:'Vetri',text:'Then we do not even know what we are facing. (draft)'},
 {who:'Rajendra',text:'Then discover what it is before it reaches our people.'}
];
const COURT_B=[
 {who:'Vetri',text:'What is in that document?'},
 {who:'Rajendra',text:'Information you do not yet need.'},
 {who:'Vetri',text:'If my men die because you withheld it, Maharaja, I will return for an answer.'},
 {who:'Rajendra',text:'Return alive first, Commander.'}
];
const MISSION={title:'THE SILENT FRONTIER',sub:'Mission 01 \u2014 Investigate the abandoned\u2026'};
const NAMECOL={'Vetri':'#e8c27a','Rajendra':'#e0a24a','Royal Messenger':'#cfd8e6'};
/* ============ ANIMATION TWEAK TABLE (every frame comes from your videos) ============ */
const S=0.7;
const ANIMS={
  idle:{sheet:'idle',fps:12,loop:'pingpong',scale:S},walk:{sheet:'walk',speed:125,stride:172,scale:0.64},
  weary:{sheet:'weary',speed:85,stride:131,scale:0.66},run:{sheet:'run',speed:290,stride:240,scale:S},
  talk:{sheet:'talk',fps:8,loop:true,scale:S},jump:{sheet:'jump',pre:[0,6],air:[6,21],post:[21,30],preT:0.25,postT:0.35,scale:S},
  hurt:{sheet:'hurt',fps:24,loop:false,knock:70,scale:S},attack:{sheet:'attack',fps:36,loop:false,step:80,scale:S},
  fall:{sheet:'fall',fps:24,loop:false,scale:S},
  soldierA:{sheet:'soldierA',stride:150,scale:0.58},soldierB:{sheet:'soldierB',stride:190,scale:0.62},
  archer:{sheet:'archer',stride:150,scale:0.64},shield:{sheet:'shield',stride:150,scale:0.66},bearer:{sheet:'bearer',stride:155,scale:0.6},
  kidle:{sheet:'kidle',fps:8,loop:'pingpong',scale:0.66},kspeak:{sheet:'kspeak',fps:8,loop:'pingpong',scale:0.66},kread:{sheet:'kread',fps:12,loop:false,scale:0.66},
  msgRun:{sheet:'msgRun',stride:175,scale:0.6},msgStop:{sheet:'msgStop',fps:12,scale:0.6},msgAnn:{sheet:'msgAnn',fps:8,loop:'pingpong',scale:0.6,native:-1}
};
const SHEETS=Object.keys(M);
const IMG={},BGI={};let loaded=0;const BGN=['temple','banyan','road','court','pillars','scroll'];const total=SHEETS.length+BGN.length;
const done=()=>{if(++loaded==total)requestAnimationFrame(loop)};
SHEETS.forEach(n=>{const i=new Image();i.onload=done;i.src=(window.ASSETS&&window.ASSETS[n])||('assets/'+n+'.webp');IMG[n]=i});
BGN.forEach(n=>{const i=new Image();i.onload=done;i.src=(window.ASSETS&&window.ASSETS['bg_'+n])||('assets/bg_'+n+'.webp');BGI[n]=i});
const keys={};
const lerp=(a,b,t)=>a+(b-a)*t,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),ease=t=>t*t*(3-2*t);
let seed=5;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
/* ---------------- global state ---------------- */
let mode='scene',scn='intro',ph='cards',T=0,camX=0,zoom=1,zoomT=1,zf={x:W/2,y:GROUND-110},fade=1,fadeT=1,bars=0,barsT=0,ci=0;
const p={x:300,y:GROUND,vy:0,face:1,anim:'idle',t:0,ph:0,air:false,atk:false,jp:null,jt:0,hurt:-1,dead:-1,talk:false,weary:false,lock:false,moving:false};
let ms=null,sol=[],c2={},fx=[];   // messenger, crowd, court-scene state, particles
const dl={q:[],i:0,typed:0,hold:0,active:false,done:null};
function say(lines,done){dl.q=lines;dl.i=0;dl.typed=0;dl.hold=0;dl.active=true;dl.done=done||null}
function dlAdvance(){if(!dl.active)return;const L=dl.q[dl.i];if(dl.typed<L.text.length){dl.typed=L.text.length;return}
  dl.i++;dl.typed=0;dl.hold=0;if(dl.i>=dl.q.length){dl.active=false;const d=dl.done;dl.done=null;if(d)d()}}
function dlUpdate(dt){if(!dl.active)return;const L=dl.q[dl.i];dl.typed+=dt*40;
  if(dl.typed>=L.text.length){dl.hold+=dt;if(dl.hold>1.5+L.text.length*0.028)dlAdvance()}}
function go(s,pp){scn=s;ph=pp;T=0}
function setBars(v){barsT=v}
function sync(){const b=document.body;if(!b||!b.dataset)return;b.dataset.mode=mode;
  b.dataset.walk=(mode==='free'||(scn==='s1'&&ph==='walk')||(scn==='road'&&ph==='walk')||(scn==='yard'&&cb&&cb.e&&!cb.e.dead))?'1':'0';b.dataset.scn=scn}
/* ---------------- helpers ---------------- */
function set(a){if(p.anim!==a){p.anim=a;p.t=0}}
function blit(name,f,x,y,face,scale,alpha){
  const a=ANIMS[name],m=M[a.sheet];f=clamp(f|0,0,m.n-1);
  ctx.save();ctx.globalAlpha=alpha==null?1:alpha;ctx.translate(x,y);ctx.scale(face*(a.native||1)*scale,scale);
  ctx.drawImage(IMG[a.sheet],(f%m.cols)*m.CW,Math.floor(f/m.cols)*m.CH,m.CW,m.CH,-m.AX,-m.AY,m.CW,m.CH);ctx.restore();
}
function shadow(x,y,r,a){a=a==null?1:a;ctx.save();ctx.translate(x,y+3);ctx.scale(1,0.2);const g=ctx.createRadialGradient(0,0,r*0.1,0,0,r);g.addColorStop(0,'rgba(0,0,0,'+(.55*a)+')');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();ctx.restore()}
function pingpong(f,n){const c=2*(n-1),k=f%c;return k>=n?c-k:k}
/* ---------------- particles: dust puffs + drifting motes ---------------- */
function puff(x,y,dir){fx.push({k:'puff',x,y,vx:-dir*(8+rnd()*14),vy:-(4+rnd()*8),r:3+rnd()*3,life:0,max:.55+rnd()*.3})}
const MOTES=[];for(let i=0;i<46;i++)MOTES.push({x:rnd()*W,y:rnd()*H*0.85,s:.4+rnd()*1.2,r:.8+rnd()*1.8,ph:rnd()*6.28,v:6+rnd()*14});
function fxUpdate(dt){for(const f of fx){f.life+=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.k==='puff')f.r+=dt*10;else if(f.k==='leaf'){f.rot+=dt*2.2;f.y+=Math.sin(f.life*3+f.rot)*18*dt}else if(f.k==='spark')f.vy+=500*dt}fx=fx.filter(f=>f.life<f.max);
  for(const m of MOTES){m.x+=m.v*dt*m.s;m.y+=Math.sin(T*.6+m.ph)*8*dt;if(m.x>W+10){m.x=-10;m.y=rnd()*H*0.85}}}
function fxDraw(){
  for(const f of fx){const k=1-f.life/f.max;
    if(f.k==='leaf'){ctx.save();ctx.translate(f.x-camX,f.y);ctx.rotate(f.rot);ctx.fillStyle='rgba(120,88,46,'+(.7*Math.min(1,k*2))+')';ctx.beginPath();ctx.ellipse(0,0,f.r*1.7,f.r*.8,0,0,7);ctx.fill();ctx.restore()}
    else if(f.k==='spark'){ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,220,150,'+k+')';ctx.beginPath();ctx.arc(f.x-camX,f.y,f.r,0,7);ctx.fill();ctx.restore()}
    else{ctx.fillStyle='rgba(176,138,102,'+k*0.32+')';ctx.beginPath();ctx.arc(f.x-camX,f.y,f.r,0,7);ctx.fill()}}
}
function motesDraw(col){ctx.save();ctx.globalCompositeOperation='lighter';
  for(const m of MOTES){const a=.14+.12*Math.sin(T*1.3+m.ph);ctx.fillStyle=col.replace('A',a.toFixed(3));ctx.beginPath();ctx.arc(m.x,m.y,m.r,0,7);ctx.fill()}ctx.restore()}
/* ---------------- player ---------------- */
function updatePlayer(dt){
  const left=keys.KeyA||keys.ArrowLeft,right=keys.KeyD||keys.ArrowRight,run=keys.ShiftLeft||keys.ShiftRight;
  let dir=(right?1:0)-(left?1:0);const free=mode==='free',walkOK=free||(scn==='s1'&&ph==='walk')||(scn==='road'&&ph==='walk');
  if(p.lock||!walkOK)dir=0;
  if(mode==='scene'&&dir<0)dir=0;
  p.vy+=1900*dt;p.y+=p.vy*dt;let landed=false;if(p.y>=GROUND){if(p.air)landed=true;p.y=GROUND;p.vy=0;p.air=false}
  if(p.dead>=0){p.dead+=dt;if(p.dead>M.fall.n/24+3.6){p.dead=-1;p.talk=false;set('idle')}return}
  if(p.hurt>=0){p.hurt+=dt;const A=ANIMS.hurt;if(p.hurt<0.4)p.x-=p.face*A.knock*dt;if(p.hurt*A.fps>=M.hurt.n){p.hurt=-1;set('idle')}p.t+=dt;return}
  const J=ANIMS.jump;
  if(free){
    if((keys.KeyW||keys.ArrowUp||keys.Space)&&!p.air&&!p.atk&&!p.jp){p.jp='pre';p.jt=0}
    if(p.jp==='pre'){p.jt+=dt;dir=0;if(p.jt>=J.preT){p.vy=-780;p.air=true;p.jp='air';p.jt=0}}
    else if(p.jp==='air'&&landed){p.jp='post';p.jt=0}
    else if(p.jp==='post'){p.jt+=dt;if(p.jt>=J.postT)p.jp=null}
    if((keys.KeyJ||keys.KeyX)&&!p.atk&&!p.air&&!p.jp){p.atk=true;p.talk=false;set('attack')}
  }
  const wk=p.weary?'weary':'walk',rn=(free||scn==='road')&&run&&!p.weary;let mv=0;
  if(p.atk){const A=ANIMS.attack,f=p.t*A.fps,n=M.attack.n;if(dir)p.face=dir;if(f>n*0.1&&f<n*0.55)p.x+=p.face*80*dt}
  else if(dir){p.face=dir;p.talk=false;mv=ANIMS[rn?'run':wk].speed*dt;p.x+=dir*mv}
  p.x=clamp(p.x,60,WORLD-60);p.t+=dt;
  if(p.atk){if(p.t*ANIMS.attack.fps>=M.attack.n){p.atk=false;set('idle')}}
  else if(p.jp)set('jump');
  else if(dir){const k=rn?'run':wk;if(p.anim!==k)set(k);if(!p.air)p.ph+=mv/ANIMS[k].stride}
  else set(p.talk?'talk':'idle');
  p.moving=!!dir&&mv>0;
  if(p.moving&&!p.air&&Math.floor(p.ph*2)!==p._pf){p._pf=Math.floor(p.ph*2);puff(p.x-p.face*14,GROUND,p.face)}
}
function frameFor(a,m,n){
  if(['walk','run','weary'].includes(p.anim))return Math.floor(p.ph*n)%n;
  if(p.anim==='jump'){if(p.jp==='pre')return Math.min(a.pre[1],a.pre[0]+Math.floor(p.jt/a.preT*(a.pre[1]-a.pre[0])));
    if(p.jp==='post')return Math.min(a.post[1],a.post[0]+Math.floor(p.jt/a.postT*(a.post[1]-a.post[0])));
    const pr=clamp((p.vy+780)/1560,0,1);return a.air[0]+Math.round(pr*(a.air[1]-a.air[0]))}
  const f=Math.floor(p.t*a.fps);
  if(a.loop==='pingpong')return pingpong(f,n);
  return a.loop?f%n:Math.min(f,n-1);
}
function drawPlayer(){
  const dx=p.x-camX;let name=p.anim,f,alpha=1;
  if(p.dead>=0){name='fall';const n=M.fall.n,d=p.dead;f=Math.min(Math.floor(d*24),n-1);
    const hold=n/24;alpha=d<hold+1.6?1:Math.max(0,1-(d-hold-1.6)/0.9);if(d>hold+2.7){name='idle';f=0;alpha=Math.min(1,(d-hold-2.7)*1.2)}}
  else if(p.hurt>=0){name='hurt';f=Math.min(Math.floor(p.hurt*24),M.hurt.n-1)}
  const a=ANIMS[name],m=M[a.sheet];if(f===undefined)f=frameFor(a,m,m.n);
  shadow(dx,GROUND,50*(1-(GROUND-p.y)/500)*(p.dead>=0?0.6:1),alpha);
  blit(name,f,dx,p.y,p.face,a.scale,alpha);
}
/* ---------------- crowd ---------------- */
function makeCrowd(){const a=[];const kinds=['soldierA','archer','shield','soldierB','archer','shield','soldierA','shield','archer'];
  for(let i=0;i<40;i++){const bearer=(i===7||i===19||i===31),row=bearer?0:i%3,k=bearer?'bearer':kinds[Math.floor(rnd()*kinds.length)];
    a.push({k,off:120+i*24+rnd()*30,row,rate:2.0+rnd()*2.0,sc:(0.92+rnd()*0.14)*(1-0.07*row),ph:rnd(),sm:0.9+rnd()*0.2,x:0,mv:false,pf:0})}return a}
function updateCrowd(dt){sol.forEach(s=>{const t=p.x-s.off;const prev=s.x;s.x+=(t-s.x)*Math.min(1,s.rate*dt);
  const d=s.x-prev;s.mv=Math.abs(d)>0.04;if(s.mv){s.ph+=Math.abs(d)/(ANIMS[s.k].stride*s.sm);
    const q=Math.floor(s.ph*2);if(q!==s.pf){s.pf=q;if(s.row===0&&Math.abs(s.x-camX-W/2)<W/2+60&&rnd()<0.5)puff(s.x-12,GROUND-s.row*9,1)}}})}
function drawSoldiers(){
  for(let row=2;row>=0;row--){
    for(const s of sol){if(s.row!==row)continue;const a=ANIMS[s.k],n=M[s.k].n,dx=s.x-camX;if(dx<-220||dx>W+220)continue;
      const y=GROUND-row*9;shadow(dx,y,36*s.sc,0.8);
      blit(s.k,Math.floor((s.ph%1)*n)%n,dx,y,1,a.scale*s.sc,row===2?0.88:row===1?0.94:1)}
  }
}
/* =====================  SCENE 1 : THE RETURN  ===================== */
function startScene(){
  mode='scene';scn='intro';ph='cards';T=0;ci=0;seed=5;
  p.x=300;p.y=GROUND;p.vy=0;p.face=1;p.dead=-1;p.hurt=-1;p.jp=null;p.atk=false;p.talk=false;p.weary=true;p.lock=false;set('idle');
  camX=0;zoom=zoomT=1;fade=1;fadeT=0;bars=barsT=0;ms=null;fx=[];dl.active=false;
  sol=makeCrowd();sol.forEach(o=>{o.x=p.x-o.off});c2={};sync();
}
function startFree(){mode='free';p.weary=false;p.lock=false;p.x=Math.max(p.x,300);zoom=zoomT=1;fade=0;fadeT=0;bars=barsT=0;ms=null;sol=[];dl.active=false;scn='free';ph='free';sync()}
function skipScene(){
  if(mode!=='scene')return;dl.active=false;
  if(scn==='intro'){go('s1','walk');fadeT=0}
  else if(scn==='s1'){p.lock=true;beginCourt()}
  else if(scn==='s2'){go('title','show');fade=1;fadeT=1}
  else if(scn==='title'){beginRoad()}
  else if(scn==='road'){beginYard()}
  else if(scn==='yard'){go('chap','card');fade=1;fadeT=1}
  else if(scn==='chap'){go('chap','end')}
  sync();
}
function updateS1(dt){
  updateCrowd(dt);
  const lockPhases=['lock','msgIn','msgStop','ann','look','fade'];
  fadeT=ph==='fade'?1:0;
  if(ph==='walk'){setBars(0);if(T>1.0&&!p.moving)c2.hintT=(c2.hintT||0)+dt;if(p.x>=1800){go('s1','lock');p.lock=true}}
  else if(ph==='lock'){setBars(1);p.talk=true;if(T>0.7){go('s1','msgIn');ms={x:p.x+900,anim:'run',t:0,ph:0,v:430}}}
  else if(ph==='msgIn'){ms.t+=dt;ms.x-=ms.v*dt;ms.ph+=ms.v*dt/ANIMS.msgRun.stride;if(Math.floor(ms.t*5)!==ms.pf){ms.pf=Math.floor(ms.t*5);puff(ms.x+14,GROUND,-1)}
    if(ms.x<=p.x+330){go('s1','msgStop');ms.anim='stop';ms.t=0}}
  else if(ph==='msgStop'){ms.t+=dt;const k=ms.t/0.75;if(k<1)ms.x-=lerp(150,0,k)*dt;else{go('s1','ann');ms.anim='ann';ms.t=0;say(MSG_LINES,()=>{go('s1','look')})}}
  else if(ph==='ann'){ms.t+=dt}
  else if(ph==='look'){if(T>3.4)go('s1','fade')}
  else if(ph==='fade'){if(T>1.5)beginCourt()}
  let cx;
  if(['msgIn','msgStop','ann'].includes(ph)&&ms){cx=ms.x-W/2+60;zoomT=ph==='ann'?1.22:1.04}
  else if(ph==='look'||ph==='fade'){cx=p.x-W/2+Math.min(T,3)*90;zoomT=1.1}
  else{cx=p.x-W/2;zoomT=1}
  camX+=(clamp(cx,0,WORLD-W)-camX)*Math.min(1,(ph==='msgIn'?9:3.2)*dt);
}
function drawMsg(){
  if(!ms)return;const dx=ms.x-camX;shadow(dx,GROUND,46);
  if(ms.anim==='run')blit('msgRun',Math.floor(ms.ph*M.msgRun.n)%M.msgRun.n,dx,GROUND,-1,ANIMS.msgRun.scale);
  else if(ms.anim==='stop')blit('msgStop',Math.min(M.msgStop.n-1,Math.floor(ms.t*12)),dx,GROUND,-1,ANIMS.msgStop.scale);
  else blit('msgAnn',pingpong(Math.floor(ms.t*8),M.msgAnn.n),dx,GROUND,-1,ANIMS.msgAnn.scale);
}
function bg(){
  const Tm=BGI.temple,tw=Tm.width,th=Tm.height,o1=camX*0.12,i1=Math.floor(o1/tw);
  ctx.fillStyle='#6f3340';ctx.fillRect(0,0,W,H);
  for(let i=i1;i*tw-o1<W+2;i++){const x=i*tw-o1,y=GROUND+8-th;
    if(i%2){ctx.save();ctx.translate(x+tw,y);ctx.scale(-1,1);ctx.drawImage(Tm,0,0,tw+1,th);ctx.restore()}else ctx.drawImage(Tm,x,y,tw+1,th)}
  // banyan grove: contiguous mirrored tiles so the canopy never ends in a hard cut
  const B=BGI.banyan,bw=B.width,o2=camX*0.34,i2=Math.floor(o2/bw);
  for(let i=i2;i*bw-o2<W+2;i++){const x=i*bw-o2,y=GROUND-6-410;
    if(i%2){ctx.save();ctx.translate(x+bw,y);ctx.scale(-1,1);ctx.drawImage(B,0,0);ctx.restore()}else ctx.drawImage(B,x-(i%2?0:0),y)}
  const hz=ctx.createLinearGradient(0,GROUND-140,0,GROUND);hz.addColorStop(0,'rgba(110,60,100,0)');hz.addColorStop(1,'rgba(110,60,100,.22)');ctx.fillStyle=hz;ctx.fillRect(0,GROUND-140,W,140);
  const R=BGI.road,rw=R.width,off=camX%rw;ctx.fillStyle='#4a2c28';ctx.fillRect(0,GROUND-14,W,H+140);
  for(let x=-off;x<W;x+=rw)ctx.drawImage(R,x,GROUND-16);
  const gr=ctx.createLinearGradient(0,GROUND-16,0,GROUND+22);gr.addColorStop(0,'rgba(80,45,70,.45)');gr.addColorStop(1,'rgba(80,45,70,0)');ctx.fillStyle=gr;ctx.fillRect(0,GROUND-16,W,38);
}
/* =====================  SCENE 2 : THE KING'S COURT  ===================== */
const COURT_GY=452,CS=1.2;                    // carpet line + character size boost inside the hall
const KING={x:735,y:408},SCROLL={x:672,y:408};
const LAMPS=[[195,500],[765,500],[1015,478],[1315,628],[275,255],[1035,255]];
function beginCourt(){
  scn='s2';ph='in';T=0;mode='scene';p.lock=true;p.weary=true;camX=0;zoom=zoomT=1;zf={x:W/2,y:GROUND-110};
  c2={vx:-90,vface:1,vph:0,vmode:'walk',kt:0,readT:0,reportOn:true};
  ms=null;sol=[];fx=[];dl.active=false;fade=1;fadeT=0;setBars(1);sync();
}
function drawCourt(){
  const C=BGI.court;ctx.fillStyle='#17100d';ctx.fillRect(-120,0,W+240,H+200);
  ctx.drawImage(C,0,0,W,536);
  ctx.drawImage(C,0,500,W,36,0,536,W,160);          // keep the stone floor going when the view shifts up
  const fg=ctx.createLinearGradient(0,536,0,H+160);fg.addColorStop(0,'rgba(10,6,6,0)');fg.addColorStop(1,'rgba(10,6,6,.7)');ctx.fillStyle=fg;ctx.fillRect(0,536,W,160);
  ctx.save();ctx.globalCompositeOperation='lighter';
  LAMPS.forEach((l,i)=>{const x=l[0]*0.698,y=l[1]*0.698,fl=.78+.22*Math.sin(T*9+i*1.7),r=70*fl;
    const g=ctx.createRadialGradient(x,y,2,x,y,r);g.addColorStop(0,'rgba(255,190,90,.42)');g.addColorStop(1,'rgba(255,140,40,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r)});
  ctx.restore();
}
function kingSprite(){
  if(ph==='read')return ['kread',Math.min(M.kread.n-1,Math.floor(c2.readT*12))];
  if(dl.active&&dl.q[dl.i].who==='Rajendra')return ['kspeak',pingpong(Math.floor(c2.kt*8),M.kspeak.n)];
  return ['kidle',pingpong(Math.floor(c2.kt*8),M.kidle.n)];
}
function drawS2(){
  drawCourt();
  // the sealed report lying on the dais edge
  if(c2.reportOn){const S_=BGI.scroll,sw=S_.width*0.3,sh=S_.height*0.3,gl=.5+.5*Math.sin(T*3);
    ctx.save();ctx.globalCompositeOperation='lighter';const gg=ctx.createRadialGradient(SCROLL.x,SCROLL.y-10,2,SCROLL.x,SCROLL.y-10,60);gg.addColorStop(0,'rgba(255,70,60,'+(0.22+0.2*gl)+')');gg.addColorStop(1,'rgba(255,70,60,0)');ctx.fillStyle=gg;ctx.fillRect(SCROLL.x-62,SCROLL.y-72,124,124);ctx.restore();
    ctx.drawImage(S_,SCROLL.x-sw/2,SCROLL.y-sh+4,sw,sh)}
  // Rajendra
  const [kn,kf]=kingSprite();shadow(KING.x,KING.y,52);blit(kn,kf,KING.x,KING.y,-1,ANIMS[kn].scale*CS);
  // Vetri
  const vx=c2.vx;shadow(vx,COURT_GY,58);
  if(c2.vmode==='walk')blit('weary',Math.floor(c2.vph*M.weary.n)%M.weary.n,vx,COURT_GY,c2.vface,ANIMS.weary.scale*CS);
  else blit('talk',Math.floor(c2.kt*8)%M.talk.n,vx,COURT_GY,c2.vface,ANIMS.talk.scale*CS);
  // foreground pillars on the left frame the shot
  ctx.save();ctx.beginPath();ctx.rect(0,0,W*0.27,H+200);ctx.clip();ctx.drawImage(BGI.pillars,0,0,W,536);ctx.restore();
}
function updateS2(dt){
  c2.kt+=dt;const V=ANIMS.weary;
  if(ph==='in'){fadeT=T>0.5?0:1;if(T>0.6){c2.vph+=95*dt/(V.stride*CS);c2.vx+=95*dt;if(c2.vx>=300){c2.vx=300;c2.vmode='talk';go('s2','talkA');say(COURT_A,()=>{go('s2','notice')})}}}
  else if(ph==='talkA'){fadeT=0}
  else if(ph==='notice'){fadeT=0;if(T>2.6){go('s2','talkB');say(COURT_B,()=>{go('s2','leave');c2.vface=-1;c2.vmode='walk'})}}
  else if(ph==='leave'){fadeT=0;c2.vph+=95*dt/(V.stride*CS);c2.vx-=95*dt;if(c2.vx<-110){go('s2','read');c2.reportOn=false}}
  else if(ph==='read'){fadeT=T>6.6?1:0;c2.readT=T;if(T>8){go('title','show');fade=1;fadeT=1;setBars(0);sync()}}
  let fx_=W/2,fy_=COURT_GY-110,z=1;
  if(dl.active){const w=dl.q[dl.i].who;if(w==='Rajendra'){fx_=KING.x-30;fy_=KING.y-120;z=1.22}else{fx_=c2.vx+30;fy_=COURT_GY-120;z=1.18}}
  else if(ph==='notice'){fx_=SCROLL.x-40;fy_=SCROLL.y-40;z=1.5}
  else if(ph==='read'){fx_=KING.x-20;fy_=KING.y-120;z=1.4}
  zf.x+=(fx_-zf.x)*Math.min(1,2.4*dt);zf.y+=(fy_-zf.y)*Math.min(1,2.4*dt);zoomT=z;
}
/* =====================================================================================
   CHAPTER 1 — THE SILENT FRONTIER : audio, companions, Part 1 (leaving the capital), Part 2 (the forest road)
   ===================================================================================== */
const PART1=[
 {who:'Young Soldier',text:'A missing garrison. Three months without a message. And the king sends only five men?'},
 {who:'Commander',text:'Five men who can think are worth more than fifty who cannot.'},
 {who:'Veteran',text:'And five dead men are worth nothing.'},
 {who:'Commander',text:'Then let us try not to become five dead men.'}
];
const CLUE1=[{who:'Scout',text:'They abandoned food and weapons. Soldiers don\u2019t do that unless they\u2019re running from something.'}];
const CLUE2=[{who:null,text:'The watchtower is damaged, but there are no clear signs of a siege. Its ladder has been pulled down, and the warning bell is missing.'},
 {who:'Commander',text:'An enemy would destroy the tower from outside.'},{who:'Veteran',text:'Unless the enemy was already inside.'}];
const CLUE3=[{who:null,text:'A dead horse lies beside the road. Its message tube is empty, and the ground is marked by dozens of footprints. Most tracks point toward the capital.'},
 {who:'Commander',text:'They weren\u2019t marching toward the fort.'},{who:'Scout',text:'They were running away from it.'},{who:'Veteran',text:'Then where are they?'}];
const BELL1=[{who:null,text:'A faint metallic sound comes from somewhere inside the settlement.\n\u2014 Clang.'}];
const BELL2=[{who:null,text:'Everyone turns. The bell rings again.\n\u2014 Clang.\nThe sound comes from the garrison courtyard.'},
 {who:'Scout',text:'Commander\u2026 the watchtower bell was missing.'},{who:'Commander',text:'Then someone has found another.'}];
NAMECOL.Commander='#e8c27a';NAMECOL['Young Soldier']='#9fd0a0';NAMECOL.Veteran='#c9b48a';NAMECOL.Scout='#cfd8e6';
/* ---------------- audio (all synthesized, no files) ---------------- */
const sfx=(()=>{
  let ac=null,m=null,rum=null;const AC=(typeof window!=='undefined')&&(window.AudioContext||window.webkitAudioContext);
  function init(){if(ac||!AC)return;try{ac=new AC();m=ac.createGain();m.gain.value=.55;m.connect(ac.destination)}catch(e){ac=null}}
  function resume(){init();if(ac&&ac.state==='suspended')ac.resume()}
  function osc(f,t,d,type,v,f2){if(!ac)return;const o=ac.createOscillator(),g=ac.createGain(),n=ac.currentTime+t;o.type=type||'sine';o.frequency.setValueAtTime(f,n);
    if(f2)o.frequency.exponentialRampToValueAtTime(f2,n+d);g.gain.setValueAtTime(0,n);g.gain.linearRampToValueAtTime(v,n+.006);g.gain.exponentialRampToValueAtTime(.0001,n+d);o.connect(g);g.connect(m);o.start(n);o.stop(n+d+.05)}
  function noise(t,d,v,type,f1,f2){if(!ac)return;const len=Math.floor(ac.sampleRate*d),b=ac.createBuffer(1,len,ac.sampleRate),a=b.getChannelData(0);for(let i=0;i<len;i++)a[i]=Math.random()*2-1;
    const s=ac.createBufferSource();s.buffer=b;const fl=ac.createBiquadFilter(),n=ac.currentTime+t;fl.type=type||'lowpass';fl.frequency.setValueAtTime(f1,n);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,n+d);
    const g=ac.createGain();g.gain.setValueAtTime(v,n);g.gain.exponentialRampToValueAtTime(.0001,n+d);s.connect(fl);fl.connect(g);g.connect(m);s.start(n)}
  return{resume,
    bell(v){v=v||1;[1,2.01,2.76,4.07,5.4].forEach((k,i)=>osc(430*k,0,2.8/(1+i*.6),'sine',v*.24/(1+i*.8)))},
    clash(){noise(0,.18,.5,'highpass',2500);osc(1900,0,.35,'triangle',.14);osc(2850,0,.28,'triangle',.1)},
    parry(){noise(0,.22,.6,'highpass',3200);osc(2400,0,.5,'triangle',.2);osc(3600,0,.4,'triangle',.12);osc(900,0,.25,'sine',.2)},
    hit(){noise(0,.16,.6,'lowpass',900,200);osc(120,0,.2,'sine',.5,50)},
    swing(h){noise(0,h?.45:.22,.26,'bandpass',h?500:900,h?1800:3200)},
    dodge(){noise(0,.2,.18,'bandpass',1200,400)},
    door(){osc(70,0,1.4,'sawtooth',.16,42);noise(0,1.0,.1,'lowpass',200,80)},
    thud(){osc(70,0,.5,'sine',.7,35);noise(0,.25,.3,'lowpass',300,80)},
    bird(){const f=2200+Math.random()*1400;osc(f,0,.09,'sine',.06,f*1.25);osc(f*1.1,.12,.08,'sine',.05,f*1.4)},
    cricket(){for(let i=0;i<3;i++)osc(4300,i*.07,.04,'square',.012)},
    rumble(on,lvl){if(!ac)return;lvl=lvl==null?.5:lvl;
      if(on&&!rum){const len=ac.sampleRate*2,b=ac.createBuffer(1,len,ac.sampleRate),a=b.getChannelData(0);let l=0;for(let i=0;i<len;i++){l=(l+0.02*(Math.random()*2-1))/1.02;a[i]=l*3.5}
        const s=ac.createBufferSource();s.buffer=b;s.loop=true;const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=140;const g=ac.createGain();g.gain.value=0;
        const lfo=ac.createOscillator(),lg=ac.createGain();lfo.frequency.value=.28;lg.gain.value=.25;lfo.connect(lg);lg.connect(g.gain);s.connect(f);f.connect(g);g.connect(m);s.start();lfo.start();rum={s,g,lfo}}
      if(rum){rum.g.gain.setTargetAtTime(on?lvl*.7:0,ac.currentTime,.6);if(!on){const r=rum;rum=null;setTimeout(()=>{try{r.s.stop();r.lfo.stop()}catch(e){}},2500)}}}
  }})();
if(typeof addEventListener!=='undefined'){['pointerdown','keydown','touchstart'].forEach(e=>addEventListener(e,()=>sfx.resume(),{passive:true}))}
/* ---------------- the five companions ---------------- */
let party=[],rd={};
function makeParty(){return [
  {id:'scout',k:'scout',off:-120,x:0,ph:0,mv:false,ph2:0},{id:'archer',k:'archer',off:110,x:0,ph:0,mv:false},
  {id:'young',k:'soldierA',off:190,x:0,ph:0.3,mv:false},{id:'shield',k:'shield',off:270,x:0,ph:0.6,mv:false},{id:'vet',k:'soldierB',off:350,x:0,ph:0.1,mv:false}]}
function updateParty(dt,follow){
  party.forEach(s=>{if(!follow)return;const t=p.x-s.off,prev=s.x;s.x+=(t-s.x)*Math.min(1,2.6*dt);const d=Math.abs(s.x-prev);s.mv=d>0.05;
    if(s.mv){const st=s.k==='scout'?ANIMS.msgRun.stride:ANIMS[s.k].stride;s.ph+=d/st;
      const q=Math.floor(s.ph*2);if(q!==s.pf){s.pf=q;if(rnd()<0.35)puff(s.x-10,GROUND,1)}}})}
function drawParty(){
  for(const s of party){const dx=s.x-camX;if(dx<-200||dx>W+200)continue;shadow(dx,GROUND,40);
    if(s.k==='scout'){if(s.mv)blit('msgRun',Math.floor((s.ph%1)*M.msgRun.n)%M.msgRun.n,dx,GROUND,s.face||1,ANIMS.msgRun.scale);else blit('msgStop',M.msgStop.n-1,dx,GROUND,s.face||1,ANIMS.msgStop.scale)}
    else{const n=M[s.k].n;blit(s.k,s.mv?Math.floor((s.ph%1)*n)%n:Math.floor((s.ph%1)*n)%n,dx,GROUND,s.face||1,ANIMS[s.k].scale)}}
}
/* ---------------- Part 1: the gate closes, the party gathers ---------------- */
function beginRoad(){
  scn='road';ph='gate';T=0;mode='scene';p.x=150;p.y=GROUND;p.face=1;p.lock=true;p.weary=false;p.talk=false;p.hurt=-1;p.dead=-1;p.atk=false;p.jp=null;set('idle');
  camX=0;zoom=zoomT=1;zf={x:W/2,y:GROUND-110};fade=1;fadeT=0;setBars(1);fx=[];dl.active=false;seed=9;
  party=makeParty();const px=[360,430,500,575,650];party.forEach((s,i)=>{s.x=px[[4,3,2,1,0][i]]});
  party[0].x=700;party[1].x=585;party[2].x=515;party[3].x=445;party[4].x=380;      // scout leads, veteran guards the rear
  rd={close:0,step:0,mood:0,pause:0,zoomK:null,blade:false,smile:0,bellT:0};sync();
}
function sceneEnd(){go('end','end');sync()}
/* ---------------- Part 2: the forest road ---------------- */
const RX={clue1:1450,clue2:2600,clue3:3750,bell:4300,end:4950};
function roadSay(lines,after){p.lock=true;say(lines,()=>{p.lock=false;if(after)after()})}
function updateRoad(dt){
  fadeT=0;rd.mood=clamp((p.x-1200)/3200,0,1)*0.8+(rd.step>=4?0.2:0);
  if(ph==='gate'){
    if(T<0.4)fadeT=1;
    const walkIn=p.x<780;
    if(walkIn&&T>0.5){p.x+=105*dt;p.face=1;set('walk');p.ph+=105*dt/ANIMS.walk.stride;p.moving=true;if(Math.floor(p.ph*2)!==p._pf){p._pf=Math.floor(p.ph*2);puff(p.x-14,GROUND,1)}}
    else if(!walkIn&&!p.lock0){p.lock0=true;set('idle')}
    if(p.x>250&&rd.close<1){if(rd.close===0)sfx.door();rd.close=Math.min(1,rd.close+dt/3.4)}
    if(!walkIn&&!dl.active&&!rd.said&&rd.close>=1){rd.said=true;p.talk=true;say(PART1,()=>{go('road','smile')})}
    camX=0;
  }else if(ph==='smile'){
    rd.smile=T;zf.x+=((party[4].x-camX)-zf.x)*Math.min(1,3*dt);zoomT=1.5;
    if(T>2.4){zoomT=1;go('road','walk');p.lock=false;p.talk=false;setBars(0);sync()}
  }else if(ph==='walk'){
    if(rd.step===0&&p.x>=RX.clue1){rd.step=1;roadSay(CLUE1,null);rd.zoomK=[RX.clue1+160,1.3]}
    else if(rd.step===1&&p.x>=RX.clue2){rd.step=2;roadSay(CLUE2,null);rd.zoomK=[RX.clue2+200,1.25]}
    else if(rd.step===2&&p.x>=RX.clue3){rd.step=3;roadSay(CLUE3,()=>{go('road','bell')});rd.zoomK=[RX.clue3+180,1.3]}
    else if(rd.step===4&&p.x>=RX.end){go('road','toYard');p.lock=true}
    if(!dl.active)rd.zoomK=null;
    // ambient: birds early, silence later
    rd.bt=(rd.bt||0)-dt;if(rd.bt<0){rd.bt=1.2+rnd()*3;const pr=1-rd.mood*1.4;if(rnd()<pr)sfx.bird();else if(rd.mood<0.8&&rnd()<.5)sfx.cricket()}
    if(rnd()<dt*(1.6-rd.mood))fx.push({k:'leaf',x:camX+W+20+rnd()*200,y:30+rnd()*260,vx:-(40+rnd()*50),vy:20+rnd()*30,r:2+rnd()*2.2,life:0,max:7,rot:rnd()*6})
  }else if(ph==='bell'){
    // metallic sound, the party turns, the bell rings again
    p.lock=true;rd.bellT+=dt;
    if(!rd.b1&&rd.bellT>0.6){rd.b1=true;sfx.bell(.35);say(BELL1,()=>{rd.bellT=1.3})}
    if(rd.b1&&!dl.active&&!rd.b2&&rd.bellT>=1.3){rd.b2=true;sfx.bell(.9);rd.shake=.6;party.forEach(s=>s.face=1);say(BELL2,()=>{rd.step=4;p.lock=false;rd.blade=true;p.weary=false;go('road','walk');rd.bellDone=true})}
    if(rd.bellT<1.3)rd.bellT+=0;
  }else if(ph==='toYard'){fadeT=1;if(T>1.2)beginYard()}
  updateParty(dt,ph!=='gate'&&ph!=='smile');
  // camera
  let cx=ph==='gate'||ph==='smile'?0:p.x-W*0.4;
  if(rd.zoomK&&dl.active)cx=rd.zoomK[0]-W/2;
  camX+=(clamp(cx,0,RX.end+200)-camX)*Math.min(1,3*dt);
  if(rd.zoomK&&dl.active){zoomT=rd.zoomK[1];zf.x=W/2;zf.y=GROUND-100}
  else if(ph!=='smile')zoomT=1;
  barsT=(['gate','smile'].includes(ph)||dl.active)?1:0;
  rd.shake=Math.max(0,(rd.shake||0)-dt);
}
/* ---------- scenery: gate, clues ---------- */
function drawGate(){
  const x=-camX;if(x<-380||x>W)return;ctx.save();ctx.translate(x,0);
  const gx=20,gw=300,top=GROUND-330;
  let g=ctx.createLinearGradient(0,top,0,GROUND);g.addColorStop(0,'#5a4636');g.addColorStop(1,'#33271f');ctx.fillStyle=g;ctx.fillRect(gx,top+60,gw,GROUND-top-60);
  // tower tiers
  for(let i=0;i<4;i++){const w=gw-30-i*46,h=34;ctx.fillStyle=i%2?'#4a3a2e':'#6b5442';ctx.fillRect(gx+(gw-w)/2,top+60-(i+1)*h,w,h-3);ctx.fillStyle='#d4a443';ctx.fillRect(gx+(gw-w)/2,top+60-(i+1)*h,w,3)}
  ctx.fillStyle='#e0b24a';ctx.beginPath();ctx.arc(gx+gw/2,top-82,10,0,7);ctx.fill();
  // doorway
  const dx0=gx+60,dw=180,dh=GROUND-top-130;ctx.fillStyle='#0d0705';ctx.beginPath();ctx.moveTo(dx0,GROUND);ctx.lineTo(dx0,top+160);ctx.quadraticCurveTo(dx0,top+120,dx0+dw/2,top+110);ctx.quadraticCurveTo(dx0+dw,top+120,dx0+dw,top+160);ctx.lineTo(dx0+dw,GROUND);ctx.fill();
  // doors (closing)
  const w=lerp(18,dw/2,ease(rd.close||0));
  for(const side of[-1,1]){const x0=side<0?dx0:dx0+dw-w;const dg=ctx.createLinearGradient(x0,0,x0+w,0);dg.addColorStop(0,'#4c2f1c');dg.addColorStop(1,'#33200f');ctx.fillStyle=dg;ctx.fillRect(x0,top+150,w,GROUND-top-150);
    ctx.fillStyle='#d4a443';for(let r=0;r<8;r++)for(let c=0;c<Math.max(1,Math.floor(w/22));c++)ctx.fillRect(x0+8+c*22,top+170+r*24,5,5)}
  // gold bands + base
  ctx.fillStyle='#d4a443';ctx.fillRect(gx,top+60,gw,6);ctx.fillRect(gx,GROUND-14,gw,6);ctx.fillStyle='#2a1d15';ctx.fillRect(gx-10,GROUND-8,gw+20,8);
  ctx.restore();
}
function drawClues(){
  const sx=(x)=>x-camX;
  // --- clue 1 : abandoned supplies and weapons ---
  let x0=sx(RX.clue1);if(x0>-400&&x0<W+200){
    const dark='#1c120d',wood='#6a4a2c',rim='rgba(255,190,110,.5)';
    ctx.save();ctx.translate(x0,GROUND);
    ctx.fillStyle=dark;ctx.beginPath();ctx.ellipse(120,2,170,10,0,0,7);ctx.fill();
    const crate=(x,w,h,rot)=>{ctx.save();ctx.translate(x,0);ctx.rotate(rot);ctx.fillStyle=wood;ctx.fillRect(0,-h,w,h);ctx.strokeStyle='#2c1c10';ctx.lineWidth=3;ctx.strokeRect(0,-h,w,h);ctx.beginPath();ctx.moveTo(0,-h);ctx.lineTo(w,0);ctx.moveTo(w,-h);ctx.lineTo(0,0);ctx.stroke();ctx.strokeStyle=rim;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(1,-h+1);ctx.lineTo(w-1,-h+1);ctx.stroke();ctx.restore()};
    crate(10,44,38,-0.12);crate(70,38,30,0.35);crate(200,46,40,0.05);
    ctx.fillStyle='#8a7a52';ctx.beginPath();ctx.ellipse(150,-8,22,13,0.2,0,7);ctx.fill();ctx.fillStyle='#3a2a18';ctx.beginPath();ctx.ellipse(150,-8,15,7,0.2,0,7);ctx.fill();   // spilled pot
    ctx.fillStyle='#c9a24a';for(let i=0;i<7;i++){ctx.beginPath();ctx.arc(172+i*9+Math.sin(i)*6,-3+Math.cos(i*2)*3,3,0,7);ctx.fill()}   // grain
    const spear=(x,len,ang)=>{ctx.save();ctx.translate(x,-6);ctx.rotate(ang);ctx.strokeStyle='#4a3220';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(len,0);ctx.stroke();ctx.fillStyle='#b9c2cc';ctx.beginPath();ctx.moveTo(len,0);ctx.lineTo(len-18,-6);ctx.lineTo(len+16,0);ctx.lineTo(len-18,6);ctx.fill();ctx.restore()};
    spear(-30,130,-0.06);spear(120,120,0.1);spear(250,110,-0.18);
    ctx.fillStyle='#9aa4ae';ctx.beginPath();ctx.ellipse(250,-8,28,9,0.1,0,7);ctx.fill();ctx.strokeStyle='#d4a443';ctx.lineWidth=2;ctx.stroke();    // dropped shield
    ctx.fillStyle='#6a1f27';ctx.fillRect(300,-12,70,10);ctx.fillStyle='#8a2a34';ctx.fillRect(300,-12,70,3);   // bedroll
    ctx.restore()}
  // --- clue 2 : the broken watchtower ---
  x0=sx(RX.clue2);if(x0>-400&&x0<W+300){ctx.save();ctx.translate(x0,GROUND);
    ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(110,2,130,10,0,0,7);ctx.fill();
    const lg=ctx.createLinearGradient(0,-330,0,0);lg.addColorStop(0,'#2a1d14');lg.addColorStop(1,'#4a3524');ctx.fillStyle=lg;
    ctx.fillRect(40,-90,150,90);ctx.fillStyle='#5a4636';ctx.fillRect(40,-92,150,6);
    for(const lx of[56,164]){ctx.save();ctx.translate(lx,-90);ctx.fillStyle='#3a2918';ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(9,0);ctx.lineTo(6,-230);ctx.lineTo(-6,-230);ctx.fill();ctx.restore()}
    ctx.strokeStyle='#3a2918';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(56,-100);ctx.lineTo(164,-210);ctx.moveTo(164,-100);ctx.lineTo(56,-210);ctx.stroke();
    ctx.fillStyle='#2f2217';ctx.fillRect(34,-326,152,16);ctx.fillRect(40,-312,10,70);ctx.fillRect(170,-312,10,70);
    ctx.fillStyle='#2a1d14';ctx.beginPath();ctx.moveTo(30,-326);ctx.lineTo(70,-372);ctx.lineTo(96,-340);ctx.lineTo(130,-366);ctx.lineTo(160,-334);ctx.lineTo(190,-326);ctx.fill();   // broken roof
    ctx.strokeStyle='#8a7a62';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(110,-310);ctx.lineTo(110,-290);ctx.stroke();ctx.beginPath();ctx.arc(110,-286,4,0,7);ctx.stroke();   // empty bell hook
    ctx.save();ctx.translate(210,-6);ctx.rotate(0.06);ctx.strokeStyle='#5a3d22';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(120,-4);ctx.moveTo(0,-20);ctx.lineTo(120,-24);ctx.stroke();for(let i=0;i<7;i++){ctx.beginPath();ctx.moveTo(i*18,0);ctx.lineTo(i*18,-20);ctx.stroke()}ctx.restore();   // ladder on the ground
    ctx.restore()}
  // --- clue 3 : the dead messenger horse ---
  x0=sx(RX.clue3);if(x0>-500&&x0<W+300){ctx.save();ctx.translate(x0,GROUND);
    ctx.strokeStyle='rgba(30,16,10,.55)';ctx.lineWidth=0;ctx.fillStyle='rgba(28,16,10,.5)';
    for(let r=0;r<2;r++)for(let i=0;i<24;i++){const fx_=-260+i*17+(r?8:0);ctx.beginPath();ctx.ellipse(fx_,10+r*12,5,2.5,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(fx_-6,10+r*12,2.5,2,0,0,7);ctx.fill()}   // tracks heading left
    ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(170,3,110,9,0,0,7);ctx.fill();
    const hg=ctx.createLinearGradient(0,-60,0,0);hg.addColorStop(0,'#4a3322');hg.addColorStop(1,'#2a1c12');ctx.fillStyle=hg;
    ctx.beginPath();ctx.ellipse(170,-26,86,30,0,0,7);ctx.fill();                               // body
    ctx.beginPath();ctx.moveTo(240,-40);ctx.quadraticCurveTo(290,-52,318,-30);ctx.lineTo(312,-14);ctx.quadraticCurveTo(284,-30,236,-18);ctx.fill();   // neck + head
    ctx.beginPath();ctx.ellipse(318,-24,16,9,-0.2,0,7);ctx.fill();
    ctx.strokeStyle='#2a1c12';ctx.lineWidth=7;ctx.lineCap='round';for(const l of[[110,-8,70,6],[134,-6,96,10],[220,-8,262,4],[244,-6,288,12]]){ctx.beginPath();ctx.moveTo(l[0],l[1]);ctx.lineTo(l[2],l[3]);ctx.stroke()}
    ctx.fillStyle='#6a1f27';ctx.fillRect(140,-58,56,14);ctx.fillStyle='#d4a443';ctx.fillRect(140,-58,56,3);   // saddle cloth
    ctx.fillStyle='#caa862';ctx.save();ctx.translate(186,-44);ctx.rotate(-0.5);ctx.fillRect(-4,-30,8,30);ctx.restore();     // empty message tube
    ctx.fillStyle='rgba(255,190,110,.35)';ctx.beginPath();ctx.ellipse(160,-52,60,5,0,0,7);ctx.fill();
    ctx.restore()}
}
function forestOverlay(){
  const m=rd.mood||0;ctx.fillStyle='rgba(14,32,24,'+(0.16+0.3*m)+')';ctx.fillRect(0,0,W,H+200);
  for(let i=0;i<3;i++){const y=GROUND-100-i*46,off=(T*(10+i*6)+camX*(.2+i*.1))%W;const g=ctx.createLinearGradient(0,y-40,0,y+40);g.addColorStop(0,'rgba(170,200,190,0)');g.addColorStop(.5,'rgba(170,200,190,'+(0.05+m*0.1)+')');g.addColorStop(1,'rgba(170,200,190,0)');ctx.fillStyle=g;
    ctx.fillRect(-off,y-40,W,80);ctx.fillRect(W-off,y-40,W,80)}
}
/* =====================================================================================
   PART 5 — THE GATEKEEPER : garrison courtyard + combat tutorial (attack · dodge · block/parry · counter)
   ===================================================================================== */
const OUTRO=[
 {who:'Commander',text:'This man belonged to the missing garrison.'},
 {who:'Young Soldier',text:'Then who were we fighting?'}
];
const OUTRO2=[
 {who:'Veteran',text:'Commander\u2026 whatever happened here, it has not finished.'},
 {who:'Commander',text:'Secure the courtyard. Nobody enters that temple until I know what lies beneath it.'}
];
const CHAPTER={n:'CHAPTER 1',title:'THE SILENT FRONTIER',sub:'The garrison has fallen. The dead have not stayed dead.'};
const YDOOR={x:808};let cb={},ydg=0;
const TINT={};
function tinted(name){if(TINT[name])return TINT[name];const im=IMG[name],c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');
  x.drawImage(im,0,0);x.globalCompositeOperation='source-atop';x.fillStyle='rgba(42,58,92,0.55)';x.fillRect(0,0,c.width,c.height);x.fillStyle='rgba(20,10,10,0.18)';x.fillRect(0,0,c.width,c.height);TINT[name]=c;return c}
function eBlit(name,f,x,y,face,scale,alpha){
  const a=ANIMS[name],m=M[a.sheet];f=clamp(f|0,0,m.n-1);
  ctx.save();ctx.globalAlpha=alpha==null?1:alpha;ctx.translate(x,y);ctx.scale(face*scale,scale);
  ctx.drawImage(tinted(a.sheet),(f%m.cols)*m.CW,Math.floor(f/m.cols)*m.CH,m.CW,m.CH,-m.AX,-m.AY,m.CW,m.CH);ctx.restore();
}
function beginYard(){
  scn='yard';ph='fight';T=0;mode='scene';p.x=400;p.y=GROUND;p.vy=0;p.face=1;p.lock=false;p.weary=false;p.talk=false;p.hurt=-1;p.dead=-1;p.atk=false;p.jp=null;set('idle');
  camX=0;zoom=zoomT=1;zf={x:W/2,y:GROUND-110};fade=1;fadeT=0;barsT=0;bars=0;fx=[];dl.active=false;ydg=0.18;seed=21;
  party=makeParty();[95,150,205,255,305].forEach((x,i)=>{party[i].x=x-30;party[i].mv=false;party[i].face=1;party[i].ph=[.2,.5,.8,.35,.1][i]});
  party[0].x=40;party[1].x=88;party[2].x=136;party[3].x=184;party[4].x=232;
  cb={hp:5,max:5,ps:'free',pt:0,guard:false,gt:0,cd:0,hitDone:false,vx:0,hs:0,slow:0,shake:0,
    e:{x:640,hp:12,max:12,st:'enter',t:0,kind:null,qi:0,vuln:0,face:-1,ph:0,flash:0,dead:false,fallT:0,did:false,twitch:0,
       queue:['light','light','heavy','light','heavy','light','light','heavy','light','heavy'],behind:true},
    hint:{text:'',t:0},seen:{atk:false,light:false,heavy:false,counter:false,dodged:false,parried:false},floats:[],out:null,hits:0};
  setHint('ATTACK  \u2014  tap  J  /  \u2694',99);sync();
}
function setHint(t,d){cb.hint.text=t;cb.hint.t=d||4}
function float(x,y,t,c){cb.floats.push({x,y,t,c:c||'#ffe2a0',life:0})}
function enemyDamage(n,counter){const e=cb.e;if(e.dead)return;e.hp-=n;e.flash=.18;e.x+=-e.face*5;cb.hits++;sfx.hit();
  float(e.x,GROUND-190,counter?'COUNTER!':'-'+n,counter?'#ff9a4a':'#ffe2a0');
  if(counter&&!cb.seen.counter){cb.seen.counter=true}
  if(!cb.seen.atk){cb.seen.atk=true}
  if(e.hp<=0){e.hp=0;e.dead=true;e.st='dead';e.fallT=0;cb.out={ph:'fall',t:0};p.lock=true;cb.guard=false;cb.ps='free';p.moving=false;sfx.thud();cb.slow=.6}}
function playerHurt(n,knock){if(cb.ps==='dodge')return;cb.hp=Math.max(1,cb.hp-n);cb.ps='hurt';cb.pt=0;cb.vx=knock;cb.shake=.25;sfx.hit();float(p.x,GROUND-170,'-'+n,'#ff6a5a')}
const ESPEC={light:{rate:44,sf:9,reach:150,lunge:70,wind:6,vuln:0.95},heavy:{rate:22,sf:11,reach:205,lunge:130,wind:9,vuln:1.35}};
function yardInput(){const k=keys;return{l:k.KeyA||k.ArrowLeft,r:k.KeyD||k.ArrowRight,atk:k.KeyJ||k.KeyX,blk:k.KeyK,dge:k.KeyL||k.ShiftLeft}}
let prevIn={atk:false,dge:false};
function updateYard(dt){
  const real=dt;if(cb.hs>0){cb.hs-=real;T+=0;return}
  if(cb.slow>0){cb.slow-=real;dt*=0.3}
  const e=cb.e,I=yardInput();ydg=Math.min(1,ydg);
  cb.shake=Math.max(0,cb.shake-real);cb.cd=Math.max(0,cb.cd-dt);
  cb.floats.forEach(f=>f.life+=real);cb.floats=cb.floats.filter(f=>f.life<1.1);
  if(cb.hint.t>0)cb.hint.t-=real;e.flash=Math.max(0,e.flash-dt);
  // ------------- player -------------
  if(!p.lock&&!e.dead){
    const dir=(I.r?1:0)-(I.l?1:0);
    if(cb.ps==='free'){
      cb.guard=!!I.blk;cb.gt=cb.guard?cb.gt+dt:0;
      if(I.atk&&!prevIn.atk&&!cb.guard){cb.ps='atk';cb.pt=0;cb.hitDone=false;sfx.swing(false);if(cb.seen.atk&&cb.hint.t>90)setHint('',0)}
      else if(I.dge&&!prevIn.dge&&cb.cd<=0){cb.ps='dodge';cb.pt=0;cb.vx=(p.x<e.x?-1:1)*560;cb.cd=.7;cb.guard=false;sfx.dodge()}
      else{const sp=cb.guard?55:150;p.x+=dir*sp*dt;p.moving=!!dir;if(dir&&!cb.guard)p.ph+=Math.abs(dir)*sp*dt/ANIMS.walk.stride;
        if(p.moving&&Math.floor(p.ph*2)!==p._pf&&!cb.guard){p._pf=Math.floor(p.ph*2);puff(p.x-p.face*14,GROUND,p.face)}}
    }else if(cb.ps==='atk'){cb.pt+=dt;const f=Math.floor(cb.pt*46);
      if(f>=3&&f<10)p.x+=p.face*55*dt;
      if(!cb.hitDone&&f>=8){cb.hitDone=true;const d=Math.abs(e.x-p.x);
        if(d<205&&((e.x-p.x)*p.face>0)){const ctr=e.vuln>0;enemyDamage(ctr?3:1,ctr);if(ctr){cb.hs=.07}}}
      if(cb.pt>=M.attack.n/46)cb.ps='free'}
    else if(cb.ps==='dodge'){cb.pt+=dt;p.x+=cb.vx*dt;cb.vx*=Math.pow(.02,dt*2.6);if(cb.pt>=.42)cb.ps='free'}
    else if(cb.ps==='hurt'){cb.pt+=dt;p.x+=cb.vx*dt;cb.vx*=Math.pow(.01,dt*2);if(cb.pt>=.42)cb.ps='free'}
  }
  prevIn={atk:!!I.atk,dge:!!I.dge};
  p.x=clamp(p.x,70,800);p.t+=dt;
  if(cb.ps!=='dodge'&&!p.lock)p.face=e.x>p.x?1:-1;
  // ------------- enemy -------------
  e.t+=dt;const dist=Math.abs(e.x-p.x);if(!e.dead&&e.st!=='stun'&&e.st!=='swing')e.face=p.x<e.x?-1:1;
  if(e.vuln>0)e.vuln-=dt;
  if(e.st==='enter'){e.x-=62*dt;e.ph+=62*dt/ANIMS.walk.stride;if(e.x<560){e.behind=false}if(e.t>1.6){e.st='walk';e.t=0}}
  else if(e.st==='walk'){const d=Math.sign(p.x-e.x);e.x+=d*72*dt;e.ph+=72*dt/ANIMS.walk.stride;if(dist<175){e.st='idle';e.t=0}}
  else if(e.st==='idle'){if(dist>230){e.st='walk';e.t=0}else if(e.t>(e.qi===0?0.9:0.55)){e.kind=e.queue[e.qi%e.queue.length];e.qi++;e.st='swing';e.t=0;e.did=false;e.hit=false}}
  else if(e.st==='swing'){const sp=ESPEC[e.kind],f=e.t*sp.rate;
    if(f<sp.wind&&e.t<0.02){if(e.kind==='heavy'){if(!cb.seen.heavy){cb.seen.heavy=true;setHint('HEAVY SWING!  DODGE  \u2014  L  /  \u00BB',3.2)}}else if(!cb.seen.light){cb.seen.light=true;setHint('HE SWINGS!  BLOCK  \u2014  hold  K  (tap it just before the hit to PARRY)',3.8)}
      if(e.kind==='heavy')sfx.swing(true)}
    if(f>3&&f<sp.sf)e.x+=e.face*sp.lunge*dt*(sp.rate/32);
    if(!e.did&&f>=sp.sf){e.did=true;sfx.swing(e.kind==='heavy');
      const d=Math.abs(e.x-p.x),front=((p.x-e.x)*e.face>0);
      if(d<sp.reach&&front){
        if(cb.ps==='dodge'){cb.seen.dodged=true;e.vuln=sp.vuln;if(e.kind==='heavy'||true){setHint('PERFECT!  COUNTERATTACK  \u2014  J',2.6)}float(p.x,GROUND-200,'DODGE','#9fe0ff')}
        else if(cb.guard&&e.kind==='light'){
          if(cb.gt<=0.24){sfx.parry();e.st='stun';e.t=0;e.vuln=1.7;cb.hs=.09;cb.slow=.35;cb.seen.parried=true;float(p.x+p.face*40,GROUND-190,'PARRY!','#fff3b0');setHint('PARRIED!  He is open  \u2014  COUNTERATTACK  J',2.8);sparks(p.x+p.face*60,GROUND-110)}
          else{sfx.clash();p.x-=p.face*38;e.vuln=.45;sparks(p.x+p.face*60,GROUND-110);float(p.x,GROUND-190,'BLOCK','#cfe6ff')}}
        else{const heavy=e.kind==='heavy';playerHurt(heavy?2:1,-p.face*(heavy?380:240));e.hit=true;e.vuln=.3}
      }else{e.vuln=sp.vuln}}
    if(f>=M.attack.n-1&&e.st==='swing'){e.st='recover';e.t=0}}
  else if(e.st==='recover'){if(e.t>0.5){e.st='idle';e.t=0}}
  else if(e.st==='stun'){e.vuln=Math.max(e.vuln,.2);if(e.t>1.6){e.st='idle';e.t=0}}
  else if(e.st==='dead'){e.fallT+=real}
  e.x=clamp(e.x,90,860);
  // companions idle, the temple door breathes
  party.forEach(s=>{s.mv=false});
  if(e.dead)updateOutro(real);
  if(!e.dead&&e.st==='idle'&&e.qi===0&&e.t>0.3&&!cb.seen.atk&&cb.hint.t<=0)setHint('ATTACK  \u2014  tap  J  /  \u2694',99);
  zoomT=1;
}
function sparks(x,y){for(let i=0;i<14;i++)fx.push({k:'spark',x:x+camX,y,vx:(rnd()-.5)*320,vy:-120-rnd()*220,r:1.6+rnd()*1.6,life:0,max:.35+rnd()*.25})}
function updateOutro(dt){
  const o=cb.out,e=cb.e;if(!o)return;o.t+=dt;ydg=Math.min(1,ydg);
  if(o.ph==='fall'){if(o.t>2.4){o.ph='approach';o.t=0;p.lock=true}}
  else if(o.ph==='approach'){const tx=e.x-135;p.face=1;if(p.x<tx-4){p.x+=105*dt;set('walk');p.ph+=105*dt/ANIMS.walk.stride;p.moving=true;if(Math.floor(p.ph*2)!==p._pf){p._pf=Math.floor(p.ph*2);puff(p.x-14,GROUND,1)}}
    else{p.moving=false;set('idle');o.ph='say1';o.t=0;barsT=1;say(OUTRO,()=>{o.ph='twitch';o.t=0;sfx.thud()})}}
  else if(o.ph==='say1'){zoomT=1.45;zf.x+=((e.x-camX)-zf.x)*Math.min(1,3*dt);zf.y+=((GROUND-60)-zf.y)*Math.min(1,3*dt)}
  else if(o.ph==='twitch'){zoomT=1.45;e.twitch=1;if(o.t>1.3){o.ph='still';o.t=0;e.twitch=0}
    if(o.t>0.5)p.x=Math.max(p.x-70*dt,e.x-210)}
  else if(o.ph==='still'){zoomT=1.3;if(o.t>1.4){o.ph='breath';o.t=0;sfx.rumble(true,.4);cb.shake=.5}}
  else if(o.ph==='breath'){zoomT=1.1;ydg=Math.min(1,.2+o.t*.26);cb.shake=Math.max(cb.shake,.12);sfx.rumble(true,.4+ydg*.6);
    if(o.t>3.2&&!o.said){o.said=true;say(OUTRO2,()=>{o.ph='fade';o.t=0})}}
  else if(o.ph==='fade'){fadeT=1;if(o.t>2.2){sfx.rumble(false);go('chap','card');fade=1;fadeT=1;barsT=0;dl.active=false;sync()}}
  if(['say1','twitch','still','breath'].includes(o.ph)&&o.ph!=='say1'){zf.x+=((e.x-camX-30)-zf.x)*Math.min(1,3*dt);zf.y+=((GROUND-100)-zf.y)*Math.min(1,3*dt)}
}
/* ---------------- drawing the courtyard ---------------- */
function drawPillarAt(x,w,top){const g=ctx.createLinearGradient(x-w/2,0,x+w/2,0);g.addColorStop(0,'#2b2018');g.addColorStop(.4,'#6b5442');g.addColorStop(1,'#241812');ctx.fillStyle=g;ctx.fillRect(x-w/2,top,w,GROUND-top);
  ctx.fillStyle='#d4a443';ctx.fillRect(x-w/2-3,top+40,w+6,6);ctx.fillRect(x-w/2-3,GROUND-60,w+6,6);ctx.fillStyle='#3a2a20';ctx.fillRect(x-w/2-8,GROUND-22,w+16,22);ctx.fillRect(x-w/2-6,top,w+12,16)}
function drawYardBG(){
  const Tm=BGI.temple,tw=Tm.width,th=Tm.height;ctx.fillStyle='#4a2430';ctx.fillRect(0,0,W,H);ctx.drawImage(Tm,0,GROUND+8-th,tw,th);ctx.drawImage(Tm,tw-1,GROUND+8-th,tw,th);
  ctx.fillStyle='rgba(30,12,8,.5)';ctx.fillRect(0,0,W,GROUND);
  // courtyard wall + pillars
  const wg=ctx.createLinearGradient(0,GROUND-250,0,GROUND);wg.addColorStop(0,'#2c211b');wg.addColorStop(1,'#42342a');ctx.fillStyle=wg;ctx.fillRect(0,GROUND-250,W,250);
  ctx.fillStyle='#241a14';for(let i=0;i<W;i+=48)ctx.fillRect(i,GROUND-266,30,18);
  ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=2;for(let r=0;r<5;r++){ctx.beginPath();ctx.moveTo(0,GROUND-240+r*48);ctx.lineTo(W,GROUND-240+r*48);ctx.stroke()}
  for(const px of[40,330,600])drawPillarAt(px,60,GROUND-250);
  // torn Chola banners
  for(const bx of[190,465]){const sw=Math.sin(T*1.3+bx)*5;ctx.fillStyle='#6a1520';ctx.beginPath();ctx.moveTo(bx-30,GROUND-244);ctx.lineTo(bx+30,GROUND-244);ctx.lineTo(bx+34+sw,GROUND-110);ctx.lineTo(bx+16+sw,GROUND-132);ctx.lineTo(bx+4+sw,GROUND-96);ctx.lineTo(bx-14+sw,GROUND-126);ctx.lineTo(bx-32+sw,GROUND-84);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#d4a443';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#d4a443';ctx.beginPath();ctx.arc(bx,GROUND-196,12,0,7);ctx.fill()}
  // sealed temple door with glowing cracks
  const dx=YDOOR.x,dw=210,dh=260,top=GROUND-dh;
  const st=ctx.createLinearGradient(0,top-30,0,GROUND);st.addColorStop(0,'#3a2c24');st.addColorStop(1,'#241a14');ctx.fillStyle=st;ctx.fillRect(dx-dw/2-34,top-34,dw+68,dh+34);
  ctx.fillStyle='#d4a443';ctx.fillRect(dx-dw/2-34,top-34,dw+68,6);
  ctx.fillStyle='#0b0605';ctx.beginPath();ctx.moveTo(dx-dw/2,GROUND);ctx.lineTo(dx-dw/2,top+60);ctx.quadraticCurveTo(dx-dw/2,top,dx,top-4);ctx.quadraticCurveTo(dx+dw/2,top,dx+dw/2,top+60);ctx.lineTo(dx+dw/2,GROUND);ctx.fill();
  const shake=(scn==='yard'&&cb.out&&cb.out.ph==='breath')?Math.sin(T*55)*1.6*ydg:0;
  for(const side of[-1,1]){const x0=side<0?dx-dw/2+shake:dx+shake;const dg=ctx.createLinearGradient(x0,0,x0+dw/2,0);dg.addColorStop(0,'#3a2414');dg.addColorStop(1,'#26170c');ctx.fillStyle=dg;ctx.fillRect(x0,top+16,dw/2-2,dh-16);
    ctx.fillStyle='#1a1410';for(let r=0;r<4;r++)ctx.fillRect(x0,top+54+r*52,dw/2-2,9)}
  ctx.fillStyle='#2a2018';ctx.fillRect(dx-dw/2-6,top+110,dw+12,16);ctx.fillStyle='#d4a443';ctx.fillRect(dx-dw/2-6,top+110,dw+12,3);          // the great bar
  const pulse=.75+.25*Math.sin(T*2.2);ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(255,100,26,'+(.5+.3*ydg)*pulse+')';ctx.lineWidth=2+2*ydg;ctx.lineCap='round';
  const cracks=[[[dx,top+20],[dx-4,top+70],[dx+6,top+120],[dx-3,top+170],[dx,GROUND-6]],[[dx-40,top+60],[dx-52,top+110],[dx-44,top+150]],[[dx+30,top+90],[dx+46,top+140],[dx+38,top+190]],[[dx-80,top+130],[dx-60,top+176]],[[dx+70,top+40],[dx+82,top+84]]];
  for(const c of cracks){ctx.beginPath();c.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke()}
  const gl=ctx.createRadialGradient(dx,GROUND-120,10,dx,GROUND-120,330+120*ydg);gl.addColorStop(0,'rgba(255,120,40,'+(.26+.5*ydg)+')');gl.addColorStop(1,'rgba(255,90,20,0)');ctx.fillStyle=gl;ctx.fillRect(dx-460,GROUND-460,920,520);ctx.restore();
  // paved ground
  const fg=ctx.createLinearGradient(0,GROUND-8,0,H+120);fg.addColorStop(0,'#4a3c32');fg.addColorStop(1,'#1c1512');ctx.fillStyle=fg;ctx.fillRect(0,GROUND-8,W,H+140);
  ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=2;for(let r=0;r<7;r++){const yy=GROUND+6+r*r*3.4;ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(W,yy);ctx.stroke()}
  for(let i=-6;i<26;i++){ctx.beginPath();ctx.moveTo(480+(i*58-480)*.55,GROUND);ctx.lineTo(480+(i*58-480)*1.6,H+120);ctx.stroke()}
  // door light spilling over the stones
  ctx.save();ctx.globalCompositeOperation='lighter';const sp=ctx.createRadialGradient(dx-40,GROUND+14,10,dx-40,GROUND+14,380);sp.addColorStop(0,'rgba(255,110,40,'+(.24+.4*ydg)+')');sp.addColorStop(1,'rgba(255,90,20,0)');ctx.save();ctx.translate(0,GROUND+14);ctx.scale(1,.28);ctx.translate(0,-(GROUND+14));ctx.fillStyle=sp;ctx.fillRect(dx-420,GROUND-300,840,700);ctx.restore();ctx.restore();
  // scattered weapons
  const sp2=(x,y,len,a)=>{ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.strokeStyle='#4a3220';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(len,0);ctx.stroke();ctx.fillStyle='#aab4be';ctx.beginPath();ctx.moveTo(len,0);ctx.lineTo(len-16,-5);ctx.lineTo(len+14,0);ctx.lineTo(len-16,5);ctx.fill();ctx.restore()};
  sp2(150,GROUND+26,110,.08);sp2(420,GROUND+40,100,-.2);sp2(520,GROUND+20,90,.3);sp2(700,GROUND+44,110,-.05);
  ctx.fillStyle='#8f9aa5';for(const s of[[330,GROUND+34],[610,GROUND+52],[110,GROUND+50]]){ctx.beginPath();ctx.ellipse(s[0],s[1],26,8,.1,0,7);ctx.fill();ctx.strokeStyle='#d4a443';ctx.lineWidth=2;ctx.stroke()}
  ctx.strokeStyle='#b9c2cc';ctx.lineWidth=3;for(const s of[[250,GROUND+58,40],[560,GROUND+62,46],[760,GROUND+36,38]]){ctx.beginPath();ctx.moveTo(s[0],s[1]);ctx.lineTo(s[0]+s[2],s[1]-6);ctx.stroke()}
}
function drawEnemy(){
  const e=cb.e,dx=e.x,y=GROUND;let name='walk',f=0;const sc=0.72;
  if(e.st==='enter'||e.st==='walk'){name='walk';f=Math.floor((e.ph%1)*M.walk.n)%M.walk.n}
  else if(e.st==='idle'||e.st==='recover'||e.st==='stun'){name='idle';f=pingpong(Math.floor(T*10),M.idle.n)}
  else if(e.st==='swing'){name='attack';f=Math.min(M.attack.n-1,Math.floor(e.t*ESPEC[e.kind].rate))}
  else if(e.st==='dead'){name='fall';f=Math.min(M.fall.n-1,Math.floor(e.fallT*24))}
  const jit=e.twitch?(Math.sin(T*70)*1.6):0;
  shadow(dx,y,52);
  eBlit(name,f,dx+jit,y+(e.twitch?Math.sin(T*50)*1.2:0),e.face*(name==='fall'?-1:1)*(name==='fall'?1:1),sc,1);
  if(e.flash>0){ctx.save();ctx.globalAlpha=e.flash*3.2;ctx.globalCompositeOperation='lighter';ctx.fillStyle='#ffd6a0';ctx.beginPath();ctx.ellipse(dx,y-100,38,90,0,0,7);ctx.fill();ctx.restore()}
  if(!e.dead){const tele=e.st==='swing'&&e.t*ESPEC[e.kind].rate<ESPEC[e.kind].wind;
    ctx.save();ctx.globalCompositeOperation='lighter';const gx=dx+e.face*12,gy=y-124;const r=tele?(e.kind==='heavy'?34:20):10;
    const g=ctx.createRadialGradient(gx,gy,1,gx,gy,r);g.addColorStop(0,tele&&e.kind==='heavy'?'rgba(255,70,40,.95)':'rgba(255,150,40,.9)');g.addColorStop(1,'rgba(255,100,20,0)');ctx.fillStyle=g;ctx.fillRect(gx-r,gy-r,2*r,2*r);ctx.restore();
    if(tele&&e.kind==='heavy'){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(255,70,40,.6)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(dx,y-100,80+Math.sin(T*40)*4,0,7);ctx.stroke();ctx.restore()}}
}
function drawYardPlayer(){
  const dx=p.x-camX;let name='idle',f=0,alpha=1;
  const m=cb;
  if(m.ps==='atk'){name='attack';f=Math.min(M.attack.n-1,Math.floor(m.pt*46))}
  else if(m.ps==='dodge'){name='jump';f=6+Math.min(12,Math.floor(m.pt/0.42*13));alpha=.92;
    for(let i=1;i<=3;i++){ctx.save();ctx.globalAlpha=.16/i;blit('jump',f,dx-(cb.vx>0?1:-1)*i*26*-1,p.y,p.face,ANIMS.jump.scale);ctx.restore()}}
  else if(m.ps==='hurt'){name='hurt';f=Math.min(M.hurt.n-1,Math.floor(m.pt*24))}
  else if(m.guard){name='idle';f=2}
  else if(p.moving){name='walk';f=Math.floor((p.ph%1)*M.walk.n)%M.walk.n}
  else{name='idle';f=pingpong(Math.floor(T*10),M.idle.n)}
  shadow(dx,GROUND,50);blit(name,f,dx,p.y,p.face,ANIMS[name].scale,alpha);
  if(m.guard){ctx.save();ctx.globalCompositeOperation='lighter';const a=m.gt<=.24?.8:.3;ctx.strokeStyle='rgba(255,230,160,'+a+')';ctx.lineWidth=m.gt<=.24?5:2.5;ctx.beginPath();ctx.arc(dx+p.face*34,GROUND-100,58,-1.1,1.1);ctx.stroke();ctx.restore()}
}
function drawYardScene(){
  drawYardBG();
  const e=cb.e;
  drawParty();                            // companions wait at the gate of the courtyard
  if(e.behind){drawEnemy();drawPillarAt(600,60,GROUND-250)}else{drawEnemy()}
  drawYardPlayer();
  // sparks
  fxDraw();
  // companion reaction marks
}
/* ---------------- HUD + chapter card ---------------- */
function yardHUD(){
  if(scn!=='yard'||!cb.e)return;const e=cb.e;
  // player health pips
  for(let i=0;i<cb.max;i++){ctx.fillStyle=i<cb.hp?'#e8c27a':'rgba(232,194,122,.22)';ctx.beginPath();ctx.moveTo(28+i*26,H-70);ctx.lineTo(40+i*26,H-84);ctx.lineTo(52+i*26,H-70);ctx.lineTo(40+i*26,H-56);ctx.closePath();ctx.fill();ctx.strokeStyle='#2a1508';ctx.lineWidth=2;ctx.stroke()}
  // enemy bar
  if(!e.dead||cb.out&&cb.out.t<2){ctx.fillStyle='rgba(12,6,6,.7)';ctx.fillRect(W/2-170,22,340,16);ctx.fillStyle='#8a2a24';ctx.fillRect(W/2-168,24,336*Math.max(0,e.hp/e.max),12);ctx.strokeStyle='#c8963c';ctx.lineWidth=2;ctx.strokeRect(W/2-170,22,340,16);
    ctx.fillStyle='#e8d6b4';ctx.font='15px Georgia,serif';ctx.textAlign='center';ctx.fillText('THE GATEKEEPER',W/2,18);ctx.textAlign='left'}
  if(cb.hint.t>0&&cb.hint.text){const a=Math.min(1,cb.hint.t/.4);ctx.save();ctx.globalAlpha=a;ctx.font='bold 21px Georgia,serif';const w=ctx.measureText(cb.hint.text).width+44;
    ctx.fillStyle='rgba(14,7,6,.82)';ctx.strokeStyle='#c8963c';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(W/2-w/2,64,w,42,10);ctx.fill();ctx.stroke();ctx.fillStyle='#ffe9b8';ctx.textAlign='center';ctx.fillText(cb.hint.text,W/2,92);ctx.textAlign='left';ctx.restore()}
  for(const f of cb.floats){const a=1-f.life/1.1;ctx.save();ctx.globalAlpha=a;ctx.fillStyle=f.c;ctx.font='bold 26px Georgia,serif';ctx.textAlign='center';ctx.shadowColor='#000';ctx.shadowBlur=6;ctx.fillText(f.t,f.x-camX,f.y-f.life*40);ctx.restore()}
}
function updateChapter(dt){fadeT=1;fade=1;if(ph==='card'&&T>9)go('chap','end')}
function drawChapter(){
  ctx.fillStyle='#060202';ctx.fillRect(0,0,W,H);
  const g=ctx.createRadialGradient(W/2,H*0.62,10,W/2,H*0.62,380);g.addColorStop(0,'rgba(255,100,30,'+(.16+.05*Math.sin(T*2))+')');g.addColorStop(1,'rgba(255,100,30,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  motesDraw('rgba(255,140,70,A)');const tt=ph==='end'?T+9:T;ctx.save();ctx.textAlign='center';
  ctx.globalAlpha=Math.min(1,Math.max(0,(tt-0.5)/1));ctx.fillStyle='#d8c19a';ctx.font='20px Georgia,serif';spaced(CHAPTER.n,W/2,H/2-64,12);ctx.textAlign='center';
  ctx.globalAlpha=Math.min(1,Math.max(0,(tt-1.4)/1.2));ctx.shadowColor='rgba(255,130,50,.6)';ctx.shadowBlur=30;ctx.fillStyle='#e8c27a';ctx.font='bold 54px Georgia,serif';spaced(CHAPTER.title,W/2,H/2,7);ctx.shadowBlur=0;ctx.textAlign='center';
  ctx.globalAlpha=Math.min(1,Math.max(0,(tt-3)/1.2));ctx.fillStyle='rgba(232,194,122,.9)';ctx.fillRect(W/2-170,H/2+22,340,2);
  ctx.globalAlpha=Math.min(1,Math.max(0,(tt-4)/1.4));ctx.fillStyle='#e8d6b4';ctx.font='italic 26px Georgia,serif';ctx.fillText(CHAPTER.sub,W/2,H/2+66);
  if(tt>7.5){ctx.globalAlpha=.55+.35*Math.sin(tt*3);ctx.fillStyle='#d8c19a';ctx.font='17px Georgia,serif';ctx.fillText('To be continued\u2026   \u00B7   tap or press R to replay',W/2,H-46)}
  ctx.restore();ctx.textAlign='left';
}
/* =====================  INTRO CARDS / TITLE / UI  ===================== */
function spaced(text,cx,y,sp){let w=0;for(const ch of text)w+=ctx.measureText(ch).width+sp;w-=sp;let x=cx-w/2;ctx.textAlign='left';
  for(const ch of text){ctx.fillText(ch,x,y);x+=ctx.measureText(ch).width+sp}ctx.textAlign='left'}
function wrap(text,maxw){const words=text.split(' ');const lines=[];let cur='';for(const w of words){const t=cur?cur+' '+w:w;if(ctx.measureText(t).width>maxw){lines.push(cur);cur=w}else cur=t}if(cur)lines.push(cur);return lines}
function cardDur(i){const c=STORY[i];return i===0?4.4:3.0+(c.t.length/34)}
function updateIntro(dt){fadeT=0;if(T>=cardDur(ci)){ci++;T=0;if(ci>=STORY.length){go('s1','walk');fade=1;fadeT=0;sync()}}}
function nextCard(){if(scn==='intro'){ci++;T=0;if(ci>=STORY.length){go('s1','walk');fade=1;fadeT=0;sync()}}}
function drawIntro(){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0c0508');g.addColorStop(1,'#1d0d12');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  motesDraw('rgba(255,190,110,A)');
  if(ci>=STORY.length)return;const c=STORY[ci],d=cardDur(ci),a=Math.min(1,T/0.9)*Math.min(1,Math.max(0,(d-T)/0.7));
  ctx.save();ctx.globalAlpha=a;ctx.textAlign='center';
  if(ci===0){ctx.fillStyle='#e8c27a';ctx.font='bold 60px Georgia,serif';spaced(c.t,W/2,H/2-8,10);
    ctx.fillStyle='rgba(232,194,122,.9)';ctx.fillRect(W/2-120,H/2+10,240,2);ctx.font='italic 24px Georgia,serif';ctx.fillStyle='#d8c19a';ctx.textAlign='center';ctx.fillText(c.s,W/2,H/2+48)}
  else{ctx.font=(ci===STORY.length-1?'italic 40px':'30px')+' Georgia,serif';ctx.fillStyle='#f3e4c2';
    const lines=wrap(c.t,700);const y0=H/2-(lines.length-1)*22;lines.forEach((l,i)=>{ctx.textAlign='center';ctx.fillText(l,W/2,y0+i*46)});
    ctx.fillStyle='rgba(232,194,122,.7)';ctx.fillRect(W/2-40,y0+lines.length*46-6,80,2)}
  ctx.restore();ctx.textAlign='left';
  ctx.fillStyle='rgba(216,193,154,'+(0.35+0.2*Math.sin(T*3))+')';ctx.font='15px Georgia,serif';ctx.textAlign='center';ctx.fillText('tap to continue',W/2,H-30);ctx.textAlign='left';
}
function updateTitle(dt){fadeT=1;fade=1;if(scn==='title'&&T>7.2)beginRoad()}
function drawTitle(){
  const tt=scn==='end'?T+8:T;
  ctx.fillStyle='#050203';ctx.fillRect(0,0,W,H);motesDraw('rgba(255,170,90,A)');
  const a=Math.min(1,Math.max(0,(tt-0.5)/1.2));ctx.save();ctx.textAlign='center';ctx.globalAlpha=a;
  ctx.shadowColor='rgba(240,170,70,.55)';ctx.shadowBlur=30;ctx.fillStyle='#e8c27a';ctx.font='bold 54px Georgia,serif';spaced(MISSION.title,W/2,H/2-6,7);ctx.shadowBlur=0;ctx.textAlign='center';
  ctx.fillStyle='rgba(232,194,122,.9)';ctx.fillRect(W/2-190*a,H/2+14,380*a,2);
  ctx.globalAlpha=Math.min(1,Math.max(0,(tt-1.8)/1.0));ctx.fillStyle='#e8d6b4';ctx.font='italic 25px Georgia,serif';ctx.fillText(MISSION.sub,W/2,H/2+56);
  if(scn==='end'||tt>6){ctx.globalAlpha=0.55+0.35*Math.sin(tt*3);ctx.fillStyle='#d8c19a';ctx.font='17px Georgia,serif';ctx.fillText('Tap or press R to replay   ·   F for free play',W/2,H-50)}
  ctx.restore();ctx.textAlign='left';
}
function portrait(who,cx,cy,r){
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.clip();ctx.fillStyle='#1d100d';ctx.fillRect(cx-r,cy-r,2*r,2*r);
  const gg=ctx.createRadialGradient(cx,cy,4,cx,cy,r);gg.addColorStop(0,'rgba(190,120,60,.35)');gg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gg;ctx.fillRect(cx-r,cy-r,2*r,2*r);
  let img,m,sx,sy,sw;
  if(who==='Vetri'||who==='Commander'){img=IMG.talk;m=M.talk;sx=m.AX-40;sy=2;sw=80}
  else if(who==='Young Soldier'){img=IMG.soldierA;m=M.soldierA;sx=m.AX-38;sy=2;sw=76}
  else if(who==='Veteran'){img=IMG.soldierB;m=M.soldierB;sx=m.AX-34;sy=2;sw=68}
  else if(who==='Scout'){img=IMG.msgAnn;m=M.msgAnn;sx=m.AX-58;sy=4;sw=88}
  else if(who==='Royal Messenger'){img=IMG.msgAnn;m=M.msgAnn;sx=m.AX-58;sy=4;sw=88}
  else{img=IMG.kidle;m=M.kidle;sx=m.AX-46;sy=6;sw=92}
  ctx.drawImage(img,sx,sy,sw,sw,cx-r,cy-r,2*r,2*r);ctx.restore();
  ctx.strokeStyle='#d4a443';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.stroke();
}
function wrapLines(t,maxw){const out=[];t.split('\n').forEach(s=>wrap(s,maxw).forEach(l=>out.push(l)));return out}
function drawDialogue(){
  if(!dl.active)return;const L=dl.q[dl.i],x=40,w=W-80,h=132,y=H-48-h-10;
  ctx.fillStyle='rgba(16,8,8,.88)';ctx.strokeStyle='#c8963c';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x,y,w,h,14);ctx.fill();ctx.stroke();
  const txt=L.text.slice(0,Math.floor(dl.typed));
  if(L.who){portrait(L.who,x+66,y+h/2,46);
    const col=NAMECOL[L.who]||'#e8c27a';ctx.font='bold 18px Georgia,serif';const nw=ctx.measureText(L.who).width+34;
    ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(x+130,y-15,nw,30,9);ctx.fill();ctx.fillStyle='#2a1508';ctx.fillText(L.who,x+147,y+6);
    ctx.fillStyle='#f6e7c4';ctx.font='23px Georgia,serif';wrapLines(txt,w-170).forEach((l,i)=>ctx.fillText(l,x+130,y+52+i*31))}
  else{ctx.fillStyle='#e8d6b4';ctx.font='italic 22px Georgia,serif';const ls=wrapLines(txt,w-80);ls.forEach((l,i)=>ctx.fillText(l,x+40,y+42+i*30))}
  if(dl.typed>=L.text.length){ctx.fillStyle='rgba(232,194,122,'+(0.5+0.5*Math.sin(T*6))+')';ctx.font='20px Georgia,serif';ctx.fillText('\u25BC',x+w-34,y+h-16)}
}
let cy=0,cyT=0;let VIG=null;
function vignette(){if(!VIG){VIG=document.createElement('canvas');VIG.width=W;VIG.height=H;const x=VIG.getContext('2d');
  const g=x.createRadialGradient(W/2,H/2,H*0.35,W/2,H/2,H*0.95);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(10,2,8,.6)');x.fillStyle=g;x.fillRect(0,0,W,H)}ctx.drawImage(VIG,0,0)}
/* =====================  UPDATE / RENDER  ===================== */
function update(dt){
  T+=dt;fxUpdate(dt);dlUpdate(dt);
  if(mode==='scene'){
    if(scn==='intro')updateIntro(dt);else if(scn==='s1'){updatePlayer(dt);updateS1(dt)}
    else if(scn==='s2')updateS2(dt);else if(scn==='title'||scn==='end')updateTitle(dt);
    else if(scn==='road'){updatePlayer(dt);updateRoad(dt)}else if(scn==='yard'){updateYard(dt)}else if(scn==='chap')updateChapter(dt);
  }else{updatePlayer(dt);camX+=((p.x-W/2)-camX)*Math.min(1,6*dt);camX=clamp(camX,0,WORLD-W)}
  bars+=(barsT-bars)*Math.min(1,4*dt);zoom+=(zoomT-zoom)*Math.min(1,2.2*dt);fade+=(fadeT-fade)*Math.min(1,2.6*dt);
  cyT=(dl.active&&(scn==='s1'||scn==='s2'||scn==='road'||scn==='yard'))?-68:0;cy+=(cyT-cy)*Math.min(1,3*dt);
  if(!['s2','road','yard'].includes(scn)){zf.x=W/2;zf.y=GROUND-110}
  update.s=(update.s||0)+dt;if(update.s>0.15){update.s=0;sync()}
}
function render(){
  ctx.clearRect(0,0,W,H);
  if(mode==='scene'&&scn==='intro'){drawIntro();vignette();return}
  if(mode==='scene'&&(scn==='title'||scn==='end')){drawTitle();return}
  if(mode==='scene'&&scn==='chap'){drawChapter();return}
  ctx.save();ctx.translate(0,cy);if(zoom!==1){ctx.translate(zf.x,zf.y);ctx.scale(zoom,zoom);ctx.translate(-zf.x,-zf.y)}
  const shk=Math.max((rd&&rd.shake)||0,(scn==='yard'&&cb&&cb.shake)||0);if(shk>0)ctx.translate((Math.random()-.5)*shk*14,(Math.random()-.5)*shk*10);
  if(scn==='road'){bg();forestOverlay();drawGate();drawClues();drawParty();drawPlayer();fxDraw()}
  else if(scn==='yard')drawYardScene();
  else if(scn==='s2')drawS2();
  else{bg();if(mode==='scene')drawSoldiers();drawPlayer();fxDraw();if(mode==='scene')drawMsg()}
  ctx.restore();
  motesDraw(scn==='s2'?'rgba(255,170,90,A)':scn==='yard'?'rgba(255,140,70,A)':'rgba(255,205,140,A)');
  if(scn!=='s2'&&scn!=='yard'){ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(W*0.88,H*0.3,10,W*0.88,H*0.3,360);g.addColorStop(0,'rgba(255,170,80,.20)');g.addColorStop(1,'rgba(255,120,60,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore()}
  vignette();
  if(bars>0.01){ctx.fillStyle='#000';ctx.fillRect(0,0,W,46*bars);ctx.fillRect(0,H-46*bars,W,46*bars)}
  yardHUD();drawDialogue();
  if(mode==='scene'&&scn==='s1'&&ph==='walk'&&T>1.2&&p.x<650){ctx.fillStyle='rgba(246,231,196,'+(0.55+0.4*Math.sin(T*3))+')';ctx.font='20px Georgia,serif';ctx.textAlign='center';ctx.fillText('Hold  \u25B6  to walk',W/2,64);ctx.textAlign='left'}
  if(mode==='scene'&&scn==='s2'&&ph==='in'&&T>0.9&&T<4.4){const a=Math.min(1,(T-0.9)/0.7)*Math.min(1,(4.4-T)/0.7);ctx.save();ctx.globalAlpha=a;ctx.fillStyle='#f3e4c2';ctx.font='bold 34px Georgia,serif';ctx.shadowColor='#000';ctx.shadowBlur=8;spaced('THE KING\u2019S COURT',230,H-90,6);ctx.font='italic 19px Georgia,serif';ctx.fillStyle='#e8c27a';ctx.textAlign='left';ctx.fillText('Thanjavur \u2014 the Chola capital',80,H-62);ctx.restore()}
  if(fade>0.002){ctx.fillStyle='rgba(0,0,0,'+clamp(fade,0,1)+')';ctx.fillRect(0,0,W,H)}
}
/* ---------------- input ---------------- */
function advance(){
  if(mode!=='scene')return;
  if(dl.active)dlAdvance();else if(scn==='intro')nextCard();else if(scn==='end'||(scn==='chap'&&ph==='end'))startScene();
}
const TOGGLE={KeyT:()=>{if(mode==='free')p.talk=!p.talk},KeyY:()=>{if(mode==='free')p.weary=!p.weary},
  KeyH:()=>{if(mode==='free'&&p.dead<0&&p.hurt<0){p.hurt=0;p.atk=false;p.jp=null}},
  KeyK:()=>{if(mode==='free'&&p.dead<0){p.dead=0;p.atk=false;p.jp=null;p.hurt=-1}},
  KeyF:()=>{mode==='scene'?startFree():startScene()},KeyR:()=>{startScene()},KeyN:()=>skipScene(),
  Space:()=>{if(mode==='scene')advance()},Enter:()=>advance(),KeyE:()=>advance()};
window.press=c=>{if(TOGGLE[c])TOGGLE[c]()};window.skipScene=skipScene;window.advance=advance;
addEventListener('keydown',e=>{if(!keys[e.code]&&TOGGLE[e.code])TOGGLE[e.code]();keys[e.code]=true;if(['Space','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault()});
addEventListener('keyup',e=>keys[e.code]=false);
cv.addEventListener('pointerdown',()=>advance());
let last=performance.now();
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;update(dt);render();requestAnimationFrame(loop)}
window.__keys=keys;window.__cb=()=>cb;window.__kill=()=>enemyDamage(99,false);window.__frame=(dt)=>{update(dt);render()};window.__st=()=>({mode,scn,ph,T,p,dl,c2,fade,bars,ci});
startScene();
