const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('pageerror:'+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text());});
  await p.goto('file://'+process.cwd()+'/final-riot.html',{waitUntil:'load'});
  await sleep(600);
  const R={};
  // Goku (wave) in training
  await p.evaluate(()=>{ window.CLASH.setSel(0); window.CLASH.openTraining(); });
  await sleep(300);
  R.p1=await p.evaluate(()=>window.CLASH.p1.name);
  await p.evaluate(()=>{ const C=window.CLASH; C.p1.meter=100; C.p1.atk=null; C.p1.cooldown=0; C.p1.superT=0; C.p1.state=0; });
  await sleep(80);
  await p.keyboard.press('KeyI');
  let peak=0, timeline=[];
  for(let t=0;t<50;t++){ await sleep(60); const n=await p.evaluate(()=>window.CLASH.projCount()); peak=Math.max(peak,n); timeline.push(n); }
  R.peak=peak; R.final=timeline[timeline.length-1]; R.sawZeroAgain = peak>0 && timeline[timeline.length-1]===0;
  R.timeline=timeline;
  // Hiei (dragon/wave) too
  await p.evaluate(()=>{ window.CLASH.trainSetDummy(1); window.CLASH.p2.applyChar(window.CLASH.CHARS[1]); });
  await p.evaluate(()=>{ const C=window.CLASH; C.p1.applyChar(C.CHARS[3]); C.p1.meter=100; C.p1.atk=null; C.p1.cooldown=0; C.p1.superT=0; C.p1.state=0; });
  await sleep(80);
  await p.keyboard.press('KeyI');
  let peak2=0, tl2=[];
  for(let t=0;t<50;t++){ await sleep(60); const n=await p.evaluate(()=>window.CLASH.projCount()); peak2=Math.max(peak2,n); tl2.push(n); }
  R.hieiPeak=peak2; R.hieiFinal=tl2[tl2.length-1]; R.hieiCleared=peak2>0 && tl2[tl2.length-1]===0;
  R.errs=errs;
  console.log(JSON.stringify(R));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
