/* Original artwork is drawn unchanged. Only three overlays are composited:
   feathered smoke wisps, fitted crest sweeps, and a glyph-masked VS pulse. */
const CONFIG={duration:10,width:1054,height:1492,smokeOpacity:.85,wispOpacity:.23,sweepOpacity:.20,sweepWidth:.075,vsGlow:.24,
 left:{cx:.245,cy:.2705,rx:.184,ry:.131},
 right:[[.771,.106],[.785,.119],[.786,.129],[.815,.133],[.841,.144],[.855,.154],[.867,.169],[.880,.171],[.881,.182],[.869,.190],[.877,.199],[.864,.205],[.851,.207],[.835,.220],[.868,.225],[.910,.227],[.910,.304],[.899,.343],[.880,.375],[.851,.402],[.816,.422],[.773,.440],[.729,.424],[.690,.402],[.659,.374],[.638,.341],[.627,.304],[.625,.228],[.666,.225],[.702,.217],[.693,.209],[.674,.206],[.662,.193],[.662,.177],[.678,.172],[.685,.157],[.706,.143],[.735,.133],[.756,.129],[.756,.117]],
 text:[[.30,.037,.40,.047],[.025,.44,.46,.093],[.60,.44,.34,.093],[.23,.58,.54,.187]]};
const canvas=document.querySelector('#flyer'),ctx=canvas.getContext('2d');
let source=null,wispTexture,vsMask,leftMask,rightMask,smokeMask,smokeLayer,shineLayer,seconds=0,playing=true,last=null;
const TAU=Math.PI*2,W=CONFIG.width,H=CONFIG.height;
function surface(){const c=document.createElement('canvas');c.width=W;c.height=H;return c}
function masks(){
 leftMask=surface();let x=leftMask.getContext('2d');x.fillStyle='#fff';x.beginPath();const a=CONFIG.left;x.ellipse(a.cx*W,a.cy*H,a.rx*W,a.ry*H,0,0,TAU);x.fill();
 rightMask=surface();x=rightMask.getContext('2d');x.fillStyle='#fff';x.beginPath();CONFIG.right.forEach(([a,b],i)=>x[i?'lineTo':'moveTo'](a*W,b*H));x.closePath();x.fill();
 smokeMask=surface();x=smokeMask.getContext('2d');const d=x.createImageData(W,H);
 for(let y=Math.floor(.79*H);y<Math.ceil(.919*H);y++)for(let xx=Math.floor(.09*W);xx<Math.ceil(.92*W);xx++){
  const nx=xx/W,ny=y/H;
  // Feathered smoke banks correspond to the smoke already printed in the art.
  const bank=Math.max(Math.exp(-(((nx-.30)/.145)**2+((ny-.871)/.033)**2)*2),Math.exp(-(((nx-.72)/.145)**2+((ny-.876)/.032)**2)*2));
  const ballDistance=((nx-.502)/.110)**2+((ny-.879)/.076)**2;
  const ballKeep=Math.max(0,Math.min(1,(ballDistance-1.04)*8));
  d.data[(y*W+xx)*4+3]=Math.round(255*bank*ballKeep*CONFIG.smokeOpacity);
 }x.putImageData(d,0,0);smokeLayer=surface();shineLayer=surface();
 const pixelMask=(bounds,predicate)=>{const c=surface(),cx=c.getContext('2d');cx.drawImage(source,0,0);const d=cx.getImageData(0,0,W,H);for(let y=0;y<H;y++)for(let xx=0;xx<W;xx++){const i=(y*W+xx)*4;const inside=xx/W>bounds[0]&&xx/W<bounds[2]&&y/H>bounds[1]&&y/H<bounds[3];d.data[i+3]=inside&&predicate(d.data[i],d.data[i+1],d.data[i+2])?220:0;d.data[i]=255;d.data[i+1]=235;d.data[i+2]=180}cx.putImageData(d,0,0);return c};
 vsMask=pixelMask([.446,.273,.559,.423],(r,g,b)=>r>130&&g>90&&r>b*1.15);
 wispTexture=document.createElement('canvas');wispTexture.width=320;wispTexture.height=140;
 const wx=wispTexture.getContext('2d');
 // Fixed, reproducible cloud texture with overlapping feathered wisps.
 for(let i=0;i<22;i++){const xx=30+i*12,yy=66+18*Math.sin(i*.63),r=23+7*Math.sin(i*1.7);const g=wx.createRadialGradient(xx,yy,0,xx,yy,r);g.addColorStop(0,'rgba(239,197,117,.22)');g.addColorStop(.45,'rgba(229,185,107,.10)');g.addColorStop(1,'rgba(229,185,107,0)');wx.fillStyle=g;wx.fillRect(xx-r,yy-r,r*2,r*2);}

}
function smoke(p){const s=smokeLayer.getContext('2d');s.setTransform(1,0,0,1,0,0);s.globalCompositeOperation='source-over';s.clearRect(0,0,W,H);
 // Add translucent wisps; never distort or displace the original photograph.
 for(let i=0;i<10;i++){const q=(p/TAU+i*.38196601125)%1,side=i%2?-1:1;
 const x=(side<0?.29:.72)+side*.025*q+.008*Math.sin(TAU*q+i),y=.910-.075*q;
 s.globalAlpha=CONFIG.wispOpacity*Math.sin(Math.PI*q)**2;
 s.drawImage(wispTexture,(x-.14)*W,(y-.03)*H,.28*W,.06*H);
 }s.globalAlpha=1;s.globalCompositeOperation='destination-in';s.drawImage(smokeMask,0,0);s.globalCompositeOperation='source-over';ctx.drawImage(smokeLayer,0,0);
}
function sweep(t,delay,mask,color,box,duration=2,strength=CONFIG.sweepOpacity){const q=((t-delay)%10+10)%10;
 if(q>duration)return;const u=q/duration,alpha=strength*Math.sin(Math.PI*u)**2;
 const s=shineLayer.getContext('2d');s.setTransform(1,0,0,1,0,0);s.globalCompositeOperation='source-over';s.clearRect(0,0,W,H);
 const [x0,y0,x1,y1]=box,position=(x0+y0-.2)+(x1+y1-x0-y0+.4)*u;
 // A band whose center traverses upper left -> lower right.
 const width=CONFIG.sweepWidth,gr=s.createLinearGradient((position-width)*W/2,(position-width)*H/2,(position+width)*W/2,(position+width)*H/2);
 gr.addColorStop(0,`rgba(${color},0)`);gr.addColorStop(.5,`rgba(${color},${alpha})`);gr.addColorStop(1,`rgba(${color},0)`);s.fillStyle=gr;s.fillRect(0,0,W,H);s.globalCompositeOperation='destination-in';s.drawImage(mask,0,0);s.globalCompositeOperation='source-over';ctx.drawImage(shineLayer,0,0);
}
function render(t=0){if(!source)return;ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.drawImage(source,0,0,W,H);const u=((t%10)+10)%10;
 smoke(TAU*u/10);
 sweep(u,.8,leftMask,'255,255,255',[.061,.139,.429,.402]);
 sweep(u,3,rightMask,'255,220,142',[.625,.106,.910,.440]);
 if(u>=5.3&&u<=7.3){ctx.globalAlpha=CONFIG.vsGlow*Math.sin(Math.PI*(u-5.3)/2)**2;ctx.drawImage(vsMask,0,0);ctx.globalAlpha=1;}
}
async function load(url){const img=new Image();img.src=url;await img.decode();if(img.width!==W||img.height!==H)throw Error('Esta versão usa a arte de estádio original: 1054 × 1492.');source=img;canvas.width=W;canvas.height=H;masks();document.querySelector('#empty').hidden=true;document.querySelector('#status').textContent='Arte original carregada · sequência cinematográfica · câmera fixa · 10 segundos';render(seconds)}
document.querySelector('#image').onchange=async e=>{const f=e.target.files[0];if(!f)return;const url=URL.createObjectURL(f);try{await load(url)}catch(e){document.querySelector('#status').textContent=e.message}finally{URL.revokeObjectURL(url)}};
document.querySelector('#play').onclick=()=>playing=true;document.querySelector('#pause').onclick=()=>playing=false;document.querySelector('#restart').onclick=()=>{seconds=0;render(0);document.querySelector('#time').textContent='0.00 / 10s';document.querySelector('#seek').value=0};document.querySelector('#seek').oninput=e=>{playing=false;seconds=+e.target.value;render(seconds)};
function tick(now){if(last!==null&&playing)seconds=(seconds+(now-last)/1000)%10;last=now;render(seconds);document.querySelector('#time').textContent=`${seconds.toFixed(2)} / 10s`;document.querySelector('#seek').value=seconds;requestAnimationFrame(tick)}
window.motionFlyer={render,load,config:CONFIG,pause:()=>playing=false,get ready(){return !!source}};
load(new URL('../assets/stadium.png',document.currentScript.src).href).catch(()=>document.querySelector('#status').textContent='Selecione a arte original do estádio.');requestAnimationFrame(tick);
