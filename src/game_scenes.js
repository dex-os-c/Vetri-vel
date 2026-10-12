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
