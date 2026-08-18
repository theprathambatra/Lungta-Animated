(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const isTouch = matchMedia('(pointer:coarse)').matches;

  // Preloader
  const preloader=$('#preloader'), pct=$('#loaderPercent'), bar=$('#loaderBar');
  let load=0;
  const timer=setInterval(()=>{
    load += Math.max(1, Math.ceil((100-load)*.12));
    load=clamp(load,0,100); pct.textContent=String(load).padStart(2,'0'); bar.style.width=load+'%';
    if(load>=100){clearInterval(timer); setTimeout(()=>{preloader.classList.add('done'); document.body.classList.add('loaded')},260)}
  },70);

  // Clock in nav
  const clock=$('#clock');
  const tick=()=>{const d=new Date(); clock.textContent=[d.getHours(),d.getMinutes(),d.getSeconds()].map(v=>String(v).padStart(2,'0')).join(':')};
  tick(); setInterval(tick,1000);

  // Cursor + magnetic interaction
  const dot=$('#cursorDot'), ring=$('#cursorRing'); let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
  if(!isTouch){
    addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`});
    const cursorLoop=()=>{rx=lerp(rx,mx,.15);ry=lerp(ry,my,.15);ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;requestAnimationFrame(cursorLoop)};cursorLoop();
    $$('a,button,input,.feature-column article').forEach(el=>{el.addEventListener('mouseenter',()=>ring.classList.add('hover'));el.addEventListener('mouseleave',()=>ring.classList.remove('hover'))});
    $$('.magnetic').forEach(el=>{el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();const x=(e.clientX-r.left-r.width/2)*.16,y=(e.clientY-r.top-r.height/2)*.16;el.style.transform=`translate(${x}px,${y}px)`});el.addEventListener('mouseleave',()=>el.style.transform='')});
  }

  // Mobile menu
  const menuToggle=$('#menuToggle'), mobileMenu=$('#mobileMenu');
  const setMenu=open=>{menuToggle.classList.toggle('open',open);mobileMenu.classList.toggle('open',open);menuToggle.setAttribute('aria-expanded',String(open));mobileMenu.setAttribute('aria-hidden',String(!open));document.body.classList.toggle('no-scroll',open)};
  menuToggle.addEventListener('click',()=>setMenu(!mobileMenu.classList.contains('open')));
  $$('#mobileMenu a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));

  // Particle / vector field
  const canvas=$('#field'), ctx=canvas.getContext('2d'); let particles=[]; let dpr=1;
  function resizeField(){dpr=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(dpr,0,0,dpr,0,0);const count=innerWidth<700?32:76;particles=Array.from({length:count},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.18,vy:(Math.random()-.5)*.18,r:Math.random()*1.2+.2,a:Math.random()*.35+.08}))}
  function drawField(){ctx.clearRect(0,0,innerWidth,innerHeight);for(let p of particles){const dx=mx-p.x,dy=my-p.y,dist=Math.hypot(dx,dy);if(dist<240&&!isTouch){p.vx-=dx/dist*.003;p.vy-=dy/dist*.003}p.vx*=.995;p.vy*=.995;p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=innerWidth;if(p.x>innerWidth)p.x=0;if(p.y<0)p.y=innerHeight;if(p.y>innerHeight)p.y=0;ctx.beginPath();ctx.fillStyle=`rgba(240,240,236,${p.a})`;ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}requestAnimationFrame(drawField)}
  resizeField();drawField();addEventListener('resize',resizeField);

  // Hero product 3D parallax
  const shell=$('#productShell'), stage=$('#productStage'), hero=$('#home');
  if(!isTouch){hero.addEventListener('mousemove',e=>{const nx=(e.clientX/innerWidth-.5),ny=(e.clientY/innerHeight-.5);shell.style.transform=`rotateY(${nx*14}deg) rotateX(${-ny*11}deg) translateZ(8px)`}) ;hero.addEventListener('mouseleave',()=>shell.style.transform='')}

  // Scroll choreography
  let lastY=scrollY, targetY=scrollY, currentY=scrollY;
  const nav=$('#nav');
  addEventListener('scroll',()=>{targetY=scrollY;nav.classList.toggle('hidden',scrollY>lastY+8&&scrollY>160);if(scrollY<lastY-8)nav.classList.remove('hidden');lastY=scrollY},{passive:true});
  const sections=$$('[data-section]'), navAnchors=$$('.nav-links a');
  const featureModel=$('#featureModel'), featureArticles=$$('.feature-column article');
  function animateScroll(){
    currentY=lerp(currentY,targetY,.09);
    const hv=hero.getBoundingClientRect();
    const p=clamp((-hv.top)/(innerHeight*.95),0,1);
    const s=1-p*.34, y=p*innerHeight*.62, x=p*(innerWidth<900?0:innerWidth*.23);
    stage.style.transform=`translate(calc(-50% + ${x}px),calc(-50% + ${y}px)) scale(${s})`;
    stage.style.opacity=1-clamp((p-.72)/.25,0,1);
    $('.hero-word').style.transform=`translate(-50%,-50%) translateX(${-p*9}vw) scale(${1+p*.15})`;
    $('.hero-orbit').style.transform=`translate(-50%,-50%) rotate(${p*70}deg) scale(${1-p*.2})`;

    const fc=$('#featureConsole').getBoundingClientRect();
    if(fc.top<innerHeight&&fc.bottom>0){const fp=clamp((innerHeight*.7-fc.top)/(fc.height*.8),0,1);featureModel.style.transform=`translateY(${(fp-.5)*18}px) rotate(${(fp-.5)*-1.5}deg)`;const idx=Math.min(7,Math.floor(fp*8));featureArticles.forEach((a,i)=>a.classList.toggle('active',i===idx));}

    sections.forEach(sec=>{const r=sec.getBoundingClientRect();if(r.top<innerHeight*.5&&r.bottom>innerHeight*.5){const id=sec.id;navAnchors.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+id || (id==='precision'||id==='specs')&&a.getAttribute('href')==='#system'))}});
    requestAnimationFrame(animateScroll)
  }animateScroll();

  // Feature model reacts to hover
  featureArticles.forEach((a,i)=>a.addEventListener('mouseenter',()=>{const f=$('.feature-model-frame');const angle=(i%2?1:-1)*(2+(i%4));f.style.transform=`perspective(800px) rotateY(${angle}deg) rotateX(${(i-3.5)*.7}deg) scale(1.015)`;$('.feature-readout b').textContent=String(i+1).padStart(2,'0')}));
  $('#featureConsole').addEventListener('mouseleave',()=>{$('.feature-model-frame').style.transform='';$('.feature-readout b').textContent='01'});

  // Waitlist local success state
  const form=$('#waitlistForm'), msg=$('#formMessage');
  form.addEventListener('submit',e=>{e.preventDefault();const email=$('#email').value.trim();if(!email)return;msg.textContent='YOU’RE ON THE DROP 01 LIST.';form.querySelector('input').value='';form.querySelector('button').textContent='✓';setTimeout(()=>form.querySelector('button').textContent='↗',2600)});

  // Smooth anchor offsets
  $$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href');if(id==='#')return;const el=$(id);if(!el)return;e.preventDefault();el.scrollIntoView({behavior:'smooth',block:'start'})}));
})();
