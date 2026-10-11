if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect)CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h){this.rect(x,y,w,h)};
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
const W=960,H=540,GROUND=405,WORLD=4300;
const M=__META__;
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
