const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const OUT='/root/.openclaw/workspace-sukuna/media/';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:1100,height:700}});
  await p.goto('http://127.0.0.1:8951/grind.html?n=6&cb='+Date.now(),{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.MANNEQUIN&&window.GRIND.MANNEQUIN.ready,null,{timeout:40000});
  await p.waitForTimeout(1000);
  const info=await p.evaluate(()=>{
    const G=window.GRIND,P=G.player; G.setPause(true);
    for(const c of G.cars) c.group.visible=false;
    if(G.traffic) for(const t of G.traffic) if(t.car) t.car.group.visible=false;
    for(const q of G.peds) q.group.visible=false;
    const put=(q,x,z,ph,run)=>{ q.group.visible=true; q.pos.set(x,0,z); q.group.position.set(x,0,z);
      q.yaw=0; q.group.rotation.y=0; G.animateSkinned(q,ph,1.0,run||0);
      q.group.updateMatrixWorld(true); G.groundClampOne(q,false,0.12); q.group.updateMatrixWorld(true); };
    const src=G.peds.slice(0,5);
    put(src[0],-2.2,0, 0.2,0); put(src[1],-1.0,0, 1.5,0); put(src[2],1.0,0, 2.9,0); put(src[3],2.2,0, 4.3,0);
    put(src[4],0,-1.2, 1.0,1);
    P.group.visible=true; P.pos.set(0,0,0.4); P.group.position.set(0,0,0.4); P.yaw=0; P.group.rotation.y=0;
    G.animateSkinned(P,1.4,1.0,0); P.group.updateMatrixWorld(true); G.groundClampOne(P,false,0.12); P.group.updateMatrixWorld(true);
    G.camera.fov=38; G.camera.updateProjectionMatrix();
    G.camera.position.set(0,1.45,6.0); G.camera.lookAt(0,0.95,0);
    // report feet heights
    const wp=(q,n)=>{const v=new G.THREE.Vector3();q.bones[n].getWorldPosition(v);return v.y;};
    return src.map((q,i)=>'ped'+i+' lowToe='+Math.min(wp(q,'LeftToeBase'),wp(q,'RightToeBase')).toFixed(3)).concat(
      ['player lowToe='+Math.min(wp(P,'LeftToeBase'),wp(P,'RightToeBase')).toFixed(3)]).join('  ');
  });
  console.log(info);
  await p.waitForTimeout(300); await p.screenshot({path:OUT+'pose_final.png'});
  await b.close(); process.exit(0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
