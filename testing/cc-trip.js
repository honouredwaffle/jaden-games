// Cursed Clash — sweep trip + getup, trip vulnerability, hop, roll/dodge, AI dodging
const { chromium } = require('playwright-core');
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  p.on('console',m=>{ if(m.type()==='error') errs.push('CONSOLE: '+m.text()); });
  await p.goto('file://'+process.cwd()+'/final-riot.html');
  await p.waitForTimeout(400);

  const out = await p.evaluate(()=>{
    const C=window.CLASH, R={};
    const sweepAtk=()=>({kind:'sweep',dmg:9,kb:150,stun:.44,reach:92,yoff:8,award:12,bypass:true});
    const slamAtk =()=>({kind:'slam', dmg:18,kb:470,stun:.50,reach:80,yoff:-70,award:20,guardBreak:true});
    const punchAtk=()=>({kind:'punch',dmg:6, kb:130,stun:.22,reach:66,yoff:-70,award:8});
    function fresh(){ C.goSelect(); C.setSel(0); C.startFight(); const p1=C.p1,p2=C.p2; p1.ai=false; p2.ai=false;
      p1.x=400; p2.x=470; p1.dir=1; p2.dir=-1; p1.cooldown=0; p1.atk=null; p1.hitStun=0;
      p2.hp=p2.maxhp; p2.blockMeter=0; p2.staggerT=0; p2.tripped=false; p2.getupT=0; p2.rolling=false; p2.hopT=0;
      p1.tripped=false; p1.getupT=0; p1.rolling=false; p1.hopT=0; p1.onGround=true; return {p1,p2}; }

    // 1. sweep on a blocking foe -> TRIP (not a stagger), full dmg, guard to max
    { const {p1,p2}=fresh(); p2.state=C.POSE.BLOCK; p2.onGround=true;
      const before=p2.hp; const res=p2.takeHit(p1, sweepAtk());
      R.sweepTrip={ res, tripped:p2.tripped, tripT:+p2.tripT.toFixed(2), hpDrop:before-p2.hp, meter:+p2.blockMeter.toFixed(0), state:p2.state, isTrip:p2.state===C.POSE.TRIP };
    }
    // 2. slam on a blocking foe -> GUARD BREAK stagger (unchanged)
    { const {p1,p2}=fresh(); p2.state=C.POSE.BLOCK; p2.onGround=true;
      const res=p2.takeHit(p1, slamAtk());
      R.slamBreak={ res, stagger:+p2.staggerT.toFixed(2), isStagger:p2.state===C.POSE.STAGGER };
    }
    // 3. sword clean hit on a non-blocking foe also trips
    { const {p1,p2}=fresh(); const res=p2.takeHit(p1, sweepAtk());
      R.sweepClean={ res, tripped:p2.tripped }; }

    // 4. VULNERABILITY: downed (tripped) takes 1.3x
    { const {p1,p2}=fresh(); p2.tripped=true; p2.tripT=1.0; p2.state=C.POSE.TRIP;
      const before=p2.hp, dmg=punchAtk().dmg; const res=p2.takeHit(p1, punchAtk());
      R.vuln={ res, raw:dmg, dealt:before-p2.hp, expected:Math.round(dmg*1.3) }; }
    // 4b. same hit on standing foe = base dmg
    { const {p1,p2}=fresh(); const before=p2.hp; p2.takeHit(p1, punchAtk()); R.vulnBase={ dealt:before-p2.hp }; }

    // 5. GETUP: tripped auto-stands after ~1.3s trip + ~1.1s getup
    { const {p1,p2}=fresh(); p2.trip(1.3);
      let sawGetup=false; for(let i=0;i<200;i++){ p2.update(1/60,p1); if(!p2.tripped && p2.getupT>0) sawGetup=true;
        if(!p2.tripped && p2.getupT===0) break; }
      R.getup={ trippedEnded:!p2.tripped, sawGetupState:sawGetup, finalState:p2.state, isIdle:p2.state===C.POSE.IDLE }; }

    // 6. HOP (F+Space) dodges a sweep
    { const {p1,p2}=fresh(); const ok=p1.tryHop(); p1.update(1/60,p2);
      const res=p1.takeHit(p2, sweepAtk());
      R.hopDodge={ hopped:ok, hopT:+p1.hopT.toFixed(2), airborne:!p1.onGround, res, dodged:res==='dodge' }; }
    // 6b. hop does NOT dodge a normal punch
    { const {p1,p2}=fresh(); p1.tryHop(); p1.update(1/60,p2); const res=p1.takeHit(p2, punchAtk());
      R.hopVsPunch={ res, dodged:res==='dodge' }; }

    // 7. ROLL (Space+dir) dodges a normal punch (i-frames), and a slam
    { const {p1,p2}=fresh(); const ok=p1.tryRoll(1); p1.update(1/60,p2);
      const res=p1.takeHit(p2, punchAtk());
      R.rollDodge={ rolled:ok, moving:p1.rolling, res, dodged:res==='dodge' }; }
    { const {p1,p2}=fresh(); p1.tryRoll(-1); p1.update(1/60,p2); const res=p1.takeHit(p2, slamAtk());
      R.rollVsSlam={ res, dodged:res==='dodge' }; }
    // 7b. roll i-frames expire (late hit lands)
    { const {p1,p2}=fresh(); p1.tryRoll(1); for(let i=0;i<20;i++) p1.update(1/60,p2);   // ~0.33s in, past the 0.30 i-frame
      const res=p1.takeHit(p2, punchAtk()); R.rollNoIframe={ rollT:+p1.rollT.toFixed(2), res, hit:res==='hit' }; }

    return R;
  });

  // AI dodging: does the AI hop/roll when it reads a sweep/slam?
  const ai = await p.evaluate(()=>{
    const C=window.CLASH; C.setDiffIndex(2); C.goSelect(); C.setSel(0); C.startFight();
    const p1=C.p1,p2=C.p2; let hops=0, rolls=0;
    for(let i=0;i<3000;i++){
      p1.update(1/60,p2); p2.update(1/60,p1);
      if(p2.hopT>0.5) hops++;
      if(p2.rolling && p2.rollT>0.40) rolls++;
      if(Math.abs(p2.x-p1.x)>300){ p2.x=p1.x+80; }
      if(!p2.atk && !p2.rolling && p2.hopT<=0 && Math.random()<0.03 && p1.cooldown<=0){ p1.doAttack(Math.random()<0.5?'sweep':'slam'); }
    }
    return {aiHops:hops, aiRolls:rolls};
  });

  // deterministic: force the AI to resolve a hop / roll reaction
  const aiForced = await p.evaluate(()=>{
    const C=window.CLASH, R={};
    C.goSelect(); C.setSel(0); C.startFight(); const q=C.p2, f=C.p1; q.ai=true; f.ai=false; f.x=1200; q.x=200; f.atk=null;
    q.onGround=true; q.atk=null; q.rolling=false; q.hopT=0;
    q.aiReaction='hop'; q.aiReactT=0.0001; q.update(1/60,f); R.aiHopForced=q.hopT>0;
    q.hopT=0; q.onGround=true; q.rolling=false; q.aiReaction='roll'; q.aiReactT=0.0001; q.update(1/60,f); R.aiRollForced=q.rolling||q.rollT>0;
    R.aiDodgeField = C.DIFFS.map(d=>d.dodge);
    return R;
  });

  console.log(JSON.stringify({out, ai, aiForced, errs}, null, 1));
  await b.close();
})();
