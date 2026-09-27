const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:600,height:400}});
  await p.goto('http://127.0.0.1:8951/grind.html?n=2',{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.MANNEQUIN&&window.GRIND.MANNEQUIN.ready,null,{timeout:40000});
  await p.waitForTimeout(700);
  const out=await p.evaluate(()=>{
    const G=window.GRIND,T=G.THREE;
    const q=G.peds[0], B=q.bones;
    q.group.rotation.y=0; q.group.position.set(0,0,0);
    G.idleSkinned(q,0); q.group.updateMatrixWorld(true);
    // body-frame helper: convert world vec -> char frame (group has yaw 0 so world==body)
    const wp=n=>{const v=new T.Vector3();B[n].getWorldPosition(v);return v;};
    const dirBody=(a,bn)=>{ const d=wp(bn).clone().sub(wp(a));
      // rotate into group frame
      const gq=new T.Quaternion(); q.group.getWorldQuaternion(gq); d.applyQuaternion(gq.clone().invert());
      return d; };
    const f=v=>[v.x.toFixed(2),v.y.toFixed(2),v.z.toFixed(2)].join(',');
    const L=[];
    L.push('LeftArm shoulder->elbow   : '+f(dirBody('LeftArm','LeftForeArm')));
    L.push('LeftForeArm elbow->wrist  : '+f(dirBody('LeftForeArm','LeftHand')));
    L.push('LeftHand wrist->index1    : '+f(dirBody('LeftHand','LeftHandIndex1')));
    L.push('has kQ LeftArm? '+!!(B['LeftArm']&&B['LeftArm'].userData.kQ)+'  rest? '+!!(B['LeftArm']&&B['LeftArm'].userData.rest));
    // what does aimBone set? inspect resulting local quat vs rest
    const before=B['LeftArm'].quaternion.clone();
    G.idleSkinned(q,0); q.group.updateMatrixWorld(true);
    L.push('quat changed by idleSkinned? '+(!before.equals(B['LeftArm'].quaternion)));
    return L.join('\n');
  });
  console.log(out);
  await b.close(); process.exit(0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
