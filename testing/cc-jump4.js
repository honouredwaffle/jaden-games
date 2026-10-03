const { chromium } = require('playwright-core'); const fs=require('fs');
(async()=>{
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p=await b.newPage({viewport:{width:1400,height:760}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.cwd()+'/cursed-clash.html'); await p.waitForTimeout(400);
  const url=await p.evaluate(()=>{
    const C=window.CLASH, VY=820,G=2100,T=2*VY/G, GY=560;
    const CW=340, CH=720;
    const poses=[
      ['LAUNCH jk=0',  VY*0.0, false, T],
      ['TUCK jk=0.5',  VY*(T/2)-0.5*G*(T/2)*(T/2), false, T*0.5],
      ['REACH jk=0.75',VY*(0.75*T)-0.5*G*(0.75*T)**2, false, T*0.25],
      ['LAND jk=1.0',  0, true, 0.0001],
    ];
    const cv=document.createElement('canvas'); cv.width=CW*poses.length; cv.height=CH;
    const g=cv.getContext('2d');
    const bg=g.createLinearGradient(0,0,0,CH); bg.addColorStop(0,'#0a1030'); bg.addColorStop(1,'#241142'); g.fillStyle=bg; g.fillRect(0,0,cv.width,cv.height);
    poses.forEach((P,i)=>{
      const cx=i*CW+CW/2, lift=P[1];
      g.strokeStyle='rgba(255,255,255,.28)'; g.lineWidth=2; g.beginPath(); g.moveTo(i*CW,GY); g.lineTo(i*CW+CW,GY); g.stroke();
      g.save(); g.translate(cx, GY-lift); g.scale(2.3,2.3);
      C.paintFighter(g, C.CHARS[0], {t:1,anim:0,state:C.POSE.JUMP,atk:null,hitFlash:0,superT:0,onGround:P[2],dir:1,jumpT:P[3],jumpDur:T});
      g.restore();
      g.fillStyle='#ffd166'; g.font='bold 16px Trebuchet MS'; g.textAlign='center'; g.fillText(P[0], cx, 26);
    });
    return cv.toDataURL('image/png');
  });
  fs.writeFileSync('testing/cc-jump4.png', Buffer.from(url.split(',')[1],'base64'));
  console.log(JSON.stringify({errs}));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
