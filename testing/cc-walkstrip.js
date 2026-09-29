const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const fs = require('fs');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push('console:'+m.text()); });
  await p.goto('file://'+process.cwd()+'/cursed-clash.html',{waitUntil:'load'});
  await p.waitForTimeout(500);
  const errBefore = errs.slice();

  // Render a strip of the NEW walk cycle (8 phases) using the game's own paintFighter.
  const dataUrl = await p.evaluate(()=>{
    const C=window.CLASH, N=8, cw=150, ch=210;
    const cv=document.createElement('canvas'); cv.width=N*cw; cv.height=ch;
    const g=cv.getContext('2d');
    g.fillStyle='#0a0714'; g.fillRect(0,0,cv.width,cv.height);
    g.strokeStyle='rgba(255,255,255,.18)'; g.lineWidth=1;
    g.beginPath(); g.moveTo(0,ch-18); g.lineTo(cv.width,ch-18); g.stroke();
    const SU=C.CHARS.find(x=>x.id==='sukuna')||C.CHARS[0];
    for(let i=0;i<N;i++){
      g.save(); g.translate(i*cw+cw/2, ch-18);
      C.paintFighter(g,SU,{t:i,state:C.POSE.WALK,anim:i/N*6.2831853,atk:null,hitFlash:0,superT:0,onGround:true});
      g.restore();
      g.fillStyle='#6f6a90'; g.font='12px monospace'; g.textAlign='center';
      g.fillText((i/N).toFixed(2), i*cw+cw/2, ch-4);
    }
    return cv.toDataURL('image/png');
  });
  fs.writeFileSync('testing/cc-walkstrip.png', Buffer.from(dataUrl.split(',')[1],'base64'));

  // Also a live in-game walking screenshot for sanity.
  await p.evaluate(()=>window.CLASH.setSel(0));
  await p.keyboard.press('Enter'); await p.waitForTimeout(350);
  await p.keyboard.press('Enter'); await p.waitForTimeout(1500);
  await p.keyboard.down('KeyD'); await p.waitForTimeout(600);
  const st = await p.evaluate(()=>({anim:+window.CLASH.p1.anim.toFixed(2), vx:+window.CLASH.p1.vx.toFixed(0), screen:window.CLASH.screen}));
  await p.screenshot({path:'testing/cc-walklive.png'});
  await p.keyboard.up('KeyD');

  // numeric check on joint curves via exposed walkJoint
  const curves = await p.evaluate(()=>{
    const out=[]; for(let i=0;i<10;i++){ const k=window.CLASH.walkJoint(i/10);
      out.push({K:+(i/10).toFixed(1), thigh:+k.thigh.toFixed(3), knee:+k.knee.toFixed(3), foot:+k.foot.toFixed(3)}); }
    return out;
  });
  console.log(JSON.stringify({errs, st, curves},null,1));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
