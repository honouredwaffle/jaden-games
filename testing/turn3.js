const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const OUT='/root/.openclaw/workspace-sukuna/media/';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:900,height:600}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message.slice(0,120)));
  await p.goto('http://127.0.0.1:8951/grind.html?n=2',{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.traffic.length>0,null,{timeout:25000});
  await p.waitForTimeout(500);
  const turn=await p.evaluate(async()=>{
    const G=window.GRIND, tr=G.traffic[0], C=tr.car;
    for(const o of G.traffic) if(o!==tr) o.stolen=true;
    const rnd=Math.random; Math.random=()=>0.0;
    tr.alongZ=true; tr.line=24; tr.dir=1; tr.axial=10; tr.next=24; tr.speed=tr.base=11; tr.stolen=false;
    C.pos.set(24+4.6,0,10); C.yaw=0;
    const y0=C.yaw; let last=C.yaw, maxd=0, n=0, turned=false;
    for(let i=0;i<400;i++){ await new Promise(r=>requestAnimationFrame(r));
      const d=Math.abs(((C.yaw-last+Math.PI)%(Math.PI*2))-Math.PI); if(d>maxd)maxd=d; last=C.yaw; n++;
      if(Math.abs(((C.yaw-y0+Math.PI)%(Math.PI*2))-Math.PI) > 1.4) { turned=true; if(n>60) break; }
    }
    Math.random=rnd;
    const total=Math.abs(((C.yaw-y0+Math.PI)%(Math.PI*2))-Math.PI);
    return { turned90: turned || total>1.4, totalTurnDeg:+(total*57.3).toFixed(1), maxYawPerFrameRad:+maxd.toFixed(3), maxDegPerFrame:+(maxd*57.3).toFixed(1), frames:n };
  });
  console.log('TURN', JSON.stringify(turn));
  // screenshot close-up of the car after the glass/chrome fix
  await p.evaluate(()=>{ const G=window.GRIND, c=G.cars[0]; G.setPause(true);
    for(const q of G.peds) if(q.group) q.group.visible=false;
    const cp=c.pos; G.camera.position.set(cp.x+3.6, 1.7, cp.z-4.6); G.camera.lookAt(cp.x, 0.62, cp.z); });
  await p.waitForTimeout(200); await p.screenshot({path:OUT+'grind_car2.png'});
  console.log('ERRORS', errs.slice(0,4));
  await b.close(); process.exit(0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
