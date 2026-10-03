const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  p.on('console',m=>{ if(m.type()==='error') errs.push('CONSOLE: '+m.text()); });
  await p.goto('file://'+process.cwd()+'/cursed-clash.html');
  await p.waitForTimeout(500);
  const readPad = ()=>p.evaluate(()=>({padHidden:document.getElementById('pad').classList.contains('hidden'), stickDisp:document.getElementById('stick').style.display, ctrl:window.CLASH.ctrl()}));
  const menu0 = await readPad();
  await p.screenshot({path:'testing/cc-ctrl-menu.png'});
  // default should be COMPUTER on this desktop (no coarse pointer)
  const def = await p.evaluate(()=>window.CLASH.ctrl());
  // start a fight in COMPUTER mode -> pad stays hidden
  await p.click('body'); await p.waitForTimeout(300);  // -> select
  await p.keyboard.press('Enter'); await p.waitForTimeout(600); // -> fight
  const fightComputer = await readPad();
  await p.screenshot({path:'testing/cc-ctrl-computer.png'});
  // toggle to MOBILE via key C
  await p.keyboard.press('KeyC'); await p.waitForTimeout(300);
  const fightMobile = await readPad();
  await p.screenshot({path:'testing/cc-ctrl-mobile.png'});
  // toggle back
  await p.keyboard.press('KeyC'); await p.waitForTimeout(300);
  const fightBack = await readPad();
  console.log(JSON.stringify({def,menu0,fightComputer,fightMobile,fightBack,errs},null,1));
  await b.close();
})();
