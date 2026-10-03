const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  await p.goto('file://'+process.cwd()+'/cursed-clash.html');
  await p.waitForTimeout(400);
  const r = await p.evaluate(()=>{
    const C=window.CLASH,p1=C.p1,p2=C.p2;
    C.goSelect(); C.setSel(0); C.startFight();
    p1.x=400; p1.y=C.GROUND_Y(); p1.dir=1;
    p2.x=470; p2.y=C.GROUND_Y(); p2.dir=-1; p2.hp=p2.maxhp; p2.invuln=0;
    p1.cooldown=0; p1.atk=null; p1.hitStun=0; p1.parryCool=0; p1.parryWindow=0;
    p1.doParry();
    const res=p1.takeHit(p2,{dmg:16,kb:200,stun:.3});
    const log=[];
    const p2before=p2.hp;
    for(let i=0;i<25;i++){ p1.update(1/60,p2); log.push({i,t:+p1.atk?.t?.toFixed(3),state:p1.state,hasHit:p1.hasHit}); if(p2.hp<p2before) break; }
    return {res, p2before, p2hp:p2.hp, dmgDealt:p2before-p2.hp, atk:p1.atk, state:p1.state, log:log.slice(0,8)};
  });
  console.log(JSON.stringify({r,errs},null,1));
  await b.close();
})();
