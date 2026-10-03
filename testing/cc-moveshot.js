const { chromium } = require('playwright-core'); const fs=require('fs');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  await p.goto('file://'+process.cwd()+'/final-riot.html');
  await p.waitForTimeout(500);
  // move sheet
  const dataUrl = await p.evaluate(()=>{
    const C=window.CLASH; const cv=document.createElement('canvas'); cv.width=1260; cv.height=330; const g=cv.getContext('2d');
    const bg=g.createLinearGradient(0,0,0,330); bg.addColorStop(0,'#0a1030'); bg.addColorStop(1,'#241142'); g.fillStyle=bg; g.fillRect(0,0,1260,330);
    g.strokeStyle='rgba(255,110,200,.4)'; g.lineWidth=2; g.beginPath(); g.moveTo(0,300); g.lineTo(1260,300); g.stroke();
    const defs=[['PUNCH',C.POSE.PUNCH,'punch'],['KICK',C.POSE.KICK,'kick'],['UPPER',C.POSE.UPPER,'upper'],['SWEEP',C.POSE.SWEEP,'sweep'],['DASH',C.POSE.DASH,'dash'],['SLAM',C.POSE.SLAM,'slam']];
    defs.forEach((d,i)=>{ const x=105+i*190, y=300;
      g.save(); g.translate(x,y); g.scale(1.45,1.45);
      const M=C.MOVES[d[2]];
      const atk={kind:d[2],startup:M.startup,active:M.active,recover:M.recover,dmg:M.dmg,kb:M.kb,stun:M.stun,reach:M.reach,yoff:M.yoff,award:M.award,launch:M.launch,knockdown:M.knockdown,heavy:M.heavy,t:M.startup+M.active*0.55};
      C.paintFighter(g, C.CHARS[0], {t:1.0,anim:0,state:d[1],atk,hitFlash:0,superT:0,onGround:true,dir:1});
      g.restore();
      g.fillStyle='#ffd166'; g.font='bold 15px Trebuchet MS'; g.textAlign='center'; g.fillText(d[0], x, y+26);
    });
    g.fillStyle='rgba(255,255,255,.6)'; g.font='bold 14px Trebuchet MS'; g.textAlign='center'; g.fillText('CURSED CLASH — MOVELIST', 630, 26);
    return cv.toDataURL('image/png');
  });
  fs.writeFileSync('testing/cc-movelist.png', Buffer.from(dataUrl.split(',')[1],'base64'));

  // mobile layout
  await p.evaluate(()=>{ const C=window.CLASH; C.setCtrlMode(1); C.goSelect(); C.setSel(0); C.setArenaOverride(0); C.startFight(); C.p2.ai=false; C.p1.x=340; C.p2.x=820; });
  await p.waitForTimeout(1400);
  await p.screenshot({path:'testing/cc-mobile-moves.png'});
  // menu with controls selector (computer)
  await p.evaluate(()=>{ window.CLASH.setCtrlMode(1); window.CLASH.goMenu(); });
  await p.waitForTimeout(300); await p.screenshot({path:'testing/cc-menu-ctrl.png'});
  console.log(JSON.stringify({errs}));
  await b.close();
})();
