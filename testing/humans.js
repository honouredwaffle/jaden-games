const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const OUT='/root/.openclaw/workspace-sukuna/media/';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:900,height:600}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message.slice(0,160)));
  p.on('console',m=>{ if(m.type()==='error') errs.push('CERR '+m.text().slice(0,160)); });
  await p.goto('http://127.0.0.1:8951/grind.html?n=4',{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.MANNEQUIN&&window.GRIND.MANNEQUIN.ready,null,{timeout:40000});
  await p.waitForTimeout(1200);
  const info=await p.evaluate(()=>{
    const G=window.GRIND;
    let bones=0,meshes=0,mats=new Set();
    G.peds[0].root.traverse(o=>{ if(o.isBone)bones++; if(o.isMesh){meshes++; (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>mats.add(m.name)); } });
    return { nPeds:G.peds.length, pedBones:bones, pedMeshes:meshes,
             mats:[...mats].slice(0,14),
             playerSkinned:!!G.player.skinned,
             playerH:+G.player.root.scale.x.toFixed(3),
             src:[...new Set((G.MANNEQUIN&&G.MANNEQUIN.src)?[G.MANNEQUIN.src]:['?'])],
             look:[...mats].filter(n=>/casualsuit|shoes|short|long/.test(n)) };
  });
  console.log('INFO', JSON.stringify(info));
  console.log('ERRORS', errs.length? errs.slice(0,6):'none');
  // screenshot the player with the game camera
  await p.evaluate(()=>{ const G=window.GRIND,P=G.player; G.setPause(true);
    P.pos.set(0,0,0); P.group.position.set(0,0,0); P.yaw=0; P.group.rotation.y=0;
    G.animateSkinned(P,0.6,0.3,0);
    G.cam.yaw=Math.PI; G.cam.pitch=0.18; G.cam.dist=5.0; });
  await p.waitForTimeout(200); await p.screenshot({path:OUT+'ingame_player.png'});
  console.log('shot');
  await b.close(); process.exit(0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
