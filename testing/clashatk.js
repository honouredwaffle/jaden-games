const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.cwd()+'/final-riot.html');
  await p.waitForTimeout(400);
  await p.evaluate(()=>window.CLASH.setSel(0));
  await p.keyboard.press('Enter'); await p.waitForTimeout(250);
  await p.keyboard.press('Enter'); await p.waitForTimeout(1400);

  // freeze the sim and pose the fighter mid-attack for a screenshot
  const shoot = async (kind, frac, file)=>{
    await p.evaluate(([kind,frac])=>{
      const F=window.CLASH.p1;
      F.x=W*0.40; F.y=GROUND_Y(); F.dir=1; F.vx=0; F.vy=0; F.cooldown=0; F.hitStun=0;
      F.superT=0; F.atk=null;
      F.doAttack(kind);
      F.atk.t = F.atk.startup + F.atk.active*frac;
    },[kind,frac]);
    await p.waitForTimeout(40);
    await p.screenshot({path:'testing/'+file});
  };
  await shoot('punch',0.5,'cc-punch.png');
  await shoot('kick',0.5,'cc-kick.png');

  // verify arm extends: sample furthest non-bg pixel to the right of the torso mid-punch
  const reach = await p.evaluate(()=>{
    const F=window.CLASH.p1; F.x=W*0.40; F.y=GROUND_Y(); F.dir=1; F.cooldown=0; F.atk=null;
    ctx.clearRect(0,0,W,H); ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
    function farthest(kind){
      F.atk=null; F.cooldown=0; F.doAttack(kind); F.atk.t=F.atk.startup+F.atk.active*0.5;
      ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
      ctx.save(); ctx.translate(F.x,F.y); ctx.scale(F.dir,1);
      paintFighter(ctx,F.char,F); ctx.restore();
      let far=F.x, col=null;
      for(let x=Math.round(F.x); x<W; x++){
        const d=ctx.getImageData(x, Math.round(F.y-78),1,1).data;
        if(d[0]+d[1]+d[2]>60){ far=x; }
      }
      return far-F.x;
    }
    // idle baseline
    const idle=()=>{ F.atk=null; F.state=0; ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
      ctx.save(); ctx.translate(F.x,F.y); ctx.scale(1,1); paintFighter(ctx,F.char,F); ctx.restore();
      let far=F.x; for(let x=Math.round(F.x);x<W;x++){ const d=ctx.getImageData(x,Math.round(F.y-78),1,1).data; if(d[0]+d[1]+d[2]>60) far=x; } return far-F.x; };
    return {idle:idle(), punch:farthest('punch'), kick:farthest('kick')};
  });
  console.log('reach:', JSON.stringify(reach));
  console.log('errs:', JSON.stringify(errs));
  await b.close();
})();
