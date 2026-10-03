const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('pageerror:'+e.message));
  p.on('console',m=>{ if(m.type()==='error') errs.push('console:'+m.text()); });
  await p.goto('file://'+process.cwd()+'/final-riot.html',{waitUntil:'load'});
  await sleep(400);
  const okMenu = await p.evaluate(()=>!!window.CLASH);
  // menu -> select -> fight
  await p.keyboard.press('Enter'); await sleep(350);
  await p.keyboard.press('Enter'); await sleep(1700);

  const results={};
  // walk right, sample leg joint values over time, check stride + ground contact
  await p.keyboard.down('KeyD');
  const walkSamples = await p.evaluate(async()=>{
    const C=window.CLASH, out=[];
    for(let i=0;i<24;i++){
      const f=C.p1, j=C.walkJoint(f.anim/6.2831853);
      out.push({anim:+f.anim.toFixed(3), vx:+f.vx.toFixed(0), state:f.state,
                thigh:+j.thigh.toFixed(2), knee:+j.knee.toFixed(2), foot:+j.foot.toFixed(2)});
      await new Promise(r=>setTimeout(r,40));
    }
    return out;
  });
  await sleep(200); await p.screenshot({path:'testing/cc-walklive2.png'});
  await p.keyboard.up('KeyD');
  results.walkAnimAdvanced = walkSamples[walkSamples.length-1].anim - walkSamples[0].anim;
  results.walkStates = [...new Set(walkSamples.map(s=>s.state))];
  results.walkMovedX = await p.evaluate(()=>+window.CLASH.p1.x.toFixed(0));

  // jump
  await p.keyboard.press('KeyW'); await sleep(120);
  results.jumpOffGround = await p.evaluate(()=>window.CLASH.p1.onGround===false);

  // punch / kick / block / special — just ensure no crash and states engage
  await sleep(400);
  await p.keyboard.press('KeyJ'); await sleep(60);
  results.punchState = await p.evaluate(()=>window.CLASH.p1.state);
  await sleep(400);
  await p.keyboard.press('KeyK'); await sleep(80);
  results.kickState = await p.evaluate(()=>window.CLASH.p1.state);
  await sleep(500);
  await p.keyboard.down('KeyL'); await sleep(120);
  results.blockState = await p.evaluate(()=>window.CLASH.p1.state);
  await p.keyboard.up('KeyL');
  // special
  await p.evaluate(()=>{ window.CLASH.p1.meter=100; });
  await p.keyboard.press('KeyI'); await sleep(150);
  results.superActive = await p.evaluate(()=>window.CLASH.p1.superT>0);
  await sleep(1200);

  // let the fight actually play for a bit and check nothing errors
  await sleep(2500);
  results.errs = errs;
  results.screen = await p.evaluate(()=>window.CLASH.screen);
  results.okMenu = okMenu;
  console.log(JSON.stringify(results,null,1));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
