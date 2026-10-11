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
