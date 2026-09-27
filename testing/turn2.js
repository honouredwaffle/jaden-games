const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:640,height:400}});
  await p.goto('http://127.0.0.1:8951/grind.html?n=2',{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.traffic.length>0,null,{timeout:25000});
  await p.waitForTimeout(600);
  const turn=await p.evaluate(async()=>{
    const G=window.GRIND, tr=G.traffic[0], C=tr.car;
    for(const o of G.traffic) if(o!==tr) o.stolen=true;      // clear the intersection lane
    const rnd=Math.random; Math.random=()=>0.0;              // force the turn branch
    tr.alongZ=true; tr.line=24; tr.dir=1; tr.axial=14; tr.next=24; tr.speed=tr.base=11; tr.stolen=false;
    C.pos.set(24+4.6,0,14); C.yaw=0;
    const y0=C.yaw; let last=C.yaw, maxd=0, xs=[];
    for(let i=0;i<260;i++){ await new Promise(r=>requestAnimationFrame(r));
      const d=Math.abs(((C.yaw-last+Math.PI)%(Math.PI*2))-Math.PI); if(d>maxd)maxd=d; last=C.yaw;
      xs.push(+(C.yaw).toFixed(2)); }
    Math.random=rnd;
    const total=Math.abs(((C.yaw-y0+Math.PI)%(Math.PI*2))-Math.PI);
    // find the largest single-frame jump in the middle 80% of samples
    let jumps=[]; for(let i=1;i<xs.length;i++){ let d=Math.abs(((xs[i]-xs[i-1]+Math.PI)%(Math.PI*2))-Math.PI); jumps.push(d); }
    jumps.sort((a,b)=>b-a);
    return { totalTurnDeg:+(total*57.3).toFixed(1), maxPerFrameRad:+maxd.toFixed(3), top3:jumps.slice(0,3).map(x=>+x.toFixed(3)) };
  });
  console.log('TURN', JSON.stringify(turn));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
