const { chromium } = require('playwright-core'); const fs=require('fs');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  await p.goto('file://'+process.cwd()+'/cursed-clash.html');
  await p.waitForTimeout(400);
  const dataUrl = await p.evaluate(()=>{
    const C=window.CLASH, BASE=430, VY=820, G=2100;
    const T=2*VY/G;                       // total flight time
    const fr=[0,0.10,0.25,0.40,0.50,0.60,0.75,0.90,1.0,1.03,1.10,1.45];
    const lab=['stand','launch','rise','stretch','APEX','tuck','descend','reach','land','absorb','rise','stand'];
    const CW=170, CH=250, COLS=6;
    const cv=document.createElement('canvas'); cv.width=CW*COLS; cv.height=CH*2;
    const g=cv.getContext('2d');
    const bg=g.createLinearGradient(0,0,0,CH*2); bg.addColorStop(0,'#0a1030'); bg.addColorStop(1,'#241142'); g.fillStyle=bg; g.fillRect(0,0,cv.width,cv.height);
    fr.forEach((f,i)=>{
      const cx=(i%COLS)*CW+CW/2, cy=Math.floor(i/COLS)*CH+BASE-260+250-42;
      const baseY = Math.floor(i/COLS)*CH + 210;
      // flight height (px) using the game's impulse/gravity
      let lift=0, jumpT=0, onGround=true;
      if(f<=1){ const t=f*T; lift=Math.max(0, VY*t - 0.5*G*t*t); jumpT=Math.max(0.0001, T*(1-f)); onGround=false; }
      else { jumpT=0; onGround=true; }
      // ground line
      g.strokeStyle='rgba(255,255,255,.12)'; g.beginPath(); g.moveTo((i%COLS)*CW,baseY+2); g.lineTo((i%COLS)*CW+CW,baseY+2); g.stroke();
      g.save(); g.translate(cx, baseY-lift); g.scale(1.15,1.15);
      C.paintFighter(g, C.CHARS[0], {t:1.0,anim:f*6,state:C.POSE.JUMP,atk:null,hitFlash:0,superT:0,onGround,dir:1,jumpT,jumpDur:T});
      g.restore();
      g.fillStyle='#8fe3ff'; g.font='bold 12px Trebuchet MS'; g.textAlign='center';
      g.fillText(lab[i], cx, Math.floor(i/COLS)*CH+18);
      g.fillStyle='rgba(255,255,255,.45)'; g.font='11px Trebuchet MS';
      g.fillText('t='+f, cx, Math.floor(i/COLS)*CH+32);
    });
    g.fillStyle='rgba(255,255,255,.8)'; g.font='bold 15px Trebuchet MS'; g.textAlign='left';
    g.fillText('CURSED CLASH — new staged jump (matched to the FlipaClip reference)', 14, 22);
    return cv.toDataURL('image/png');
  });
  fs.writeFileSync('testing/cc-jumpsheet.png', Buffer.from(dataUrl.split(',')[1],'base64'));
  console.log(JSON.stringify({errs}));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
