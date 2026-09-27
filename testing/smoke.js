const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:900,height:600}});
  const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message.slice(0,160)));
  p.on('console',m=>{ if(m.type()==='error' && !/favicon/.test(m.text())) errs.push('CE '+m.text().slice(0,160)); });
  await p.goto('http://127.0.0.1:8951/grind.html?n=4&cb='+Date.now(),{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.MANNEQUIN&&window.GRIND.MANNEQUIN.ready,null,{timeout:40000});
  await p.waitForTimeout(2500);   // let the real game loop run (updatePeds + clamp)
  const r=await p.evaluate(()=>{
    const G=window.GRIND,T=G.THREE;
    const wp=(q,n)=>{const v=new T.Vector3();q.bones[n].getWorldPosition(v);return v.y;};
    const feet=G.peds.slice(0,4).map(q=>+Math.min(wp(q,'LeftToeBase'),wp(q,'RightToeBase')).toFixed(3));
    // player arm check
    const P=G.player; P.root.updateMatrixWorld(true);
    const sh=new T.Vector3(),hd=new T.Vector3(); P.bones['LeftShoulder'].getWorldPosition(sh); P.bones['LeftHand'].getWorldPosition(hd);
    return { nPeds:G.peds.length, feet, playerHandBelowShoulder:+(sh.y-hd.y).toFixed(2),
             playerHandLat:+(Math.abs(hd.x-sh.x)).toFixed(2), fps:'n/a' };
  });
  console.log('SMOKE', JSON.stringify(r));
  console.log('ERRORS', errs.length?errs.slice(0,5):'none');
  await b.close(); process.exit(0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
