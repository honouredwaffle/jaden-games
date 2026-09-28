const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  p.on('console',m=>{ if(m.type()==='error') errs.push('CONSOLE: '+m.text()); });
  await p.goto('file://'+process.cwd()+'/cursed-clash.html');
  await p.waitForTimeout(600);
  const s1 = await p.evaluate(()=>window.CLASH.screen);
  await p.click('body'); await p.waitForTimeout(400);
  const s2 = await p.evaluate(()=>window.CLASH.screen);
  await p.evaluate(()=>{ window.CLASH.setSel(2); });
  await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  const s3 = await p.evaluate(()=>window.CLASH.screen);
  // play: sim 6 seconds of fighting
  await p.waitForTimeout(300);
  await p.keyboard.down('KeyD'); await p.waitForTimeout(400); await p.keyboard.up('KeyD');
  for(let i=0;i<12;i++){ await p.keyboard.press('KeyJ'); await p.waitForTimeout(120); }
  await p.waitForTimeout(1500);
  const st = await p.evaluate(()=>({s:window.CLASH.screen, hp1:window.CLASH.p1.hp|0, hp2:window.CLASH.p2.hp|0, c1:window.CLASH.p1.char.name, c2:window.CLASH.p2.char.name}));
  await p.screenshot({path:'testing/out-clash-fight.png'});
  await p.evaluate(()=>window.CLASH.goSelect()); await p.waitForTimeout(300);
  await p.screenshot({path:'testing/out-clash-select.png'});
  await p.evaluate(()=>window.CLASH.goMenu()); await p.waitForTimeout(300);
  await p.screenshot({path:'testing/out-clash-menu.png'});
  console.log(JSON.stringify({s1,s2,s3,st,errs},null,1));
  await b.close();
})();
