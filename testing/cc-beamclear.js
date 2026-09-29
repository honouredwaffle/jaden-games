const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('pageerror:'+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text());});
  await p.goto('file://'+process.cwd()+'/cursed-clash.html',{waitUntil:'load'});
  await sleep(600);
  const results={};

  async function testMode(mode){
    // mode: 'fight' | 'training'
    const out=[];
    for(let idx=0; idx<5; idx++){
      // (re)enter fresh
      await p.evaluate(m=>{ if(m==='training') window.CLASH.openTraining(); else window.CLASH.goMenu(); }, mode);
      await sleep(200);
      if(mode==='training'){ await p.evaluate(i=>window.CLASH.trainSetDummy((i+1)%5), idx); }
      else { await p.evaluate(i=>window.CLASH.setSel(i), idx); await sleep(50); await p.evaluate(()=>window.CLASH.startFight()); }
      await sleep(1600);
      // freeze, clear state, fire special
      await p.evaluate(()=>{ const C=window.CLASH; C.p2.ai=false; C.p1.atk=null; C.p1.cooldown=0; C.p1.hitStun=0; C.p1.superT=0; C.p1.state=0; C.p1.meter=100; C.p2.hp=C.p2.maxhp; });
      await sleep(60);
      await p.keyboard.press('KeyI');
      // sample until projectiles clear (max 4s)
      let peak=0, cleared=-1;
      for(let t=0;t<80;t++){
        await sleep(50);
        const n=await p.evaluate(()=>window.CLASH.projCount());
        peak=Math.max(peak,n);
        if(n>0 && cleared<0) cleared=0;
        // wait until we've seen them and then they hit 0
        if(peak>0){ const n2=await p.evaluate(()=>window.CLASH.projCount()); if(n2===0){ cleared=t*50; break; } }
      }
      const nm=await p.evaluate(()=>window.CLASH.p1.name);
      out.push({nm, peak, clearedMs:cleared});
    }
    return out;
  }

  results.fight = await testMode('fight');
  results.training = await testMode('training');
  results.errs = errs;
  console.log(JSON.stringify(results,null,1));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
