if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect)CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h){this.rect(x,y,w,h)};
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
const W=960,H=540,GROUND=405,WORLD=4300;
const M={"idle": {"CW": 198, "CH": 208, "AX": 119.60000000000001, "AY": 204.8, "cols": 7, "n": 28}, "walk": {"CW": 186, "CH": 254, "AX": 74.8, "AY": 250.4, "cols": 8, "n": 33}, "run": {"CW": 236, "CH": 197, "AX": 127.60000000000001, "AY": 192.4, "cols": 10, "n": 20}, "attack": {"CW": 272, "CH": 197, "AX": 158.4, "AY": 193.20000000000002, "cols": 7, "n": 34}, "weary": {"CW": 130, "CH": 223, "AX": 75.2, "AY": 219.60000000000002, "cols": 8, "n": 37}, "jump": {"CW": 182, "CH": 224, "AX": 90.4, "AY": 219.60000000000002, "cols": 8, "n": 31}, "hurt": {"CW": 261, "CH": 208, "AX": 158.0, "AY": 203.60000000000002, "cols": 8, "n": 24}, "talk": {"CW": 140, "CH": 236, "AX": 66.0, "AY": 231.60000000000002, "cols": 8, "n": 43}, "soldierA": {"CW": 182, "CH": 253, "AX": 94.0, "AY": 248.4, "cols": 8, "n": 30}, "soldierB": {"CW": 134, "CH": 214, "AX": 66.8, "AY": 210.4, "cols": 8, "n": 47}, "archer": {"CW": 177, "CH": 227, "AX": 81.19999999999999, "AY": 219.1, "cols": 8, "n": 32}, "shield": {"CW": 132, "CH": 217, "AX": 60.9, "AY": 210.7, "cols": 8, "n": 33}, "bearer": {"CW": 179, "CH": 252, "AX": 75.6, "AY": 244.29999999999998, "cols": 8, "n": 37}, "msgRun": {"CW": 174, "CH": 223, "AX": 113.2, "AY": 219.60000000000002, "cols": 5, "n": 10}, "msgStop": {"CW": 163, "CH": 238, "AX": 87.2, "AY": 234.0, "cols": 5, "n": 9}, "msgAnn": {"CW": 154, "CH": 248, "AX": 100.0, "AY": 243.60000000000002, "cols": 7, "n": 21}, "fall": {"CW": 327, "CH": 292, "AX": 150.8, "AY": 253.60000000000002, "cols": 9, "n": 45}};
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
  msgRun:{sheet:'msgRun',stride:175,scale:0.6},msgStop:{sheet:'msgStop',fps:12,scale:0.6},msgAnn:{sheet:'msgAnn',fps:8,loop:'pingpong',scale:0.6,native:-1}
};
const SHEETS=Object.keys(M);
const IMG={},BGI={};let loaded=0;const BGN=['temple','banyan','road'];const total=SHEETS.length+BGN.length;
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
  b.dataset.walk=(mode==='free'||(scn==='s1'&&ph==='walk'))?'1':'0';b.dataset.scn=scn}
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
function fxUpdate(dt){for(const f of fx){f.life+=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.r+=dt*10}fx=fx.filter(f=>f.life<f.max);
  for(const m of MOTES){m.x+=m.v*dt*m.s;m.y+=Math.sin(T*.6+m.ph)*8*dt;if(m.x>W+10){m.x=-10;m.y=rnd()*H*0.85}}}
function fxDraw(){
  for(const f of fx){const a=(1-f.life/f.max)*0.32;ctx.fillStyle='rgba(176,138,102,'+a+')';ctx.beginPath();ctx.arc(f.x-camX,f.y,f.r,0,7);ctx.fill()}
}
function motesDraw(col){ctx.save();ctx.globalCompositeOperation='lighter';
  for(const m of MOTES){const a=.14+.12*Math.sin(T*1.3+m.ph);ctx.fillStyle=col.replace('A',a.toFixed(3));ctx.beginPath();ctx.arc(m.x,m.y,m.r,0,7);ctx.fill()}ctx.restore()}
/* ---------------- player ---------------- */
function updatePlayer(dt){
  const left=keys.KeyA||keys.ArrowLeft,right=keys.KeyD||keys.ArrowRight,run=keys.ShiftLeft||keys.ShiftRight;
  let dir=(right?1:0)-(left?1:0);const free=mode==='free',walkOK=free||(scn==='s1'&&ph==='walk');
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
  const wk=p.weary?'weary':'walk',rn=free&&run&&!p.weary;let mv=0;
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
  else if(scn==='title'){go('end','end')}
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
const KING={x:790,y:GROUND-30};const TABLE={x:575,y:GROUND};
let KINGC=null,COURTC=null;
function kingSheet(){if(KINGC)return KINGC;const c=document.createElement('canvas');c.width=IMG.msgAnn.width;c.height=IMG.msgAnn.height;
  const x=c.getContext('2d');x.drawImage(IMG.msgAnn,0,0);x.globalCompositeOperation='source-atop';x.fillStyle='rgba(214,150,44,0.36)';x.fillRect(0,0,c.width,c.height);KINGC=c;return c}
function drawKing(f,x,y,face,sc){
  const m=M.msgAnn,s=sc;ctx.save();ctx.translate(x,y);ctx.scale(face*(-1)*s,s);
  ctx.drawImage(kingSheet(),(f%m.cols)*m.CW,Math.floor(f/m.cols)*m.CH,m.CW,m.CH,-m.AX,-m.AY,m.CW,m.CH);
  // simple crown
  ctx.fillStyle='#e6b445';ctx.strokeStyle='#7a4d10';ctx.lineWidth=2;ctx.beginPath();
  const cx=-6,cy=-232;ctx.moveTo(cx-17,cy+10);ctx.lineTo(cx-17,cy-4);ctx.lineTo(cx-9,cy+3);ctx.lineTo(cx,cy-9);ctx.lineTo(cx+9,cy+3);ctx.lineTo(cx+17,cy-4);ctx.lineTo(cx+17,cy+10);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.restore();
}
function beginCourt(){
  scn='s2';ph='in';T=0;mode='scene';p.lock=true;p.weary=true;camX=0;zoom=zoomT=1;zf={x:W/2,y:GROUND-110};
  c2={vx:-70,vface:1,vph:0,vmode:'walk',kmode:'idle',kt:0,readT:0,reportOn:true,seal:0,title:0};
  ms=null;sol=[];fx=[];dl.active=false;fade=1;fadeT=0;setBars(1);sync();
}
function buildCourt(){
  const c=document.createElement('canvas');c.width=W;c.height=H+100;const x=c.getContext('2d');
  let g=x.createLinearGradient(0,0,0,GROUND);g.addColorStop(0,'#0e060b');g.addColorStop(.55,'#24101a');g.addColorStop(1,'#3a1a1d');x.fillStyle=g;x.fillRect(0,0,W,H+100);
  // tall arched windows with dusk light
  for(const wx of [150,420,690]){const wy=60,ww=76,wh=190;x.fillStyle='#1a0a10';x.beginPath();x.moveTo(wx-ww/2-6,wy+wh);x.lineTo(wx-ww/2-6,wy+ww/2);x.arc(wx,wy+ww/2,ww/2+6,Math.PI,0);x.lineTo(wx+ww/2+6,wy+wh);x.fill();
    const wg=x.createLinearGradient(0,wy,0,wy+wh);wg.addColorStop(0,'#f0a24a');wg.addColorStop(.5,'#c2523a');wg.addColorStop(1,'#6a2a40');x.fillStyle=wg;
    x.beginPath();x.moveTo(wx-ww/2,wy+wh);x.lineTo(wx-ww/2,wy+ww/2);x.arc(wx,wy+ww/2,ww/2,Math.PI,0);x.lineTo(wx+ww/2,wy+wh);x.fill();
    x.strokeStyle='#120508';x.lineWidth=4;x.beginPath();x.moveTo(wx,wy);x.lineTo(wx,wy+wh);x.moveTo(wx-ww/2,wy+wh*0.45);x.lineTo(wx+ww/2,wy+wh*0.45);x.stroke()}
  // wall panels
  x.strokeStyle='rgba(255,200,120,.05)';x.lineWidth=2;for(let i=0;i<W;i+=48){x.beginPath();x.moveTo(i,0);x.lineTo(i,GROUND);x.stroke()}
  // pillars
  for(const px of [40,285,555,925]){const pw=74;let pg=x.createLinearGradient(px-pw/2,0,px+pw/2,0);pg.addColorStop(0,'#2a1812');pg.addColorStop(.35,'#6a4630');pg.addColorStop(.7,'#4a2e20');pg.addColorStop(1,'#1d0f0b');
    x.fillStyle=pg;x.fillRect(px-pw/2,0,pw,GROUND);x.fillStyle='#c8963c';for(const by of [46,92,GROUND-86,GROUND-44]){x.fillRect(px-pw/2-3,by,pw+6,8)}
    x.fillStyle='#2a1710';x.fillRect(px-pw/2-10,GROUND-30,pw+20,30);x.fillRect(px-pw/2-8,0,pw+16,18)
    x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=2;for(let k=-2;k<=2;k++){x.beginPath();x.moveTo(px+k*12,18);x.lineTo(px+k*12,GROUND-30);x.stroke()}}
  // hanging banners with a gold sun/tiger emblem
  for(const bx of [165,420,690]){const bw=64;x.fillStyle='#6e1620';x.beginPath();x.moveTo(bx-bw/2,40);x.lineTo(bx+bw/2,40);x.lineTo(bx+bw/2,250);x.lineTo(bx,232);x.lineTo(bx-bw/2,250);x.closePath();x.fill();
    x.strokeStyle='#d4a443';x.lineWidth=3;x.stroke();x.fillStyle='#d4a443';x.beginPath();x.arc(bx,110,17,0,7);x.fill();
    x.strokeStyle='#6e1620';x.lineWidth=3;for(let a=0;a<8;a++){x.beginPath();x.moveTo(bx+Math.cos(a*.785)*6,110+Math.sin(a*.785)*6);x.lineTo(bx+Math.cos(a*.785)*14,110+Math.sin(a*.785)*14);x.stroke()}
    x.fillStyle='#d4a443';for(let k=0;k<3;k++){x.fillRect(bx-18+k*14,160,8,40)}}
  // floor
  const fg=x.createLinearGradient(0,GROUND,0,H+100);fg.addColorStop(0,'#3a2420');fg.addColorStop(1,'#120a0a');x.fillStyle=fg;x.fillRect(0,GROUND,W,H+100-GROUND);
  x.strokeStyle='rgba(255,200,140,.07)';x.lineWidth=2;for(let i=0;i<7;i++){const yy=GROUND+4+i*i*3.2;x.beginPath();x.moveTo(0,yy);x.lineTo(W,yy);x.stroke()}
  for(let i=-8;i<=24;i++){x.beginPath();x.moveTo(480+(i*60-480)*0.5,GROUND);x.lineTo(480+(i*60-480)*1.5,H);x.stroke()}
  // carpet runner to the dais
  x.fillStyle='#6a1420';x.fillRect(0,GROUND+10,640,46);x.fillStyle='#d4a443';x.fillRect(0,GROUND+10,640,3);x.fillRect(0,GROUND+53,640,3);
  x.fillStyle='rgba(212,164,67,.5)';for(let i=0;i<640;i+=44){x.fillRect(i+14,GROUND+25,16,16)}
  // dais + throne
  x.fillStyle='#3a2a22';x.fillRect(640,GROUND-12,320,40);x.fillStyle='#c8963c';x.fillRect(640,GROUND-14,320,4);
  x.fillStyle='#2f2019';x.fillRect(700,GROUND-30,260,20);x.fillStyle='#c8963c';x.fillRect(700,GROUND-32,260,4);
  const tx=845,ty=GROUND-32;x.fillStyle='#4e1520';x.beginPath();x.moveTo(tx-92,ty);x.lineTo(tx-92,ty-190);x.quadraticCurveTo(tx-92,ty-290,tx,ty-300);x.quadraticCurveTo(tx+92,ty-290,tx+92,ty-190);x.lineTo(tx+92,ty);x.closePath();x.fill();
  x.strokeStyle='#d4a443';x.lineWidth=5;x.stroke();x.strokeStyle='#d4a443';x.lineWidth=2;x.beginPath();x.moveTo(tx-70,ty);x.lineTo(tx-70,ty-185);x.quadraticCurveTo(tx-70,ty-262,tx,ty-272);x.quadraticCurveTo(tx+70,ty-262,tx+70,ty-185);x.lineTo(tx+70,ty);x.stroke();
  x.fillStyle='#d4a443';x.beginPath();x.arc(tx,ty-205,22,0,7);x.fill();x.strokeStyle='#4e1520';x.lineWidth=3;for(let a=0;a<12;a++){x.beginPath();x.moveTo(tx+Math.cos(a*.5236)*8,ty-205+Math.sin(a*.5236)*8);x.lineTo(tx+Math.cos(a*.5236)*20,ty-205+Math.sin(a*.5236)*20);x.stroke()}
  x.fillStyle='#6e1a24';x.fillRect(tx-62,ty-52,124,52);x.strokeStyle='#d4a443';x.lineWidth=3;x.strokeRect(tx-62,ty-52,124,52);
  // table
  x.fillStyle='#2b1810';x.fillRect(TABLE.x-52,TABLE.y-52,104,10);x.fillRect(TABLE.x-44,TABLE.y-42,8,42);x.fillRect(TABLE.x+36,TABLE.y-42,8,42);
  x.fillStyle='#d4a443';x.fillRect(TABLE.x-52,TABLE.y-53,104,3);
  COURTC=c;
}
function drawCourt(){
  if(!COURTC)buildCourt();ctx.drawImage(COURTC,0,0);
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const wx of [150,420,690]){const gr=ctx.createLinearGradient(wx,60,wx+160,GROUND);gr.addColorStop(0,'rgba(255,170,80,.16)');gr.addColorStop(1,'rgba(255,140,60,0)');ctx.fillStyle=gr;
    ctx.beginPath();ctx.moveTo(wx-34,100);ctx.lineTo(wx+34,100);ctx.lineTo(wx+230,GROUND+30);ctx.lineTo(wx+110,GROUND+30);ctx.fill()}
  for(const px of [40,285,555,925]){const fl=.8+.2*Math.sin(T*9+px),r=96*fl;const gg=ctx.createRadialGradient(px,200,2,px,200,r);gg.addColorStop(0,'rgba(255,190,90,.5)');gg.addColorStop(1,'rgba(255,140,40,0)');ctx.fillStyle=gg;ctx.fillRect(px-r,200-r,2*r,2*r)}
  ctx.restore();
  for(const px of [40,285,555,925]){ctx.fillStyle='#3a2210';ctx.fillRect(px-3,206,6,18);const fl=1+.18*Math.sin(T*11+px);ctx.fillStyle='#ffb040';ctx.beginPath();ctx.ellipse(px,198,5*fl,11*fl,0,0,7);ctx.fill();ctx.fillStyle='#fff2b0';ctx.beginPath();ctx.ellipse(px,201,2.4,5.5,0,0,7);ctx.fill()}
  // the sealed report on the table
  if(c2.reportOn){const px=TABLE.x,py=TABLE.y-58,gl=.5+.5*Math.sin(T*3);
    ctx.fillStyle='#e2cf9c';ctx.fillRect(px-26,py-9,52,10);ctx.strokeStyle='#8a6a34';ctx.lineWidth=1.5;ctx.strokeRect(px-26,py-9,52,10);
    ctx.fillStyle='#b01c28';ctx.beginPath();ctx.arc(px,py-4,6.5,0,7);ctx.fill();
    ctx.save();ctx.globalCompositeOperation='lighter';const gg=ctx.createRadialGradient(px,py-4,2,px,py-4,34);gg.addColorStop(0,'rgba(255,60,60,'+(0.25+0.25*gl)+')');gg.addColorStop(1,'rgba(255,60,60,0)');ctx.fillStyle=gg;ctx.fillRect(px-36,py-40,72,72);ctx.restore()}
}
function updateS2(dt){
  c2.kt+=dt;
  const V=ANIMS.weary;
  if(ph==='in'){fadeT=T>0.5?0:1;if(T>0.6){c2.vph+=95*dt/V.stride;c2.vx+=95*dt;if(c2.vx>=300){c2.vx=300;c2.vmode='talk';go('s2','talkA');setTimeout&&0;say(COURT_A,()=>{go('s2','notice')})}}}
  else if(ph==='talkA'){fadeT=0}
  else if(ph==='notice'){fadeT=0;if(T>2.6){go('s2','talkB');say(COURT_B,()=>{go('s2','leave');c2.vface=-1;c2.vmode='walk'})}}
  else if(ph==='leave'){fadeT=0;c2.vph+=95*dt/V.stride;c2.vx-=95*dt;if(c2.vx<-90){go('s2','read');c2.reportOn=false}}
  else if(ph==='read'){fadeT=T>6.4?1:0;c2.readT=T;if(T>7.8){go('title','show');fade=1;fadeT=1;setBars(0);sync()}}
  // camera focus
  let fx_=W/2,fy_=GROUND-110,z=1;
  if(dl.active){const w=dl.q[dl.i].who;if(w==='Rajendra'){fx_=KING.x-40;fy_=KING.y-120;z=1.18}else{fx_=c2.vx+30;fy_=GROUND-110;z=1.14}}
  else if(ph==='notice'){fx_=TABLE.x;fy_=GROUND-80;z=1.5}
  else if(ph==='read'){fx_=KING.x-30;fy_=KING.y-130;z=1.38}
  zf.x+=(fx_-zf.x)*Math.min(1,2.4*dt);zf.y+=(fy_-zf.y)*Math.min(1,2.4*dt);zoomT=z;
}
function drawS2(){
  drawCourt();
  // Rajendra (placeholder art until his own sheets are added)
  const kf=pingpong(Math.floor(c2.kt*8),M.msgAnn.n);shadow(KING.x,KING.y,46);
  const face=(ph==='leave'||ph==='read')?-1:-1;drawKing(kf,KING.x,KING.y,face,0.72);
  if(ph==='read'){const t=c2.readT,k=clamp(t/1.2,0,1),sx=KING.x-44,sy=KING.y-92;
    ctx.save();ctx.translate(sx,sy);ctx.fillStyle='#e8d6a4';ctx.strokeStyle='#8a6a34';ctx.lineWidth=2;
    const w=14+46*ease(k),h=26+10*ease(k);ctx.fillRect(-w/2,-h/2,w,h);ctx.strokeRect(-w/2,-h/2,w,h);ctx.fillStyle='rgba(120,90,50,.6)';for(let i=0;i<4;i++)ctx.fillRect(-w/2+6,-h/2+6+i*(h-12)/4,w-12,2);
    ctx.fillStyle='#b01c28';ctx.beginPath();ctx.arc(w/2-6,h/2,5,0,7);ctx.fill();ctx.restore()}
  // Vetri
  const vx=c2.vx;shadow(vx,GROUND,50);
  if(c2.vmode==='walk')blit('weary',Math.floor(c2.vph*M.weary.n)%M.weary.n,vx,GROUND,c2.vface,ANIMS.weary.scale);
  else blit('talk',Math.floor(c2.kt*8)%M.talk.n,vx,GROUND,c2.vface,ANIMS.talk.scale);
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
function updateTitle(dt){fadeT=1;fade=1;if(scn==='title'&&T>7.5)go('end','end')}
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
  if(who==='Vetri'){img=IMG.talk;m=M.talk;sx=m.AX-40;sy=2;sw=80}
  else if(who==='Royal Messenger'){img=IMG.msgAnn;m=M.msgAnn;sx=m.AX-58;sy=4;sw=88}
  else{img=kingSheet();m=M.msgAnn;sx=m.AX-58;sy=4;sw=88}
  ctx.drawImage(img,sx,sy,sw,sw,cx-r,cy-r,2*r,2*r);ctx.restore();
  ctx.strokeStyle='#d4a443';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.stroke();
}
function drawDialogue(){
  if(!dl.active)return;const L=dl.q[dl.i],x=40,w=W-80,h=132,y=H-48-h-10;
  ctx.fillStyle='rgba(16,8,8,.88)';ctx.strokeStyle='#c8963c';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x,y,w,h,14);ctx.fill();ctx.stroke();
  portrait(L.who,x+66,y+h/2,46);
  const col=NAMECOL[L.who]||'#e8c27a';ctx.font='bold 18px Georgia,serif';const nw=ctx.measureText(L.who).width+34;
  ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(x+130,y-15,nw,30,9);ctx.fill();ctx.fillStyle='#2a1508';ctx.fillText(L.who,x+147,y+6);
  ctx.fillStyle='#f6e7c4';ctx.font='23px Georgia,serif';const txt=L.text.slice(0,Math.floor(dl.typed));
  wrap(txt,w-170).forEach((l,i)=>ctx.fillText(l,x+130,y+52+i*31));
  if(dl.typed>=L.text.length){ctx.fillStyle='rgba(232,194,122,'+(0.5+0.5*Math.sin(T*6))+')';ctx.fillText('\u25BC',x+w-34,y+h-16)}
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
  }else{updatePlayer(dt);camX+=((p.x-W/2)-camX)*Math.min(1,6*dt);camX=clamp(camX,0,WORLD-W)}
  bars+=(barsT-bars)*Math.min(1,4*dt);zoom+=(zoomT-zoom)*Math.min(1,2.2*dt);fade+=(fadeT-fade)*Math.min(1,2.6*dt);
  cyT=(dl.active&&(scn==='s1'||scn==='s2'))?-68:0;cy+=(cyT-cy)*Math.min(1,3*dt);
  if(scn!=='s2'){zf.x=W/2;zf.y=GROUND-110}
  update.s=(update.s||0)+dt;if(update.s>0.15){update.s=0;sync()}
}
function render(){
  ctx.clearRect(0,0,W,H);
  if(mode==='scene'&&scn==='intro'){drawIntro();vignette();return}
  if(mode==='scene'&&(scn==='title'||scn==='end')){drawTitle();return}
  ctx.save();ctx.translate(0,cy);if(zoom!==1){ctx.translate(zf.x,zf.y);ctx.scale(zoom,zoom);ctx.translate(-zf.x,-zf.y)}
  if(scn==='s2')drawS2();
  else{bg();if(mode==='scene')drawSoldiers();drawPlayer();fxDraw();if(mode==='scene')drawMsg()}
  ctx.restore();
  motesDraw(scn==='s2'?'rgba(255,170,90,A)':'rgba(255,205,140,A)');
  if(scn!=='s2'){ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(W*0.88,H*0.3,10,W*0.88,H*0.3,360);g.addColorStop(0,'rgba(255,170,80,.20)');g.addColorStop(1,'rgba(255,120,60,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore()}
  vignette();
  if(bars>0.01){ctx.fillStyle='#000';ctx.fillRect(0,0,W,46*bars);ctx.fillRect(0,H-46*bars,W,46*bars)}
  drawDialogue();
  if(mode==='scene'&&scn==='s1'&&ph==='walk'&&T>1.2&&p.x<650){ctx.fillStyle='rgba(246,231,196,'+(0.55+0.4*Math.sin(T*3))+')';ctx.font='20px Georgia,serif';ctx.textAlign='center';ctx.fillText('Hold  \u25B6  to walk',W/2,64);ctx.textAlign='left'}
  if(mode==='scene'&&scn==='s2'&&ph==='in'&&T>0.9&&T<4.4){const a=Math.min(1,(T-0.9)/0.7)*Math.min(1,(4.4-T)/0.7);ctx.save();ctx.globalAlpha=a;ctx.fillStyle='#f3e4c2';ctx.font='bold 34px Georgia,serif';ctx.shadowColor='#000';ctx.shadowBlur=8;spaced('THE KING\u2019S COURT',230,H-90,6);ctx.font='italic 19px Georgia,serif';ctx.fillStyle='#e8c27a';ctx.textAlign='left';ctx.fillText('Thanjavur \u2014 the Chola capital',80,H-62);ctx.restore()}
  if(fade>0.002){ctx.fillStyle='rgba(0,0,0,'+clamp(fade,0,1)+')';ctx.fillRect(0,0,W,H)}
}
/* ---------------- input ---------------- */
function advance(){
  if(mode!=='scene')return;
  if(dl.active)dlAdvance();else if(scn==='intro')nextCard();else if(scn==='end')startScene();
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
window.__keys=keys;window.__frame=(dt)=>{update(dt);render()};window.__st=()=>({mode,scn,ph,T,p,dl,c2,fade,bars,ci});
startScene();
