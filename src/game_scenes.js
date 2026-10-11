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
