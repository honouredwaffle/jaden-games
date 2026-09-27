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
  const fight=await p.evaluate(()=>{
    const G=window.GRIND, P=G.player;
    G.setPause(true); P.onFoot=true; P.group.visible=true; P.pos.set(0,0,0); P.yaw=0; P.group.rotation.y=0;
    const ped=G.peds[0]; ped.pos.set(0,0,1.5); ped.robbed=false; ped.kod=false; ped.hp=60; ped.angry=false;
    G.punch();
    const afterPunch={ hp:ped.hp, angry:ped.angry };
    let hpBefore=G.playerHp, hitBack=false, kodAfter=false;
    for(let i=0;i<240;i++){ G.updateCombat(1/60); if(G.playerHp<hpBefore) hitBack=true; if(ped.kod) kodAfter=true; }
    return { afterPunch, hitBack, playerHpAfter:Math.round(G.playerHp), pedKod:kodAfter, pedHpAfter:Math.round(ped.hp) };
  });
  console.log('FIGHT', JSON.stringify(fight));
  // close-up of a parked car in-game
  await p.evaluate(()=>{ const G=window.GRIND, c=G.cars[0]; G.setPause(true);
    for(const q of G.peds) if(q.group) q.group.visible=false;
    const cp=c.pos; G.camera.position.set(cp.x+3.4, 1.6, cp.z-4.4);
    G.camera.lookAt(cp.x, 0.65, cp.z); });
  await p.waitForTimeout(150); await p.screenshot({path:OUT+'grind_car_ingame.png'});
  console.log('ERRORS', errs.slice(0,4));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
