const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const fs = require('fs');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:1400,height:900}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.cwd()+'/cursed-clash.html',{waitUntil:'load'});
  await p.waitForTimeout(400);

  // Colour-coded leg-only strips: near leg = orange, far leg = blue. Big scale.
  const durl = await p.evaluate(()=>{
    const C=window.CLASH, N=8, cw=170, ch=460, SC=2.4;
    const cv=document.createElement('canvas'); cv.width=N*cw; cv.height=ch;
    const g=cv.getContext('2d');
    g.fillStyle='#0a0714'; g.fillRect(0,0,cv.width,cv.height);
    const SU=C.CHARS.find(x=>x.id==='sukuna')||C.CHARS[0];
    for(let i=0;i<N;i++){
      const K=i/N;
      const cx=i*cw+cw/2;
      g.save(); g.translate(cx, ch*0.42); g.scale(SC,SC);
      // ground line at y=0 (feet plane)
      g.restore();
      g.save(); g.translate(cx, ch*0.42); g.scale(SC,SC);
      g.strokeStyle='rgba(120,255,150,.5)'; g.lineWidth=0.6/SC*2;
      g.beginPath(); g.moveTo(-cw/2/SC,0); g.lineTo(cw/2/SC,0); g.stroke();
      // far leg (blue) then near leg (orange), drawn as a bare leg chain
      const f=C.walkJoint(K), nn=C.walkJoint(K+0.5);
      const col={}; col.far='#4f9dff'; col.near='#ff9b3d';
      for(const [j,c,lbl] of [[f,col.far,'far'],[nn,col.near,'near']]){
        const hip=lbl==='near'?8:-8;
        g.save(); g.translate(hip,-48); g.rotate(j.thigh);
        g.fillStyle=c; g.fillRect(-7.5,0,15,26);
        g.strokeStyle='#000'; g.lineWidth=1.2; g.strokeRect(-7.5,0,15,26);
        g.translate(0,26); g.rotate(j.knee);
        g.fillStyle=c; g.fillRect(-6.6,0,13.2,24);
        g.strokeStyle='#000'; g.strokeRect(-6.6,0,13.2,24);
        g.translate(0,24); g.rotate(j.foot);
        g.fillStyle='#e8e8ee'; g.fillRect(-9.5,-12.75,19,12.75);
        g.strokeStyle='#000'; g.strokeRect(-9.5,-12.75,19,12.75);
        g.restore();
      }
      g.restore();
    }
    return cv.toDataURL('image/png');
  });
  fs.writeFileSync('testing/cc-legs.png', Buffer.from(durl.split(',')[1],'base64'));
  console.log('errs', errs.length, errs.slice(0,3));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
