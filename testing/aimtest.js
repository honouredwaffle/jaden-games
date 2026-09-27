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
    q.group.rotation.y=0; q.group.position.set(0,0,0); q.group.updateMatrixWorld(true);
    const wp=n=>{const v=new T.Vector3();B[n].getWorldPosition(v);return v;};
    const dirBody=(a,bn)=>{ const d=wp(bn).clone().sub(wp(a)); const gq=new T.Quaternion(); q.group.getWorldQuaternion(gq); return d.applyQuaternion(gq.clone().invert()); };
    const f=v=>[v.x.toFixed(2),v.y.toFixed(2),v.z.toFixed(2)].join(',');
    const L=[];
    // aim straight DOWN and see what the arm does
    const tests=[
      ['down (0,-1,0)',0,-1,0],
      ['left (-X for left arm? try +X)',1,0,0],
      ['forward (0,0,1)',0,0,1],
      ['hang 74deg', Math.cos(1.30), -Math.sin(1.30), 0],
    ];
    for(const [nm,x,y,z] of tests){
      B['LeftArm'].quaternion.copy(B['LeftArm'].userData.rest); q.group.updateMatrixWorld(true);
      aimBone_in(B,'LeftArm',x,y,z);
      q.group.updateMatrixWorld(true);
      L.push(nm+'  ->  shoulder->elbow = '+f(dirBody('LeftArm','LeftForeArm')));
    }
    // how aimBone is exposed
    function aimBone_in(B,name,dx,dy,dz){
      const b=B[name];
      const dRest=new T.Vector3(0,1,0).applyQuaternion(b.userData.rest);
      const dNew=new T.Vector3(dx,dy,dz).normalize().applyQuaternion(b.userData.kQ);
      const r=new T.Quaternion().setFromUnitVectors(dRest,dNew);
      b.quaternion.copy(r).multiply(b.userData.rest);
    }
    return L.join('\n');
  });
  console.log(out);
  await b.close(); process.exit(0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
