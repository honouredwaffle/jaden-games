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
    const wp=n=>{const v=new T.Vector3();B[n].getWorldPosition(v);return v;};
    const dirBody=(a,bn)=>{ const d=wp(bn).clone().sub(wp(a)); const gq=new T.Quaternion(); q.group.getWorldQuaternion(gq); return d.applyQuaternion(gq.clone().invert()); };
    const f=v=>[v.x.toFixed(2),v.y.toFixed(2),v.z.toFixed(2)].join(',');
    const L=[];
    L.push('idleSkinned source: '+(G.idleSkinned? 'exposed':'?'));
    G.idleSkinned(q,0); q.group.updateMatrixWorld(true);
    L.push('after idleSkinned: shoulder->elbow='+f(dirBody('LeftArm','LeftForeArm')));
    // call the page's own animateSkinned
    G.animateSkinned(q,0,1,0); q.group.updateMatrixWorld(true);
    L.push('after animateSkinned(walk): shoulder->elbow='+f(dirBody('LeftArm','LeftForeArm'))+' hand-rel-shoulder='+f(wp('LeftHand').clone().sub(wp('LeftShoulder'))));
    return L.join('\n');
  });
  console.log(out);
  await b.close(); process.exit(0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
