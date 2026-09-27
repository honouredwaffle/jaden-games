const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:600,height:400}});
  await p.goto('http://127.0.0.1:8951/grind.html?n=2&cb='+Date.now(),{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.MANNEQUIN&&window.GRIND.MANNEQUIN.ready,null,{timeout:40000});
  await p.waitForTimeout(700);
  const out=await p.evaluate(()=>{
    const G=window.GRIND,T=G.THREE;
    const q=G.peds[0], B=q.bones;
    q.group.rotation.y=0; q.group.position.set(0,0,0); q.group.updateMatrixWorld(true);
    G.setPause(true);                       // freeze the game loop so it can't overwrite
    const wp=n=>{const v=new T.Vector3();B[n].getWorldPosition(v);return v;};
    const dir=()=>{ const d=wp('LeftForeArm').clone().sub(wp('LeftArm')); const gq=new T.Quaternion(); q.group.getWorldQuaternion(gq); return d.applyQuaternion(gq.clone().invert()); };
    const f=v=>[v.x.toFixed(2),v.y.toFixed(2),v.z.toFixed(2)].join(',');
    const L=[];
    B['LeftArm'].quaternion.copy(B['LeftArm'].userData.rest); q.group.updateMatrixWorld(true);
    L.push('rest: '+f(dir()));
    G.aimBone(B,'LeftArm',0,-1,0); q.group.updateMatrixWorld(true);
    L.push('page aimBone down: '+f(dir()));
    B['LeftArm'].quaternion.copy(B['LeftArm'].userData.rest);
    G.aimArm(B,'L',1.30,-0.05); q.group.updateMatrixWorld(true);
    L.push('page aimArm hang1.30: '+f(dir()));
    B['LeftArm'].quaternion.copy(B['LeftArm'].userData.rest);
    G.idleSkinned(q,0); q.group.updateMatrixWorld(true);
    L.push('idleSkinned: '+f(dir()));
    return L.join('\n');
  });
  console.log(out);
  await b.close(); process.exit(0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
