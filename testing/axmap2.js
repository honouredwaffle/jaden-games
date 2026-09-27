const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:640,height:480}});
  await p.goto('http://127.0.0.1:8951/grind.html?n=2',{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.MANNEQUIN&&window.GRIND.MANNEQUIN.ready,null,{timeout:40000});
  await p.waitForTimeout(600);
  const out=await p.evaluate(()=>{
    const G=window.GRIND,T=G.THREE;
    const q=G.peds[0], B=q.bones;
    // RESET to rest pose + zero yaw so measurements are in the BODY frame
    q.group.rotation.y=0; q.group.position.set(0,0,0);
    for(const k in B){ if(B[k].userData.rest) B[k].quaternion.copy(B[k].userData.rest); }
    q.group.updateMatrixWorld(true);
    const V=(x,y,z)=>new T.Vector3(x,y,z);
    const wp=n=>{const v=new T.Vector3();B[n].getWorldPosition(v);return v;};
    const L=[];
    const probe=(bone,child,label)=>{
      if(!B[bone]){L.push(label+' MISSING');return;}
      const base=wp(child).clone().sub(wp(bone));
      L.push(label+'  rest='+base.toArray().map(x=>x.toFixed(2)).join(','));
      for(const s of [1,-1]) for(const ax of ['x','y','z']){
        B[bone].quaternion.copy(B[bone].userData.rest);
        B[bone].quaternion.multiply(new T.Quaternion().setFromAxisAngle(V(ax==='x'?1:0,ax==='y'?1:0,ax==='z'?1:0),s*1.0));
        q.group.updateMatrixWorld(true);
        const d=wp(child).clone().sub(wp(bone)).sub(base);
        L.push('   '+(s>0?'+1':'-1')+ax+' -> d=('+d.toArray().map(x=>x.toFixed(2)).join(',')+')');
      }
      B[bone].quaternion.copy(B[bone].userData.rest); q.group.updateMatrixWorld(true);
    };
    probe('LeftArm','LeftForeArm','LARM');
    probe('LeftForeArm','LeftHand','LFOREARM');
    probe('LeftUpLeg','LeftLeg','LTHIGH');
    probe('LeftLeg','LeftFoot','LKNEE');
    probe('LeftFoot','LeftToeBase','LFOOT');
    probe('Hips','Spine','PELVIS');
    probe('Spine','Spine2','SPINE');
    probe('Spine2','Neck','SPINE2');
    probe('Neck','Head','NECK');
    const toe=wp('LeftToeBase'),foot=wp('LeftFoot');
    const fd=toe.clone().sub(foot); fd.y=0; fd.normalize();
    L.push('FACING foot->toe = ('+fd.x.toFixed(2)+','+fd.z.toFixed(2)+')');
    return L.join('\n');
  });
  console.log(out);
  await b.close(); process.exit(0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
