const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const fs=require('fs');
const EXEC='/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await chromium.launch({executablePath:EXEC,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage({viewport:{width:1280,height:720}});
  const errs=[]; p.on('pageerror',e=>errs.push('pageerror:'+e.message));
  p.on('console',m=>{ if(m.type()==='error') errs.push('console:'+m.text()); });
  await p.goto('file://'+process.cwd()+'/final-riot.html',{waitUntil:'load'});
  await sleep(500);

  const durl=await p.evaluate(()=>{
    const C=window.CLASH;
    const CW=650, CH=360, cv=document.createElement('canvas');
    cv.width=CW*2; cv.height=CH*3;
    const g=cv.getContext('2d');
    g.fillStyle='#0a0714'; g.fillRect(0,0,cv.width,cv.height);
    const trail=(x,y,n,dx)=>{const a=[];for(let i=0;i<n;i++)a.push({x:x-i*dx,y});return a;};
    function cell(cx,cy,title,draw){
      g.save();
      g.fillStyle='rgba(255,255,255,.04)'; g.fillRect(cx,cy,CW,CH);
      g.strokeStyle='rgba(255,255,255,.12)'; g.strokeRect(cx,cy,CW,CH);
      g.fillStyle='#fff'; g.font='bold 20px sans-serif'; g.textAlign='left';
      g.fillText(title, cx+18, cy+30);
      g.save(); g.beginPath(); g.rect(cx+1,cy+38,CW-2,CH-40); g.clip();
      g.translate(cx,cy); draw(g);
      g.restore();
      g.restore();
    }
    cell(0,0,'KAMEHAMEHA', g=>{ C.setProjs([{kind:'wave',r:34,h:66,col:'#63c8ff',x:430,y:200,vx:850,vy:0,trail:trail(400,200,10,14)}]); C.drawProjectiles(g); });
    cell(CW,0,'BIG BANG ATTACK', g=>{ C.setProjs([{kind:'bigorb',r:42,col:'#8fd8ff',x:330,y:200,vx:300,vy:0,trail:trail(305,200,10,16)}]); C.drawProjectiles(g); });
    cell(0,CH,'DRAGON OF THE DARKNESS FLAME', g=>{ C.setProjs([{kind:'dragon',r:42,h:96,col:'#a24dff',x:470,y:180,vx:720,vy:0,trail:trail(420,180,12,18)}]); C.drawProjectiles(g); });
    cell(CW,CH,'PIERCING ORB', g=>{ C.setProjs([{kind:'orb',r:22,col:'#9b6bff',x:340,y:200,vx:600,vy:0,trail:trail(310,200,12,13)}]); C.drawProjectiles(g); });
    cell(0,CH*2,'SAITAMA SHOCKWAVE', g=>{ g.save(); g.translate(325,200);
      [1,0.8,0.55,0.3].forEach((k,i)=>{ g.save(); g.translate((i-1.5)*140,0); g.scale(0.5,0.5); C.drawBlast(g,{x:0,y:0,r:150,col:'#ffe14d',kind:'punch',t:0.1+i*0.1},k); g.restore(); });
      g.restore(); });
    cell(CW,CH*2,'SHISHIO FLAME', g=>{ g.save(); g.translate(330,200); [1,0.7,0.45].forEach((k,i)=>{ g.save(); g.translate((i-1)*160,0); g.scale(0.55,0.55); C.drawBlast(g,{x:0,y:0,r:150,col:'#ff5a1f',kind:'fire',t:0.1+i*0.15},k); g.restore(); }); g.restore(); });
    return cv.toDataURL('image/png');
  });
  fs.writeFileSync('testing/cc-fxboard.png', Buffer.from(durl.split(',')[1],'base64'));
  console.log(JSON.stringify({errs},null,1));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
