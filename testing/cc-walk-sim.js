/* Offline FK sim for cursed-clash legs — numeric verification.
   Canvas: y down. rotate(t): (x,y)->(x*cos-y*sin, x*sin+y*cos).
   Chain: hip -> rotate(thigh) -> knee -> rotate(knee) -> ankle -> rotate(foot) -> shoe. */
const THIGH=26, SHIN=24, LEGW=15, HIP_Y=-48;
const rot=(x,y,a)=>{const c=Math.cos(a),s=Math.sin(a);return [x*c-y*s,x*s+y*c];};
function leg(thigh,knee,foot){
  const kneeP=rot(0,THIGH,thigh);
  const a2=thigh+knee;
  const tip=rot(0,SHIN,a2);
  const ankle=[kneeP[0]+tip[0],kneeP[1]+tip[1]];
  const a3=a2+foot, w=LEGW;
  const corners=[[-w/2-2,-w*0.85],[w/2+2,-w*0.85],[w/2+2,0],[-w/2-2,0]]
    .map(([px,py])=>{const r=rot(px,py,a3);return [ankle[0]+r[0],ankle[1]+r[1]];});
  return {kneeX:kneeP[0],kneeY:kneeP[1],ankleX:ankle[0],ankleY:ankle[1],
          bottom:Math.max(...corners.map(c=>c[1])),
          footX:corners.reduce((s,c)=>s+c[0],0)/4};
}
function C(K,keys){ K=((K%1)+1)%1; const e=t=>t*t*(3-2*t);
  for(let i=0;i<keys.length-1;i++){const[k0,v0]=keys[i],[k1,v1]=keys[i+1];
    if(K>=k0&&K<=k1){const t=(K-k0)/(k1-k0||1);return v0+(v1-v0)*e(t);}} return keys[keys.length-1][1];}
const HIP=[[0,.46],[.12,.26],[.25,.05],[.40,-.22],[.50,-.40],[.62,-.24],[.75,.12],[.88,.40],[1,.46]];
const KNEE=[[0,.16],[.12,.28],[.25,.20],[.40,.16],[.50,.40],[.62,.95],[.72,1.28],[.82,.82],[.92,.32],[1,.16]];
const ANK=[[0,-.10],[.12,.05],[.25,.00],[.40,.10],[.50,.45],[.62,.30],[.72,.05],[.82,-.05],[.92,-.12],[1,-.10]];
function J(K){ const hf=C(K,HIP), kf=C(K,KNEE), an=C(K,ANK); return {thigh:-hf,knee:+kf,foot:an,hf,kf}; }

console.log('phase  legA(hf,knee,footX,bottom)   legB(...)   feet sep  knee-behind?');
let maxSep=0, minBot=1e9, maxBot=-1e9, badKnee=0;
for(let i=0;i<=20;i++){
  const K=i/20;
  const A=J(K), B=J(K+.5);
  const la=leg(A.thigh,A.knee,A.foot), lb=leg(B.thigh,B.knee,B.foot);
  const sep=Math.abs(la.footX-lb.footX); maxSep=Math.max(maxSep,sep);
  minBot=Math.min(minBot,la.bottom,lb.bottom); maxBot=Math.max(maxBot,la.bottom,lb.bottom);
  // during swing (kf>0.5) the ankle must sit BEHIND the knee (ankleX<kneeX) => knee bends backward
  for(const [L,JJ] of [[la,A],[lb,B]]){ if(JJ.kf>0.5 && !(L.ankleX<L.kneeX-1)) badKnee++; }
  if(i%2===0) console.log(` ${K.toFixed(2)}  A(${A.hf.toFixed(2)},${(A.kf*57.3).toFixed(0)}deg, fx=${la.footX.toFixed(1)}, b=${la.bottom.toFixed(1)})  B(${B.hf.toFixed(2)},${(B.kf*57.3).toFixed(0)}deg, fx=${lb.footX.toFixed(1)}, b=${lb.bottom.toFixed(1)})  sep=${sep.toFixed(1)}`);
}
console.log(`\nMAX stride (foot x separation) : ${maxSep.toFixed(1)} px`);
console.log(`foot-bottom range rel hip      : ${minBot.toFixed(1)} .. ${maxBot.toFixed(1)}  (plant should be ~stable)`);
console.log(`knee-direction violations      : ${badKnee}  (0 = all swing knees bend backward)`);
