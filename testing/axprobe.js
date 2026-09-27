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
    const nose=['Hips','Spine','Spine2','Neck','Head','LeftShoulder','LeftArm','LeftForeArm','LeftHand','RightShoulder','RightArm','RightHand','LeftUpLeg','LeftLeg','LeftFoot','RightUpLeg','RightLeg','RightFoot','LeftHandIndex1'];
    // world direction helper: tip = a child bone's world pos minus this bone's world pos
    const wpos=(nm)=>{ const v=new T.Vector3(); B[nm].getWorldPosition(v); return [v.x,v.y,v.z]; };
    const dir=(a,bn)=>{ const A=wpos(a),C=wpos(bn); return [C[0]-A[0],C[1]-A[1],C[2]-A[2]]; };
    const probe=(bone,child,label)=>{
      const res={bone,label,rest:dir(bone,child)};
      for(const ax of ['x','y','z']){
        // save
        const save=B[bone].quaternion.clone();
        const qq=new T.Quaternion().setFromAxisAngle(new T.Vector3(ax==='x'?1:0,ax==='y'?1:0,ax==='z'?1:0),0.7);
        B[bone].quaternion.copy(save).multiply(qq);
        B[bone].updateMatrixWorld(true);
        const d=dir(bone,child);
        res[ax]=[+(d[0]-res.rest[0]).toFixed(3),+(d[1]-res.rest[1]).toFixed(3),+(d[2]-res.rest[2]).toFixed(3)];
        B[bone].quaternion.copy(save);
      }
      // round
      res.rest=res.rest.map(v=>+v.toFixed(3));
      return res;
    };
    const rows=[];
    rows.push(probe('LeftArm','LeftForeArm','LARM (delta of elbow)'));
    rows.push(probe('LeftForeArm','LeftHand','LFOREARM'));
    rows.push(probe('LeftUpLeg','LeftLeg','LTHIGH'));
    rows.push(probe('LeftLeg','LeftFoot','LKNEE(shin)'));
    rows.push(probe('Hips','Spine','HIPS->spine'));
    rows.push(probe('Spine','Spine2','SPINE->spine2'));
    // where does the character face? check the head's forward via a nose-ish: use Hips->Head and Spine->Neck
    const hips=wpos('Hips'), head=wpos('Head');
    return {rows, up:[+(head[1]-hips[1]).toFixed(3)]};
  });
  console.log(JSON.stringify(out,null,1));
  await b.close(); process.exit(0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
