const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  await p.goto('file://'+process.cwd()+'/cursed-clash.html'); await p.waitForTimeout(400);
  await p.evaluate(()=>{ const C=window.CLASH; C.setCtrlMode(0); C.goSelect(); C.setSel(0); C.startFight(); C.p2.ai=false; });
  await p.waitForTimeout(1400);
  const r = await p.evaluate(()=>{
    const C=window.CLASH; C.resetInput(); const f=C.p1;
    f.cooldown=0;f.atk=null;f.hitStun=0;f.onGround=true;f.vy=0;f.hopT=0;f.rolling=false;f.tripped=false;f.getupT=0;
    // simulate: hold F, then press Space
    window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyF',bubbles:true}));
    window.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',bubbles:true}));
    const afterHop={hopT:+f.hopT.toFixed(3), onGround:f.onGround, vy:f.vy, state:f.state};
    window.dispatchEvent(new KeyboardEvent('keyup',{code:'Space',bubbles:true}));
    window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyF',bubbles:true}));
    // now: bare Space -> jump (pending)
    C.resetInput(); f.onGround=true; f.vy=0; f.hopT=0;
    window.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',bubbles:true}));
    const jumpPending=C.pending.jump;
    window.dispatchEvent(new KeyboardEvent('keyup',{code:'Space',bubbles:true}));
    return {afterHop, jumpPending, keysF:true};
  });
  console.log(JSON.stringify(r,null,1));
  await b.close();
})();
