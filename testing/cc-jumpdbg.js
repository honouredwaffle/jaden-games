// Large side-by-side: known-good HOP + CROUCH vs the new jump sampled at key time-fractions.
// Uses the REAL paintFighter path (no overrides) so it reflects shipping behaviour.
const { chromium } = require('playwright-core'); const fs=require('fs');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  await p.goto('file://'+process.cwd()+'/cursed-clash.html');
  await p.waitForTimeout(400);
  const dataUrl = await p.evaluate(()=>{
    const C=window.CLASH, GY=340, VY=820, G=2100, T=2*VY/G;
    const CW=230, CH=400;
    const cells=[
      ['HOP (known good)', ()=>C.paintFighter(G,X=>{},0)], // placeholder replaced below
    ];
    // build list: [label, stateObj] OR special
    const list=[
      ['HOP known', {state:C.POSE.HOP, onGround:false}],
      ['CROUCH known', {state:C.POSE.CROUCH, onGround:true}],
      ['jump jk=0.00', {state:C.POSE.JUMP, jumpT:T, jumpDur:T, onGround:false}],
      ['jump jk=0.25', {state:C.POSE.JUMP, jumpT:T*0.75, jumpDur:T, onGround:false}],
      ['jump jk=0.50', {state:C.POSE.JUMP, jumpT:T*0.50, jumpDur:T, onGround:false}],
      ['jump jk=0.75', {state:C.POSE.JUMP, jumpT:T*0.25, jumpDur:T, onGround:false}],
      ['jump jk=1.00', {state:C.POSE.JUMP, jumpT:0.0001, jumpDur:T, onGround:false}],
      ['land(grounded)', {state:C.POSE.JUMP, jumpT:0, jumpDur:T, onGround:true}],
    ];
    const cv=document.createElement('canvas'); cv.width=CW*list.length; cv.height=CH;
    const g=cv.getContext('2d');
    const bg=g.createLinearGradient(0,0,0,CH); bg.addColorStop(0,'#0a1030'); bg.addColorStop(1,'#241142'); g.fillStyle=bg; g.fillRect(0,0,cv.width,cv.height);
    list.forEach((it,i)=>{
      const cx=i*CW+CW/2;
      g.strokeStyle='rgba(255,255,255,.18)'; g.beginPath(); g.moveTo(i*CW,GY); g.lineTo(i*CW+CW,GY); g.stroke();
      g.save(); g.translate(cx,GY); g.scale(1.55,1.55);
      C.paintFighter(g, C.CHARS[0], Object.assign({t:1,anim:0,atk:null,hitFlash:0,superT:0,dir:1}, it[1]));
      g.restore();
      g.fillStyle='#8fe3ff'; g.font='bold 13px Trebuchet MS'; g.textAlign='center';
      g.fillText(it[0], cx, 20);
    });
    return cv.toDataURL('image/png');
  });
  fs.writeFileSync('testing/cc-jumpdbg.png', Buffer.from(dataUrl.split(',')[1],'base64'));
  console.log(JSON.stringify({errs}));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
