const C = document.getElementById('C');
const CR = document.getElementById('CR');
let mx=-200,my=-200,rx=-200,ry=-200;
document.addEventListener('mousemove',e=>{
  mx=e.clientX; my=e.clientY;
  C.style.left=mx+'px'; C.style.top=my+'px';
});
(function loop(){
  rx+=(mx-rx)*.11; ry+=(my-ry)*.11;
  CR.style.left=rx+'px'; CR.style.top=ry+'px';
  requestAnimationFrame(loop);
})();
document.addEventListener('mousedown',()=>{C.style.transform='translate(-50%,-50%) scale(2.5)';C.style.background='#fff';});
document.addEventListener('mouseup',()=>{C.style.transform='translate(-50%,-50%) scale(1)';C.style.background='#39ff14';});
document.querySelectorAll('a,button,.fc,.bn,.gi').forEach(el=>{
  el.addEventListener('mouseenter',()=>{CR.style.width='46px';CR.style.height='46px';CR.style.borderColor='#39ff14';});
  el.addEventListener('mouseleave',()=>{CR.style.width='28px';CR.style.height='28px';CR.style.borderColor='rgba(57,255,20,.5)';});
});
document.addEventListener('click',e=>{
  const r=document.createElement('div');
  r.className='rip'; r.style.left=e.clientX+'px'; r.style.top=e.clientY+'px';
  document.body.appendChild(r); setTimeout(()=>r.remove(),600);
});

const cv=document.getElementById('cv');
const ctx=cv.getContext('2d');
function rsz(){cv.width=window.innerWidth;cv.height=window.innerHeight;}
rsz(); window.addEventListener('resize',()=>{rsz();buildGrid();});

const CELL=32;
let cols,rows,grid=[];
function buildGrid(){
  cols=Math.ceil(cv.width/CELL)+1;
  rows=Math.ceil(cv.height/CELL)+1;
  grid=[];
  for(let y=0;y<rows;y++){
    grid.push([]);
    for(let x=0;x<cols;x++){
      grid[y].push({a:0,ta:Math.random()<.035?Math.random()*.1:0,spd:.008+Math.random()*.012,green:Math.random()<.28});
    }
  }
}
buildGrid();

let pmx=-999,pmy=-999;
document.addEventListener('mousemove',e=>{pmx=e.clientX;pmy=e.clientY;});

function drawCv(){
  ctx.clearRect(0,0,cv.width,cv.height);
  const g=ctx.createRadialGradient(pmx,pmy,0,pmx,pmy,260);
  g.addColorStop(0,'rgba(57,255,20,0.038)');
  g.addColorStop(1,'transparent');
  ctx.fillStyle=g; ctx.fillRect(0,0,cv.width,cv.height);

  const mcx=Math.floor(pmx/CELL),mcy=Math.floor(pmy/CELL);
  for(let y=0;y<rows;y++){
    for(let x=0;x<cols;x++){
      const c=grid[y][x];
      const d=Math.sqrt((x-mcx)**2+(y-mcy)**2);
      if(d<5) c.ta=Math.min(.28,c.ta+(5-d)*.012);
      else c.ta*=.994;
      if(Math.random()<.0007) c.ta=Math.random()*.12;
      c.a+=(c.ta-c.a)*c.spd;
      if(c.a>.004){
        ctx.fillStyle=c.green?`rgba(57,255,20,${c.a})`:`rgba(255,255,255,${c.a*.35})`;
        ctx.fillRect(x*CELL,y*CELL,CELL-1,CELL-1);
      }
    }
  }
  ctx.strokeStyle='rgba(57,255,20,0.016)'; ctx.lineWidth=.5;
  for(let x=0;x<=cv.width;x+=CELL){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,cv.height);ctx.stroke();}
  for(let y=0;y<=cv.height;y+=CELL){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(cv.width,y);ctx.stroke();}
  requestAnimationFrame(drawCv);
}
drawCv();

const nav=document.getElementById('nav');
window.addEventListener('scroll',()=>{
  const s=window.scrollY>60;
  nav.style.background=s?'rgba(5,5,5,.98)':'rgba(5,5,5,.88)';
  nav.style.borderBottomColor=s?'rgba(57,255,20,.1)':'rgba(255,255,255,.06)';
});

const mqItems=['МОД-ПАКЕТЫ','FIREBASE SYNC','MODRINTH API','ШЕЙДЕРЫ','РЕСУРСПАКИ','СКИНЫ','JAVA АВТОУСТАНОВКА','ПИРАТКА','ЛИЦЕНЗИЯ','БЕСПЛАТНО','G1GC ОПТИМИЗАЦИЯ','АВТОСИНК'];
const mqEl=document.getElementById('mqEl');
[...mqItems,...mqItems].forEach(txt=>{
  const s=document.createElement('span'); s.textContent=txt; mqEl.appendChild(s);
});

async function fetchDownloads(){
  try{
    const res=await fetch('https://api.github.com/repos/akybefff/installerlauncher/releases');
    if(!res.ok) throw new Error('API error');
    const releases=await res.json();
    let total=0;
    releases.forEach(r=>{
      r.assets.forEach(a=>{ total+=a.download_count; });
    });
    updateDownloadCounters(total);
  } catch(e){
    document.getElementById('dl-count').textContent='N/A';
    document.getElementById('dl-count').classList.remove('loading');
    const bnDl=document.getElementById('bn-dl');
    if(bnDl){ bnDl.textContent='N/A'; }
  }
}

function updateDownloadCounters(total){
  const fmt=n=>{
    if(n>=1000) return Math.floor(n/100)/10+'K';
    return n.toString();
  };

  const dlCount=document.getElementById('dl-count');
  if(dlCount){
    dlCount.classList.remove('loading');
    animCounterEl(dlCount,total,fmt);
  }

  const bnDl=document.getElementById('bn-dl');
  if(bnDl){
    animCounterEl(bnDl,total,fmt);
    bnDl.style.transition='color .3s';
    bnDl.closest('.bn').style.opacity='1';
    bnDl.closest('.bn').style.transform='translateY(0)';
  }
}

function animCounterEl(el,target,fmt){
  const dur=2000,start=performance.now();
  (function step(now){
    const p=Math.min((now-start)/dur,1);
    const eased=1-Math.pow(1-p,4);
    const val=Math.floor(eased*target);
    el.textContent=fmt(val);
    if(p<1) requestAnimationFrame(step);
    else el.textContent=fmt(target);
  })(start);
}

fetchDownloads();

const cntObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const el=e.target;
      const t=parseInt(el.dataset.target);
      const dur=1800,s=performance.now();
      (function f(now){
        const p=Math.min((now-s)/dur,1),e2=1-Math.pow(1-p,4);
        el.textContent=Math.floor(e2*t);
        if(p<1)requestAnimationFrame(f);
        else el.textContent=t;
      })(s);
      cntObs.unobserve(el);
    }
  });
},{threshold:.5});
document.querySelectorAll('[data-target]').forEach(el=>cntObs.observe(el));

const revObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.style.opacity='1';
      e.target.style.transform='translateY(0)';
      revObs.unobserve(e.target);
    }
  });
},{threshold:.1});

document.querySelectorAll('.fc').forEach((el,i)=>{
  el.style.transition=`opacity .7s ${i*.09}s ease,transform .7s ${i*.09}s ease,border-color .3s,background .3s`;
  revObs.observe(el);
});
document.querySelectorAll('.bn').forEach((el,i)=>{
  el.style.transition=`opacity .6s ${i*.1}s ease,transform .6s ${i*.1}s ease,background .3s`;
  if(!el.querySelector('#bn-dl')) revObs.observe(el);
});
document.querySelectorAll('.gi').forEach((el,i)=>{
  el.style.transition=`opacity .7s ${i*.12}s ease,transform .7s ${i*.12}s ease,border-color .3s`;
  revObs.observe(el);
});

document.querySelectorAll('.fc').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    card.style.setProperty('--mx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');
    card.style.setProperty('--my',((e.clientY-r.top)/r.height*100).toFixed(1)+'%');
  });
});

window.addEventListener('scroll',()=>{
  const sy=window.scrollY;
  if(sy<window.innerHeight){
    const hero=document.getElementById('hero');
    if(hero) hero.style.transform=`translateY(${sy*.18}px)`;
  }
});

const gline=document.querySelector('.gline');
const CHARS='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
const ORIG='LAUNCHER';
let stimer=null;
if(gline){
  gline.addEventListener('mouseenter',()=>{
    let iter=0; clearInterval(stimer);
    stimer=setInterval(()=>{
      gline.childNodes[0].textContent=ORIG.split('').map((c,i)=>
        i<iter?ORIG[i]:CHARS[Math.floor(Math.random()*CHARS.length)]
      ).join('');
      iter+=.35;
      if(iter>=ORIG.length){gline.childNodes[0].textContent=ORIG;clearInterval(stimer);}
    },35);
  });
}

function openLb(url){
  const lb=document.getElementById('lb');
  const img=document.getElementById('lb-img');
  img.src=url;
  lb.classList.add('active');
  document.body.style.overflow='hidden';
}
function closeLb(){
  document.getElementById('lb').classList.remove('active');
  document.body.style.overflow='';
}
document.addEventListener('keydown',e=>{if(e.key==='Escape') closeLb();});
