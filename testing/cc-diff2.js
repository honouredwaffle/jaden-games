const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  await p.goto('file://'+process.cwd()+'/cursed-clash.html');
  await p.waitForTimeout(400);
  const out = await p.evaluate(()=>{
    const C=window.CLASH, res=[];
    for(let d=0;d<3;d++){
      C.setDiffIndex(d); C.goSelect(); C.setSel(0); C.startFight();
      C.p1.x=400; C.p1.dir=1; C.p2.x=470; C.p2.dir=-1; C.p1.invuln=0; C.p1.hp=C.p1.maxhp;
      C.p2.cooldown=0; C.p2.parryWindow=0; C.p2.atk=null; C.p2.hitStun=0;
      const dmul=C.p2.dmul;
      const before=C.p1.hp;
      C.p2.doAttack('punch');
      for(let i=0;i<10;i++) C.p2.update(1/60,C.p1);
      res.push({d, diff:C.diff.name, aiDmul:dmul, dmgToPlayer:before-C.p1.hp});
    }
    return res;
  });
  console.log(JSON.stringify({out,errs},null,1));
  await b.close();
})();
