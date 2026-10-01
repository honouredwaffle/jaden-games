// Verify per-character BLOCK guard pose (forearm in front of the FACE) + block/punch VFX wiring.
const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const fs=require('fs');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('pageerror:'+e.message));
  p.on('console',m=>{ if(m.type()==='error') errs.push('console:'+m.text()); });
  await p.goto('file://'+process.cwd()+'/cursed-clash.html',{waitUntil:'load'});
  await sleep(400);

  const res = await p.evaluate(()=>{
    const C=window.CLASH;
    // FK mirror of drawArm3d (rotate upAng, len upLen; rotate elbAng, len foreLen; fist at foreLen+handR)
    function fist(shX,shY,upAng,elbAng,upLen,foreLen,handR){
      const R=(th,L)=>[-L*Math.sin(th), L*Math.cos(th)];
      const e=R(upAng,upLen), elb=[shX+e[0],shY+e[1]];
      const f=R(upAng+elbAng, foreLen+handR*0.55);
      return {elb, fist:[elb[0]+f[0], elb[1]+f[1]]};
    }
    const out=[];
    for(const c of C.CHARS){
      const st=C.styleConfig(c);
      const cfg=st.block;
      const r=fist(15,-86, cfg.f[0],cfg.f[1], st.upLen+2, st.foreLen+2, 7);
      // head center (1,-110) r15, eyes y ~ -115..-118, face front x ~ 10..16
      const inFrontOfFace = (r.fist[1] <= -112 && r.fist[1] >= -134) && (r.fist[0] >= 6 && r.fist[0] <= 30);
      out.push({name:c.name, style:c.style, guardCol:cfg.guardCol, guardKind:cfg.guardKind, punchFx:cfg.punchFx,
        elbow:r.elb.map(v=>+v.toFixed(1)), fist:r.fist.map(v=>+v.toFixed(1)), inFrontOfFace});
    }
    // render a board: each char blocking + each char punch-hit
    const CW=300, CH=300, cols=5, cv=document.createElement('canvas');
    cv.width=CW*cols; cv.height=CH*2; const g=cv.getContext('2d');
    g.fillStyle='#0a0714'; g.fillRect(0,0,cv.width,cv.height);
    function cell(cx,cy,title,draw){ g.save(); g.fillStyle='rgba(255,255,255,.04)'; g.fillRect(cx,cy,CW,CH);
      g.strokeStyle='rgba(255,255,255,.12)'; g.strokeRect(cx,cy,CW,CH);
      g.fillStyle='#fff'; g.font='bold 16px sans-serif'; g.fillText(title,cx+12,cy+24);
      g.save(); g.beginPath(); g.rect(cx,cy+28,CW,CH-28); g.clip(); g.translate(cx+CW/2, cy+CH*0.82); draw(g); g.restore(); g.restore(); }
    C.CHARS.forEach((c,i)=>{
      // BLOCK (holding)
      cell(i*CW,0,c.name+' BLOCK', gg=>{ gg.scale(1.6,1.6); C.paintFighter(gg,c,C.mkFighter(c,{state:C.POSE.BLOCK,t:1.2})); });
      // punch hit frame
      const atk={t:0,startup:0.06,active:0.10,recover:0.12,reach:70,kind:'punch',yoff:0};
      atk.t=0.10;
      cell(i*CW,CH,c.name+' PUNCH', gg=>{ gg.scale(1.6,1.6); C.paintFighter(gg,c,C.mkFighter(c,{state:C.POSE.PUNCH,t:1.2,atk})); });
    });
    const durl=cv.toDataURL('image/png');
    // VFX spot-checks
    const fxChecks={
      guardFn: typeof C.guardFx==='function',
      drawGuardBurst: typeof C.drawGuardBurst==='function',
      perCharGuardCols: [...new Set(out.map(o=>o.guardCol))].length,
      perCharPunchFx: [...new Set(out.map(o=>o.punchFx))].length,
    };
    return {out, fxChecks, png:durl};
  });
  fs.writeFileSync('testing/cc-guard.png', Buffer.from(res.png.split(',')[1],'base64'));
  const allFace = res.out.every(o=>o.inFrontOfFace);
  console.log(JSON.stringify({cells:res.out, fxChecks:res.fxChecks, allGuardInFrontOfFace:allFace, errs},null,1));
  await b.close();
  if(errs.length||!allFace) process.exit(2);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
