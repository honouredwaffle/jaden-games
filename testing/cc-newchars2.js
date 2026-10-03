const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const fs=require('fs');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:1400,height:900}});
  const errs=[]; p.on('pageerror',e=>errs.push('pageerror:'+e.message));
  p.on('console',m=>{ if(m.type()==='error') errs.push('console:'+m.text()); });
  await p.goto('file://'+process.cwd()+'/final-riot.html',{waitUntil:'load'});
  await sleep(500);

  // strip of all 5 fighters, idle + walk pose
  const durl=await p.evaluate(()=>{
    const C=window.CLASH, cw=200, ch=430;
    const cv=document.createElement('canvas'); cv.width=C.CHARS.length*cw*2; cv.height=ch;
    const g=cv.getContext('2d'); g.fillStyle='#0a0714'; g.fillRect(0,0,cv.width,cv.height);
    C.CHARS.forEach((c,i)=>{
      for(const mode of ['IDLE','WALK']){
        const col=(mode==='IDLE'?0:1);
        const cx=(i*2+col)*cw+cw/2;
        g.save(); g.translate(cx,ch-40); g.scale(2.0,2.0);
        g.strokeStyle='rgba(120,255,150,.35)'; g.lineWidth=0.5; g.beginPath(); g.moveTo(-40,0); g.lineTo(40,0); g.stroke();
        C.paintFighter(g,c,{t:1,state:C.POSE[mode],anim:1.6,atk:null,hitFlash:0,superT:0,onGround:true});
        g.restore();
      }
      g.fillStyle='#fff'; g.font='bold 15px sans-serif'; g.textAlign='center';
      g.fillText(C.CHARS[i].name,(i*2+1)*cw,i*0+20);
      g.fillStyle='#8fe3ff'; g.font='11px monospace';
      g.fillText('idle',(i*2)*cw+cw/2,ch-6); g.fillText('walk',(i*2+1)*cw+cw/2,ch-6);
    });
    return cv.toDataURL('image/png');
  });
  fs.writeFileSync('testing/cc-roster5.png', Buffer.from(durl.split(',')[1],'base64'));

  // super check with proper spacing for the two new chars
  await p.keyboard.press('Enter'); await sleep(300);
  const results=[];
  for(const idx of [3,4]){
    await p.evaluate(i=>window.CLASH.setSel(i), idx); await sleep(120);
    await p.keyboard.press('Enter'); await sleep(1500);
    await sleep(600);                       // ensure no attack active
    await p.evaluate(()=>{ window.CLASH.p1.meter=100; window.CLASH.p1.atk=null; });
    await p.keyboard.press('KeyI'); await sleep(120);
    const superOn = await p.evaluate(()=>window.CLASH.p1.superT>0);
    const projCount = await p.evaluate(()=>window.CLASH.__proj?window.CLASH.__proj():undefined);
    await sleep(1300);
    results.push({idx, name:await p.evaluate(()=>window.CLASH.p1.name), superOn, screen:await p.evaluate(()=>window.CLASH.screen)});
    await p.keyboard.press('Escape'); await sleep(400);
  }
  console.log(JSON.stringify({errs, results},null,1));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
