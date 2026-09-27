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
    const wpos=(nm)=>{ const v=new T.Vector3(); B[nm].getWorldPosition(v); return [v.x,v.y,v.z]; };
    const dir=(a,bn)=>{ const A=wpos(a),C=wpos(bn); return [C[0]-A[0],C[1]-A[1],C[2]-A[2]]; };
    const fmt=v=>v.map(x=>x.toFixed(2).padStart(6));
    const lines=[];
    const probe=(bone,child,label)=>{
      const rest=dir(bone,child);
      lines.push(label+'  rest='+fmt(rest));
      for(const ax of ['x','y','z']){
        const save=B[bone].quaternion.clone();
        B[bone].quaternion.copy(save).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(ax==='x'?1:0,ax==='y'?1:0,ax==='z'?1:0),1.0));
        B[bone].updateMatrixWorld(true);
        const d=dir(bone,child); const dv=[d[0]-rest[0],d[1]-rest[1],d[2]-rest[2]];
        B[bone].quaternion.copy(save);
        lines.push('   +1.0 '+ax+' -> '+fmt(dv));
      }
    };
    probe('LeftArm','LeftForeArm','LARM  (elbow vs shoulder)');
    probe('LeftForeArm','LeftHand','LFOREARM (hand vs elbow)');
    probe('LeftUpLeg','LeftLeg','LTHIGH (knee vs hip)');
    probe('LeftLeg','LeftFoot','LKNEE (ankle vs knee)');
    probe('Hips','Spine','PELVIS (spine vs hips)');
    probe('Spine','Spine2','TORSO');
    // facing: nose direction via Head, plus which way is character forward (world)
    const h=wpos('Head'), hips=wpos('Hips');
    lines.push('HEAD-hips='+fmt([h[0]-hips[0],h[1]-hips[1],h[2]-hips[2]]));
    return lines.join('\n');
  });
  console.log(out);
  await b.close(); process.exit(0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
