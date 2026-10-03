const { chromium } = require('playwright-core'); const fs=require('fs');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  await p.goto('file://'+process.cwd()+'/cursed-clash.html');
  await p.waitForTimeout(400);
  const dataUrl = await p.evaluate(()=>{
    const C=window.CLASH, G_y=330;
    const cv=document.createElement('canvas'); cv.width=1360; cv.height=460; const g=cv.getContext('2d');
    const bg=g.createLinearGradient(0,0,0,460); bg.addColorStop(0,'#0a1030'); bg.addColorStop(1,'#241142'); g.fillStyle=bg; g.fillRect(0,0,1360,460);
    g.strokeStyle='rgba(255,110,200,.35)'; g.lineWidth=2; g.beginPath(); g.moveTo(0,G_y); g.lineTo(1360,G_y); g.stroke();
    const GT=C.GETUP_TIME;
    const poses=[
      ['TRIP',   {state:C.POSE.TRIP,   rot:-1.42, gy:G_y}],
      ['GETUP 1',{state:C.POSE.GETUP,  rot:-1.42*0.72, getupT:GT*0.72, gy:G_y}],
      ['GETUP 2',{state:C.POSE.GETUP,  rot:-1.42*0.30, getupT:GT*0.30, gy:G_y}],
      ['HOP',    {state:C.POSE.HOP,    rot:0, gy:G_y-46, onGround:false}],
      ['ROLL 1', {state:C.POSE.ROLL,   rot:0.25*6.283, spinPivot:true, gy:G_y}],
      ['ROLL 2', {state:C.POSE.ROLL,   rot:0.55*6.283, spinPivot:true, gy:G_y}],
      ['STAGGER',{state:C.POSE.STAGGER,rot:0, gy:G_y}],
      ['CROUCH', {state:C.POSE.CROUCH, rot:0, gy:G_y}],
    ];
    poses.forEach((P,i)=>{
      const x=90+i*165, y=P[1].gy;
      g.save(); g.translate(x,y);
      if(P[1].spinPivot){ const prog=P[1].rot/(2*Math.PI); const lift=24*Math.abs(Math.sin(prog*Math.PI)); g.translate(0,-lift); g.translate(0,-54); g.rotate(P[1].rot); g.scale(0.88,0.88); g.translate(0,54); }
      else if(P[1].rot) g.rotate(P[1].rot);
      g.scale(1.25,1.25);
      C.paintFighter(g, C.CHARS[0], {t:1.0,anim:0,state:P[1].state,atk:null,hitFlash:0,superT:0,onGround:P[1].onGround!==false,dir:1,getupT:P[1].getupT||0});
      g.restore();
      g.fillStyle='#ffd166'; g.font='bold 14px Trebuchet MS'; g.textAlign='center'; g.fillText(P[0],x,G_y+100);
    });
    g.fillStyle='rgba(255,255,255,.65)'; g.font='bold 14px Trebuchet MS'; g.textAlign='center'; g.fillText('CURSED CLASH — new ground/dodge poses', 680, 24);
    return cv.toDataURL('image/png');
  });
  fs.writeFileSync('testing/cc-poses.png', Buffer.from(dataUrl.split(',')[1],'base64'));
  console.log(JSON.stringify({errs}));
  await b.close();
})();
