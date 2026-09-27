const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const OUT='/root/.openclaw/workspace-sukuna/media/';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:420,height:760}});
  const errs=[]; p.on('pageerror',e=>errs.push('pageerror: '+e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/favicon|404/.test(m.text()))errs.push('console: '+m.text());});
  await p.goto('http://127.0.0.1:8951/grind.html?n=2',{waitUntil:'load'});
  await p.waitForFunction(()=>window.GRIND&&window.GRIND.MANNEQUIN&&window.GRIND.MANNEQUIN.ready,null,{timeout:25000});
  await p.waitForTimeout(800);
  // clear stage: park the player on an empty walkable spot, hide cars/peds so
  // they do not block the camera, and freeze the sim
  const spot = await p.evaluate(()=>{
    const G=window.GRIND;
    let best=null;
    for(let x=-40;x<=40 && !best;x+=2) for(let z=-40;z<=40;z+=2){
      if(!G.walkable(x,z)) continue;
      let clear=true;
      for(const c of G.cars){ if(Math.hypot(c.pos.x-x,c.pos.z-z)<9){clear=false;break;} }
      if(!clear) continue;
      // want open space: nothing solid within 4m
      for(const s of G.solids){ if(x>s.minx-4&&x<s.maxx+4&&z>s.minz-4&&z<s.maxz+4){clear=false;break;} }
      if(clear){ best={x,z}; break; }
    }
    return best||{x:24,z:40};
  });
  await p.evaluate((s)=>{
    const G=window.GRIND, P=G.player;
    P.pos.set(s.x,0,s.z); P.group.position.set(s.x,0,s.z); P.yaw=0;
    for(const c of G.cars) c.group.visible=false;
    if(G.traffic) for(const t of G.traffic) if(t.car) t.car.group.visible=false;
    for(const q of G.peds) if(q.group) q.group.visible=false;
  }, spot);
  console.log('stage spot:', JSON.stringify(spot));

  const shot=async(name,{mode,phase=0,dist=3.0,front=false})=>{
    await p.evaluate(({mode,phase,dist,front})=>{
      const G=window.GRIND, P=G.player;
      G.setPause(true);
      if(mode==='run') G.animateSkinned(P,phase,1,1);
      else if(mode==='walk') G.animateSkinned(P,phase,1,0);
      else if(mode==='jump') G.poseJumpSkinned(P,0.6,true);
      else G.idleSkinned(P,0);
      const yaw = front ? P.yaw : P.yaw+Math.PI;
      G.camera.position.set(P.pos.x+Math.sin(yaw)*dist, 1.35, P.pos.z+Math.cos(yaw)*dist);
      G.camera.lookAt(P.pos.x,1.05,P.pos.z);
    },{mode,phase,dist,front});
    await p.waitForTimeout(120);
    await p.screenshot({path:OUT+'grind_'+name+'.png'});
  };
  await shot('face_idle',{mode:'idle',front:true,dist:2.2});
  await shot('back_walk',{mode:'walk',phase:Math.PI/2,dist:2.6});
  await shot('run_side',{mode:'run',phase:Math.PI/2,dist:3.0});
  console.log('ERRORS:', errs.length?errs.join('\n'):'none');
  await b.close();
})().catch(e=>{console.error('FAIL',e.stack||e.message);process.exit(1)});
