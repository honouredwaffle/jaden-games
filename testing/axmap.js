const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:700,height:500}});
  await p.goto('http://127.0.0.1:8951/grind.html?n=2',{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.MANNEQUIN&&window.GRIND.MANNEQUIN.ready,null,{timeout:40000});
  await p.waitForTimeout(800);
  const out=await p.evaluate(()=>{
    const G=window.GRIND,T=G.THREE;
    const q=G.peds[0]; const B=q.bones;
    const V=(x,y,z)=>new T.Vector3(x,y,z);
    const L=[];
    // FACING: foot -> toe direction (toe-out of LeftToeBase)
    const wp=(nm)=>{const v=new T.Vector3();B[nm]&&B[nm].getWorldPosition(v);return v;};
    const toe=B['LeftToeBase']?wp('LeftToeBase'):null, foot=wp('LeftFoot');
    if(toe){const d=toe.clone().sub(foot); d.y=0; d.normalize(); L.push('FACING(foot->toe xz) = '+d.x.toFixed(2)+','+d.z.toFixed(2));}
    // print each bone's LOCAL axes expressed in WORLD, and rest child dir
    const show=(bone,child)=>{
      if(!B[bone]) return;
      const bw=new T.Quaternion(); B[bone].getWorldQuaternion(bw);
      const ax=['x','y','z'].map(a=>{const v=V(a==='x'?1:0,a==='y'?1:0,a==='z'?1:0).applyQuaternion(bw); return a+'=('+v.x.toFixed(2)+','+v.y.toFixed(2)+','+v.z.toFixed(2)+')';}).join('  ');
      const r=child?wp(child).clone().sub(wp(bone)):new T.Vector3();
      L.push(bone.padEnd(14)+(child?(' ->'+child.split(' ')[0]):'').padEnd(2)+'  r=('+r.x.toFixed(2)+','+r.y.toFixed(2)+','+r.z.toFixed(2)+')  axes: '+ax);
    };
    show('Hips','Spine'); show('Spine','Spine2'); show('Spine2','Neck'); show('Neck','Head');
    show('LeftShoulder','LeftArm'); show('LeftArm','LeftForeArm'); show('LeftForeArm','LeftHand');
    show('RightShoulder','RightArm'); show('RightArm','RightForeArm'); show('RightForeArm','RightHand');
    show('LeftUpLeg','LeftLeg'); show('LeftLeg','LeftFoot'); show('LeftFoot','LeftToeBase');
    return L.join('\n');
  });
  console.log(out);
  await b.close(); process.exit(0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
