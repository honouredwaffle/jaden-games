const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('pageerror:'+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text());});
  await p.goto('file://'+process.cwd()+'/cursed-clash.html',{waitUntil:'load'});
  await sleep(600);
  const R={};
  // enter training by CLICKING the menu TRAINING button (not keyboard)
  const tb=await p.evaluate(()=>{ const w=Math.min(1280*0.30,250), h=Math.min(720*0.075,50); return {x:640-w/2,y:720*0.755,w,h}; });
  await p.mouse.click(tb.x+tb.w/2, tb.y+tb.h/2); await sleep(500);
  R.enteredByClick=await p.evaluate(()=>window.CLASH.screen);
  // now CLICK the TRAINING MENU button (drawn via canvas)
  const mb=await p.evaluate(()=>{ const w=Math.min(1280*0.28,230), h=Math.min(720*0.07,46); return {x:1280-w-14,y:720*0.155,w,h}; });
  await p.mouse.click(mb.x+mb.w/2, mb.y+mb.h/2); await sleep(300);
  R.menuOpenByClick=await p.evaluate(()=>window.CLASH.train.menu);
  await p.screenshot({path:'testing/tr-5-clickmenu.png'});
  // click a dummy tile inside the menu then a control
  const menu=await p.evaluate(()=>{
    const w=Math.min(1280*0.66,540), h=Math.min(720*0.74,480), x=1280/2-w/2, y=720/2-h/2;
    const n=5, ts=Math.min(w*0.13,66), gap=ts*0.24, tot=n*ts+(n-1)*gap, sx=1280/2-tot/2, ty=y+96;
    return {sx,ty,ts,tot};
  });
  // click 4th tile (index 3)
  const tx=menu.sx+3*(menu.ts+menu.ts*0.24)+menu.ts/2;
  await p.mouse.click(tx, menu.ty+menu.ts/2); await sleep(250);
  R.dummyAfterClick=await p.evaluate(()=>window.CLASH.train.dummy);
  await p.screenshot({path:'testing/tr-6-picked.png'});
  // click CLOSE (bottom of stack). Recompute: bw=w*0.8, bh=min(720*0.072,46), bx=W/2-bw/2; byy starts ty+ts+48; 4 items
  const close=await p.evaluate(()=>{
    const w=Math.min(1280*0.66,540), h=Math.min(720*0.74,480), x=1280/2-w/2, y=720/2-h/2;
    const n=5, ts=Math.min(w*0.13,66), gap=ts*0.24, tot=n*ts+(n-1)*gap, ty=y+96;
    const bw=w*0.8, bh=Math.min(720*0.072,46), bx=1280/2-bw/2; let byy=ty+ts+48;
    byy += 3*(bh+9); // 4th button = CLOSE
    return {cx:bx+bw/2, cy:byy+bh/2};
  });
  await p.mouse.click(close.cx, close.cy); await sleep(250);
  R.menuClosedByClick=await p.evaluate(()=>window.CLASH.train.menu);
  R.errs=errs;
  console.log(JSON.stringify(R,null,1));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
