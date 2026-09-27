const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const OUT='/root/.openclaw/workspace-sukuna/media/';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:960,height:600}});
  const errs=[]; p.on('console',m=>{ if(m.type()==='error') errs.push(m.text().slice(0,160)); });
  p.on('pageerror',e=>errs.push('PAGEERR '+e.message.slice(0,180)));
  await p.goto('http://127.0.0.1:8951/grind.html?n=2',{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.traffic&&window.GRIND.traffic.length>0,null,{timeout:25000});
  await p.waitForTimeout(800);
  // --- check car meshes + materials ---
  const info=await p.evaluate(()=>{
    const G=window.GRIND, c=G.cars[0];
    let meshes=0, phys=0; c.group.traverse(o=>{ if(o.isMesh){ meshes++; if(o.material&&o.material.isMeshPhysicalMaterial) phys++; } });
    return { nTraffic:G.traffic.length, carMeshes:meshes, physicalMats:phys, hasPunch:typeof G.punch==='function', playerHp:G.playerHp };
  });
  console.log('INFO', JSON.stringify(info));
  // --- let traffic run and record YAW continuity to verify smooth turns ---
  const yaw=await p.evaluate(async()=>{
    const G=window.GRIND, t=G.traffic[0], C=t.car;
    // force a turn by teleporting the car to a junction approach and letting it cross
    const samples=[]; let last=C.yaw;
    for(let i=0;i<160;i++){
      await new Promise(r=>requestAnimationFrame(r));
      let d=Math.abs(((C.yaw-last+Math.PI)%(Math.PI*2))-Math.PI);
      samples.push(d); last=C.yaw;
    }
    samples.sort((a,b)=>b-a);
    return { maxJump:samples[0], p99:samples[3], avg:samples.reduce((a,b)=>a+b,0)/samples.length };
  });
  console.log('YAW', JSON.stringify(yaw));
  // --- punch test: place a ped in front, punch, check hp/aggro ---
  const fight=await p.evaluate(async()=>{
    const G=window.GRIND, P=G.player;
    P.onFoot=true; P.group.visible=true; P.pos.set(0,0,0); P.yaw=0; P.group.rotation.y=0;
    const ped=G.peds[0]; ped.pos.set(0,0,2.0); ped.group.visible=true; ped.robbed=false; ped.kod=false; ped.hp=60;
    G.punch();
    const after={ hp:ped.hp, angry:ped.angry };
    // let NPC fight back
    let hpBefore=G.playerHp; for(let i=0;i<180;i++){ await new Promise(r=>requestAnimationFrame(r)); }
    return { after, playerHpNow:G.playerHp, hpBefore, aggroStill:ped.angry, kod:ped.kod };
  });
  console.log('FIGHT', JSON.stringify(fight));
  console.log('ERRORS', errs.length? errs.slice(0,5): 'none');
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
