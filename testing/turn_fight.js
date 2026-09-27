const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const OUT='/root/.openclaw/workspace-sukuna/media/';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:900,height:600}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message.slice(0,120)));
  await p.goto('http://127.0.0.1:8951/grind.html?n=2',{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.traffic.length>0,null,{timeout:25000});
  await p.waitForTimeout(600);
  const turn=await p.evaluate(async()=>{
    const G=window.GRIND, tr=G.traffic[0], C=tr.car;
    const realRandom=Math.random; Math.random=()=>0.0; // force the "turn" branch at the junction
    tr.alongZ=true; tr.line=24; tr.dir=1; tr.axial=6; tr.next=24; tr.speed=tr.base=12; tr.stolen=false;
    C.pos.set(24+4.6, 0, 6); C.yaw=0;
    const deltas=[]; let last=C.yaw;
    for(let i=0;i<150;i++){ await new Promise(r=>requestAnimationFrame(r));
      let d=Math.abs(((C.yaw-last+Math.PI)%(Math.PI*2))-Math.PI); deltas.push(d); last=C.yaw; }
    Math.random=realRandom;
    deltas.sort((a,b)=>b-a);
    return { turned: Math.abs(((C.yaw+Math.PI)%(Math.PI*2))-Math.PI) < 3.2, maxPerFrame:deltas[0], p99:deltas[3],
             finalYaw:+C.yaw.toFixed(2) };
  });
  console.log('TURN', JSON.stringify(turn));
  const fight=await p.evaluate(async()=>{
    const G=window.GRIND, P=G.player;
    G.setPause(true); P.onFoot=true; P.group.visible=true; P.pos.set(0,0,0); P.yaw=0; P.group.rotation.y=0;
    const ped=G.peds[0]; ped.pos.set(0,0,2.0); ped.robbed=false; ped.kod=false; ped.hp=60; ped.angry=false;
    G.punch();
    const afterPunch={ hp:ped.hp, angry:ped.angry };
    for(let i=0;i<50;i++){ G.updateCombat(1/60); }   // simulate the fight without waiting on rAF
    return { afterPunch, playerHpAfter:Math.round(G.playerHp), pedKod:ped.kod };
  });
  console.log('FIGHT', JSON.stringify(fight));
  // screenshot a parked car (close-up 3/4)
  await p.evaluate(()=>{ const G=window.GRIND, c=G.cars[0]; G.setPause(true);
    for(const q of G.peds) if(q.group) q.group.visible=false;
    const cp=c.pos; G.camera.position.set(cp.x+3.2, 1.5, cp.z-4.2);
    G.camera.lookAt(cp.x, 0.7, cp.z); });
  await p.waitForTimeout(150); await p.screenshot({path:OUT+'grind_car_ingame.png'});
  console.log('ERRORS', errs.slice(0,4));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
