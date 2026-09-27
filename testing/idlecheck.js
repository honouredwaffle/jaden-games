const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:600,height:400}});
  await p.goto('http://127.0.0.1:8951/grind.html?n=3&cb='+Date.now(),{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.MANNEQUIN&&window.GRIND.MANNEQUIN.ready,null,{timeout:40000});
  await p.waitForTimeout(700);
  const out=await p.evaluate(()=>{
    const G=window.GRIND,T=G.THREE; const q=G.peds[0],B=q.bones; G.setPause(true);
    q.group.rotation.y=0; q.group.position.set(0,0,0); G.idleSkinned(q,0); q.group.updateMatrixWorld(true);
    const wp=n=>{const v=new T.Vector3();B[n].getWorldPosition(v);return v;};
    const low=Math.min(wp('LeftToeBase').y,wp('RightToeBase').y);
    return 'restToe='+(q.restToe||0).toFixed(3)+'  idle lowToe='+low.toFixed(3)+'  (should match ~restToe)';
  });
  console.log(out);
  await b.close(); process.exit(0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
