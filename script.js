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

  // Scroll reveals: Neoconda-inspired motion behaviour, applied to LUNGTA's own layout.
  const revealEls = document.querySelectorAll('.reveal-block,.reveal-line,.reveal-media');
  if(reduced){ revealEls.forEach(el => el.classList.add('in-view')); }
  else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => { if(entry.isIntersecting) entry.target.classList.add('in-view'); });
    }, { threshold:.16, rootMargin:'0px 0px -6% 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  // Header hide/reveal on direction.
  const header = document.getElementById('siteHeader');
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if(y > 140 && y > lastY + 8) header.classList.add('hidden');
    else if(y < lastY - 6 || y < 100) header.classList.remove('hidden');
    lastY = y;
  }, { passive:true });

  // Hero continuity: the same LUNGTA hero physically travels into the next section.
  // Neoconda is used only as the motion reference; the visual remains entirely LUNGTA.
  const heroSequence = document.getElementById('heroSequence');
  const heroMediaWrap = document.getElementById('heroMediaWrap');
  const heroMedia = document.getElementById('heroMedia');
  const heroCopy = document.getElementById('heroCopy');
  const heroCorner = document.getElementById('heroCorner');
  const heroVignette = document.getElementById('heroVignette');
  const natureMedia = document.getElementById('natureMedia');
  const identityFrame = document.getElementById('identityFrame');
  const clamp = (n,min=0,max=1) => Math.min(max,Math.max(min,n));
  const mix = (a,b,t) => a + (b-a)*t;
  const ease = t => 1 - Math.pow(1-clamp(t),3);
  let ticking = false;
  const updateScrollMotion = () => {
    ticking = false;
    if(reduced) return;
    const y = window.scrollY;
    const vh = window.innerHeight;
    if(heroMediaWrap && heroSequence){
      const seqTop = heroSequence.getBoundingClientRect().top + y;
      const localY = y - seqTop;
      // Hold the hero first, then carry it through the section boundary.
      const raw = (localY - vh * .52) / (vh * .88);
      const p = ease(raw);
      const mobile = window.innerWidth <= 640;
      const topEnd = mobile ? 16 : 14;
      const sideEnd = mobile ? 5 : 6;
      const bottomEnd = mobile ? 30 : 22;
      heroMediaWrap.style.setProperty('--hero-top', `${mix(0,topEnd,p)}vh`);
      heroMediaWrap.style.setProperty('--hero-right', `${mix(0,sideEnd,p)}vw`);
      heroMediaWrap.style.setProperty('--hero-bottom', `${mix(0,bottomEnd,p)}vh`);
      heroMediaWrap.style.setProperty('--hero-left', `${mix(0,sideEnd,p)}vw`);
      heroMediaWrap.style.setProperty('--hero-radius', `${mix(0,mobile ? 3 : 5,p)}px`);
      heroMediaWrap.style.setProperty('--hero-sheen', `${clamp((p-.45)/.55) * .22}`);
      heroMediaWrap.style.filter = `drop-shadow(0 ${mix(0,34,p)}px ${mix(0,70,p)}px rgba(0,0,0,${mix(0,.2,p)}))`;
      heroMedia.style.setProperty('--hero-img-scale', `${mix(mobile ? 1.08 : 1.04, mobile ? 1.18 : 1.09,p)}`);
      heroMedia.style.setProperty('--hero-img-y', `${mix(0,mobile ? -1.8 : -1.2,p)}vh`);
      if(heroVignette) heroVignette.style.setProperty('--hero-vignette', `${1 - clamp(raw*1.5)}`);
      const textP = ease((localY - vh*.30)/(vh*.48));
      if(heroCopy){heroCopy.style.opacity = `${1-textP}`;heroCopy.style.transform = `translate3d(0,${-textP*42}px,0)`;}
      if(heroCorner){heroCorner.style.opacity = `${1-textP}`;heroCorner.style.transform = `translate3d(0,${textP*18}px,0)`;}
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

  // Pointer-responsive Wind object.
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

  // Wind Horse inertia/tilt.
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

  // Product image perspective follows pointer without changing LUNGTA visual design.
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

  // Magnetic interaction.
  document.querySelectorAll('.magnetic').forEach(el => {
    if(reduced) return;
    el.addEventListener('pointermove', e => {
      const r=el.getBoundingClientRect();
      const x=e.clientX-(r.left+r.width/2), y=e.clientY-(r.top+r.height/2);
      el.style.transform=`translate(${x*.13}px,${y*.13}px)`;
    });
    el.addEventListener('pointerleave',()=>{ el.style.transform='translate(0,0)'; });
  });

  // Custom cursor.
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

  // Mobile menu.
  const menuToggle=document.getElementById('menuToggle');
  const mobileMenu=document.getElementById('mobileMenu');
  const setMenu=open=>{
    menuToggle.classList.toggle('open',open);mobileMenu.classList.toggle('open',open);menuToggle.setAttribute('aria-expanded',String(open));mobileMenu.setAttribute('aria-hidden',String(!open));document.body.classList.toggle('no-scroll',open);
  };
  menuToggle?.addEventListener('click',()=>setMenu(!mobileMenu.classList.contains('open')));
  mobileMenu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
})();
