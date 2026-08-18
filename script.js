(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const preloader = document.getElementById('preloader');
  const loaderPercent = document.getElementById('loaderPercent');
  const loaderBar = document.getElementById('loaderBar');
  document.body.classList.add('no-scroll');

  let load = 0;
  const finishLoad = () => {
    load = 100;
    loaderPercent.textContent = '100';
    loaderBar.style.width = '100%';
    setTimeout(() => {
      preloader.classList.add('done');
      document.body.classList.remove('no-scroll');
    }, reduced ? 30 : 280);
  };
  const tick = setInterval(() => {
    load = Math.min(96, load + Math.max(1, Math.round((100 - load) * .08)));
    loaderPercent.textContent = String(load).padStart(2, '0');
    loaderBar.style.width = load + '%';
  }, 55);
  window.addEventListener('load', () => { clearInterval(tick); finishLoad(); }, { once:true });
  setTimeout(() => { if(load < 100){ clearInterval(tick); finishLoad(); } }, 2300);

  const revealEls = document.querySelectorAll('.reveal-block,.reveal-line,.reveal-media');
  if(reduced){ revealEls.forEach(el => el.classList.add('in-view')); }
  else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => { if(entry.isIntersecting) entry.target.classList.add('in-view'); });
    }, { threshold:.16, rootMargin:'0px 0px -6% 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  const header = document.getElementById('siteHeader');
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if(y > 140 && y > lastY + 8) header.classList.add('hidden');
    else if(y < lastY - 6 || y < 100) header.classList.remove('hidden');
    lastY = y;
  }, { passive:true });

  const heroMediaWrap = document.getElementById('heroMediaWrap');
  const heroMedia = document.getElementById('heroMedia');
  const natureMedia = document.getElementById('natureMedia');
  const identityFrame = document.getElementById('identityFrame');
  let ticking = false;
  const updateScrollMotion = () => {
    ticking = false;
    if(reduced) return;
    const y = window.scrollY;
    const vh = window.innerHeight;
    if(heroMediaWrap){
      const p = Math.min(1, y / vh);
      heroMediaWrap.style.transform = `translate3d(0,${p * 7}vh,0)`;
      heroMedia.style.transform = `scale(${1.04 + p * .08})`;
    }
    if(natureMedia){
      const r = natureMedia.parentElement.getBoundingClientRect();
      const p = Math.max(-1, Math.min(1, (vh/2 - (r.top + r.height/2))/vh));
      natureMedia.style.transform = `translate3d(0,${p * 6}vh,0)`;
    }
    if(identityFrame){
      const r = identityFrame.getBoundingClientRect();
      const p = Math.max(-1, Math.min(1, (vh/2 - (r.top + r.height/2))/vh));
      const img = identityFrame.querySelector('img');
      if(img) img.style.transform = `translate3d(0,${p * 22}px,0) scale(1.06)`;
    }
  };
  window.addEventListener('scroll', () => {
    if(!ticking){ ticking = true; requestAnimationFrame(updateScrollMotion); }
  }, { passive:true });
  updateScrollMotion();

  const wind = document.getElementById('windVisual');
  if(wind && !reduced){
    wind.addEventListener('pointermove', e => {
      const r = wind.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - .5;
      const ny = (e.clientY - r.top) / r.height - .5;
      wind.style.setProperty('--wind-x', `${nx * 22}px`);
      wind.style.setProperty('--wind-y', `${ny * 15}px`);
      wind.style.setProperty('--wind-r', `${nx * 1.7}deg`);
      wind.style.setProperty('--wind-s', '1.025');
    });
    wind.addEventListener('pointerleave', () => {
      wind.style.setProperty('--wind-x','0px');wind.style.setProperty('--wind-y','0px');wind.style.setProperty('--wind-r','0deg');wind.style.setProperty('--wind-s','1');
    });
  }

  const horse = document.getElementById('horseStage');
  if(horse && !reduced){
    let tx=0,ty=0,cx=0,cy=0,inside=false;
    const animateHorse = () => {
      cx += (tx-cx)*.08; cy += (ty-cy)*.08;
      horse.style.setProperty('--horse-x', `${cx*30}px`);
      horse.style.setProperty('--horse-y', `${cy*20}px`);
      horse.style.setProperty('--horse-r', `${cx*2.2}deg`);
      horse.style.setProperty('--horse-s', inside ? '1.025' : '1');
      requestAnimationFrame(animateHorse);
    };
    horse.addEventListener('pointerenter',()=>inside=true);
    horse.addEventListener('pointermove',e=>{const r=horse.getBoundingClientRect();tx=(e.clientX-r.left)/r.width-.5;ty=(e.clientY-r.top)/r.height-.5;});
    horse.addEventListener('pointerleave',()=>{inside=false;tx=0;ty=0;});
    animateHorse();
  }

  const product = document.getElementById('productTilt');
  if(product && !reduced){
    product.addEventListener('pointermove', e => {
      const r = product.getBoundingClientRect();
      const x = (e.clientX-r.left)/r.width-.5;
      const y = (e.clientY-r.top)/r.height-.5;
      product.style.transform = `perspective(1200px) rotateY(${x*3.2}deg) rotateX(${-y*2.2}deg)`;
    });
    product.addEventListener('pointerleave',()=> product.style.transform='perspective(1200px) rotateY(0deg) rotateX(0deg)');
  }

  document.querySelectorAll('.magnetic').forEach(el => {
    if(reduced) return;
    el.addEventListener('pointermove', e => {
      const r=el.getBoundingClientRect();
      const x=e.clientX-(r.left+r.width/2), y=e.clientY-(r.top+r.height/2);
      el.style.transform=`translate(${x*.13}px,${y*.13}px)`;
    });
    el.addEventListener('pointerleave',()=>{ el.style.transform='translate(0,0)'; });
  });

  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if(dot && ring && !reduced && window.matchMedia('(pointer:fine)').matches){
    let mx=-100,my=-100,rx=-100,ry=-100;
    window.addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;dot.style.left=mx+'px';dot.style.top=my+'px';});
    const loop=()=>{rx+=(mx-rx)*.16;ry+=(my-ry)*.16;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(loop)};loop();
    document.querySelectorAll('a,button,.wind-visual,.horse-stage,.product-image').forEach(el=>{
      el.addEventListener('pointerenter',()=>ring.classList.add('hover'));
      el.addEventListener('pointerleave',()=>ring.classList.remove('hover'));
    });
  }

  const menuToggle=document.getElementById('menuToggle');
  const mobileMenu=document.getElementById('mobileMenu');
  const setMenu=open=>{
    menuToggle.classList.toggle('open',open);mobileMenu.classList.toggle('open',open);menuToggle.setAttribute('aria-expanded',String(open));mobileMenu.setAttribute('aria-hidden',String(!open));document.body.classList.toggle('no-scroll',open);
  };
  menuToggle?.addEventListener('click',()=>setMenu(!mobileMenu.classList.contains('open')));
  mobileMenu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
})();
