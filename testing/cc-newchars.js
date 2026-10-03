const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('pageerror:'+e.message));
  p.on('console',m=>{ if(m.type()==='error') errs.push('console:'+m.text()); });
  await p.goto('file://'+process.cwd()+'/final-riot.html',{waitUntil:'load'});
  await sleep(500);
  const roster = await p.evaluate(()=>window.CLASH.CHARS.map(c=>c.id+'/'+c.name+'/'+c.hair+'/'+c.ability.type));
  await p.keyboard.press('Enter'); await sleep(400);
  await p.screenshot({path:'testing/cc-select5.png'});

  // select Hiei (index 3) and fight; then Shishio (index 4)
  const results=[];
  for(const idx of [3,4]){
    await p.evaluate(i=>{ window.CLASH.setSel(i); }, idx);
    await sleep(150);
    await p.screenshot({path:`testing/cc-select-${idx}.png`});
    await p.keyboard.press('Enter'); await sleep(1600);
    const nm = await p.evaluate(()=>window.CLASH.p1.name);
    // drive a bit: walk, punch, kick, special (force meter)
    await p.keyboard.down('KeyD'); await sleep(400); await p.keyboard.up('KeyD');
    await p.keyboard.press('KeyJ'); await sleep(200);
    await p.keyboard.press('KeyK'); await sleep(250);
    await p.evaluate(()=>{ window.CLASH.p1.meter=100; });
    await p.keyboard.press('KeyI'); await sleep(120);
    const superOn = await p.evaluate(()=>window.CLASH.p1.superT>0);
    await sleep(1400);
    await p.screenshot({path:`testing/cc-fight-${idx}.png`});
    results.push({idx, nm, superOn, screen:await p.evaluate(()=>window.CLASH.screen)});
    // back to select
    await p.keyboard.press('Escape'); await sleep(400);
  }
  console.log(JSON.stringify({errs, roster, results},null,1));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
