(function(){
  var CURRENT = document.body.getAttribute('data-page') || 'accueil';
  var URLS = {"accueil": "/", "expertise": "/expertise/", "offres": "/offres/", "suivi": "/suivi/", "equipe": "/equipe/", "labo": "/labo/", "questions": "/questions/", "mentions": "/mentions-legales/", "confidentialite": "/confidentialite/"};
  // anciens liens du site une-page (reflektweb.com/#offres) -> nouvelle adresse
  var h = (location.hash || '').replace('#','');
  if (CURRENT === 'accueil' && URLS[h] && h !== 'accueil') { location.replace(URLS[h]); return; }
  window.addEventListener('hashchange', function(){ var k = location.hash.replace('#',''); if (URLS[k] && k !== 'accueil' && k !== CURRENT) location.href = URLS[k]; });

  var menuBtn = document.getElementById('menuBtn'), navLinks = document.getElementById('navLinks');
  function closeMenu(){ navLinks.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false'); }
  menuBtn.addEventListener('click', function(){ var open = navLinks.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); });
  navLinks.addEventListener('click', function(e){ if (e.target.closest('a')) closeMenu(); });

  // Liens vers une section de la même page : défilement doux
  document.addEventListener('click', function(e){
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var el = document.getElementById(a.getAttribute('href').slice(1)); if (!el) return;
    e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); history.replaceState(null, '', a.getAttribute('href'));
  });

  // Offre choisie : pré-remplit le formulaire et garde la trace du clic pour le cockpit
  var OFFERS = {
    essentiel: {label: 'Site Essentiel', price: '990 € HT', need: 'Créer mon site'},
    signature: {label: 'Site Signature', price: 'sur devis', need: 'Créer mon site'},
    technique: {label: 'Suivi Technique', price: '30 €/mois en annuel ou 39 € HT/mois'},
    pilotage: {label: 'Suivi Pilotage', price: '75 €/mois en annuel ou 89 € HT/mois'},
    croissance: {label: 'Suivi Croissance', price: '150 €/mois en annuel ou 179 € HT/mois'},
    diagnostic: {label: 'Diagnostic gratuit de visibilité', price: 'gratuit', need: 'Diagnostic gratuit de ma visibilité', force: true,
      note: 'Vous demandez un <b>diagnostic gratuit de votre visibilité</b> : nous comparons votre présence sur Google à celle de vos concurrents, sans engagement.',
      placeholder: 'Votre métier, votre ville et l\u2019adresse de votre site si vous en avez un.'}
  };
  var PAGE_NAMES = {accueil: "l'accueil", expertise: 'la page Expertise', offres: 'la page Offres', suivi: 'la page Suivi', equipe: "la page L'équipe", labo: 'la page Labo', questions: 'la page Questions'};
  function pickOffer(key, page){
    var o = OFFERS[key]; if (!o) return;
    var sel = document.getElementById('offerSelect'); if (!sel) return;
    sel.value = key;
    document.getElementById('offerClicked').value = key;
    document.getElementById('offerClickedPage').value = page;
    document.getElementById('offerSource').value = 'clic-offre';
    var need = document.querySelector('#contactForm select[name="need"]');
    if (o.need && need && (o.force || !need.value)) need.value = o.need;
    var msg = document.querySelector('#contactForm textarea[name="message"]');
    if (msg && o.placeholder) msg.placeholder = o.placeholder;
    var note = document.getElementById('offerPicked');
    note.innerHTML = o.note || ('Vous avez choisi l\u2019offre <b>' + o.label + '</b> (' + o.price + ') sur ' + (PAGE_NAMES[page] || 'le site') + '. Vous pouvez la modifier ci-dessous.');
    note.hidden = false;
    sel.classList.remove('just-filled'); void sel.offsetWidth; sel.classList.add('just-filled');
  }
  var qs = new URLSearchParams(location.search);
  if (qs.get('offre')) {
    pickOffer(qs.get('offre'), qs.get('depuis') || 'accueil');
    history.replaceState(null, '', '/' + location.hash);
    var c = document.getElementById('contact'); if (c) setTimeout(function(){ c.scrollIntoView({block:'start'}); }, 60);
  }
  document.addEventListener('change', function(e){
    if (!e.target || e.target.id !== 'offerSelect') return;
    var clicked = document.getElementById('offerClicked').value, v = e.target.value;
    document.getElementById('offerSource').value = !v ? 'aucune' : (v === clicked ? 'clic-offre' : 'formulaire');
    e.target.classList.remove('just-filled');
  });

  // Compteurs animés
  (function(){
    var hours = document.getElementById('metricHours'), contactNum = document.getElementById('metricContact');
    if (!hours) return;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function run(el, target, suffix){
      if (!el) return;
      if (reduced) { el.textContent = target + suffix; return; }
      var start = performance.now(), duration = 1200;
      function tick(now){ var p = Math.min((now-start)/duration, 1), e = 1 - Math.pow(1-p, 3); el.textContent = Math.round(target*e) + suffix; if (p < 1) requestAnimationFrame(tick); }
      requestAnimationFrame(tick);
    }
    run(hours, 24, '/7'); run(contactNum, 1, '');
  })();

  // Formulaire de contact -> robot Formulaires Reflekt (Google Apps Script)
  var form = document.getElementById('contactForm');
  if (form) {
    var FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxekLYPBZtFZ1lI03m9l45K2-Qr-VQzuf0XVnGCCzuv5eSt0GgyUZZDmJb9rUB29zpV0w/exec';
    var SITE_ID = 'reflektweb.com';
    var formLoadedAt = Date.now();
    var formError = document.getElementById('formError');
    function showFormError(msg){ formError.textContent = msg; formError.hidden = false; }
    form.addEventListener('submit', function(e){
      e.preventDefault();
      formError.hidden = true;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var btn = form.querySelector('button[type="submit"]');
      var fallback = "L'envoi n'a pas abouti. Écrivez-nous directement à bonjour@reflektweb.com ou appelez le 06 95 24 23 98.";
      if (FORM_ENDPOINT.indexOf('https://') !== 0) { showFormError(fallback); return; }
      var fd = new FormData(form);
      var o = OFFERS[fd.get('offer')];
      if (o) fd.set('offer', o.label + ' (' + o.price + ')');
      var data = new URLSearchParams(fd);
      data.append('site', SITE_ID);
      data.append('t', String(formLoadedAt));
      btn.disabled = true; var label = btn.innerHTML; btn.innerHTML = 'Envoi en cours…';
      fetch(FORM_ENDPOINT, { method: 'POST', body: data })
        .then(function(r){ return r.json(); })
        .then(function(res){
          if (!res || !res.ok) {
            btn.disabled = false; btn.innerHTML = label;
            showFormError(res && res.code === 'email_invalide' ? "Votre adresse e-mail semble incorrecte. Pouvez-vous la vérifier ?" : fallback);
            return;
          }
          document.getElementById('contactFormWrap').innerHTML = '<div class="success"><span>&#10003;</span><h3>Merci, votre message est parti.</h3><p>' + (o ? 'Votre demande concerne l’offre <b>' + o.label + '</b>. ' : '') + 'Nous revenons vers vous rapidement avec un regard concret sur votre projet.</p><button id="resetForm">Envoyer une autre demande</button></div>';
        })
        .catch(function(){ btn.disabled = false; btn.innerHTML = label; showFormError(fallback); });
    });
    document.getElementById('contactFormWrap').addEventListener('click', function(e){ if (e.target && e.target.id === 'resetForm') location.reload(); });
  }
})();


/* ===== Le Labo : la 3D (three.js) n'est chargée que lorsque la page Labo est ouverte ===== */
(function(){
  var THREE_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var loading = false, ready = false, started = false, active = false;
  var scenes = [];

  function loadThree(cb){
    if (window.THREE) { cb(); return; }
    if (loading) return;
    loading = true;
    var s = document.createElement('script');
    s.src = THREE_SRC; s.async = true;
    s.onload = cb;
    s.onerror = function(){ fallback('labHeroVisual', true); };
    document.head.appendChild(s);
  }

  function fallback(id, light){
    var el = document.getElementById(id); if (!el) return;
    var c = el.querySelector('canvas'); if (c) c.remove();
    if (el.querySelector('.lab-fallback')) return;
    var d = document.createElement('div');
    d.className = 'lab-fallback' + (light ? ' light' : '');
    d.textContent = "Cet appareil n'affiche pas la 3D. Sur un vrai projet, une version simplifiée prend le relais.";
    el.appendChild(d);
  }

  function makeRenderer(canvas){
    try {
      var r = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
      r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      r.outputEncoding = THREE.sRGBEncoding;
      return r;
    } catch(e){ return null; }
  }

  function watchSize(entry){
    function fit(){
      var w = entry.el.clientWidth, h = entry.el.clientHeight;
      if (!w || !h) return;
      entry.renderer.setSize(w, h, false);
      entry.camera.aspect = w / h;
      if (entry.onResize) entry.onResize(w, h);
      entry.camera.updateProjectionMatrix();
    }
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(entry.el);
    else window.addEventListener('resize', fit);
    if (window.IntersectionObserver){
      new IntersectionObserver(function(es){ entry.visible = es[0].isIntersecting; }).observe(entry.el);
    } else entry.visible = true;
  }

  /* ---------- Démo 01 : le logo REFLEKT en 3D ---------- */
  function initHero(){
    var wrap = document.getElementById('labHeroVisual');
    var canvas = document.getElementById('labHeroCanvas');
    var renderer = makeRenderer(canvas);
    if (!renderer) { fallback('labHeroVisual', true); return; }
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
    camera.position.set(0, 0, 10);

    scene.add(new THREE.AmbientLight(0xffffff, .7));
    var key = new THREE.DirectionalLight(0xffffff, 1.15); key.position.set(4, 5, 6); scene.add(key);
    var rim = new THREE.PointLight(0xef6a4d, .9, 30); rim.position.set(-5, -3, 3); scene.add(rim);
    var back = new THREE.DirectionalLight(0x6f8fc4, .6); back.position.set(-3, 2, -5); scene.add(back);

    var group = new THREE.Group(); scene.add(group);
    // Même bleu marine que le logo REFLEKT (#071b3c), converti pour un rendu fidèle
    var navy = new THREE.MeshStandardMaterial({color: new THREE.Color(0x071b3c).convertSRGBToLinear(), roughness: .38, metalness: .2});
    var specs = [{w:3.4, y:1.05, m:navy, skew:0}, {w:2.8, y:0, m:navy, skew:.67}, {w:3.4, y:-1.05, m:navy, skew:0}];
    var bars = specs.map(function(s, i){
      var g = new THREE.BoxGeometry(s.w, .56, .9, 8, 2, 2);
      if (s.skew){
        var p = g.attributes.position;
        for (var k = 0; k < p.count; k++) p.setX(k, p.getX(k) - p.getY(k) * s.skew);
        g.computeVertexNormals();
      }
      var m = new THREE.Mesh(g, s.m);
      m.position.y = s.y; m.userData.phase = i * 1.3;
      group.add(m); return m;
    });

    // Fines particules en orbite, très discrètes
    var pts = new THREE.BufferGeometry(), n = 140, arr = new Float32Array(n * 3);
    for (var i = 0; i < n; i++){
      var r = 3.2 + Math.random() * 2.6, a = Math.random() * Math.PI * 2, y = (Math.random() - .5) * 4.5;
      arr[i*3] = Math.cos(a) * r; arr[i*3+1] = y; arr[i*3+2] = Math.sin(a) * r;
    }
    pts.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    var dust = new THREE.Points(pts, new THREE.PointsMaterial({color: 0x071b3c, size: .03, transparent: true, opacity: .28}));
    scene.add(dust);

    var target = {x: 0, y: 0}, cur = {x: 0, y: 0};
    var hero = document.getElementById('labHero');
    hero.addEventListener('pointermove', function(e){
      var b = wrap.getBoundingClientRect();
      target.y = ((e.clientX - (b.left + b.width / 2)) / b.width) * 1.1;
      target.x = ((e.clientY - (b.top + b.height / 2)) / b.height) * .7;
    });
    hero.addEventListener('pointerleave', function(){ target.x = 0; target.y = 0; });

    var entry = {el: wrap, renderer: renderer, scene: scene, camera: camera, visible: false,
      onResize: function(w){ var s = w < 520 ? .72 : 1; group.scale.setScalar(s); },
      tick: function(t){
        var idle = reduced ? 0 : Math.sin(t * .45) * .22;
        cur.x += (target.x - cur.x) * .06; cur.y += (target.y - cur.y) * .06;
        group.rotation.x = -.18 + cur.x;
        group.rotation.y = -.42 + cur.y + idle;
        if (!reduced){
          bars.forEach(function(b){ b.position.z = Math.sin(t * 1.1 + b.userData.phase) * .16; });
          dust.rotation.y = t * .04;
        }
      }};
    watchSize(entry); scenes.push(entry);
  }

  /* ---------- Démo 02 : couches qui se séparent ----------
     Deux modes : suivi du défilement quand la fenêtre défile, sinon lecture automatique
     (certaines vues affichent la page à sa hauteur complète, sans défilement interne). */
  var section = document.getElementById('labScroll');
  var stack = document.getElementById('labStack'), iso = document.getElementById('labIso');
  var steps = document.querySelectorAll('#labSteps li'), plates = document.querySelectorAll('.lab-plate');
  var lastStep = -1, scrollMode = true, curP = reduced ? 1 : 0, autoStart = 0, pausedUntil = 0, manualP = null, animating = false;

  function paint(p){
    iso.style.setProperty('--p', p.toFixed(4));
    stack.style.setProperty('--p', p.toFixed(4));
    var s = Math.min(3, Math.floor(p * 4 + .15));
    if (s !== lastStep){
      lastStep = s;
      steps.forEach(function(li, i){ li.classList.toggle('on', i <= s); li.setAttribute('aria-current', i === s ? 'step' : 'false'); });
      plates.forEach(function(pl, i){ pl.classList.toggle('on', i === s); });
    }
  }
  function pageScrolls(){
    var h = window.innerHeight, total = document.documentElement.scrollHeight;
    return h < 1600 && total - h > 400;
  }
  function setMode(){
    var m = pageScrolls();
    if (m === scrollMode && section.dataset.mode) return;
    scrollMode = m; section.dataset.mode = m ? 'scroll' : 'auto';
    section.classList.toggle('lab-auto', !m);
    document.getElementById('labScrollLabel').textContent = m ? 'Démo 02 · Animation au défilement' : 'Démo 02 · Animation en couches';
    document.getElementById('labScrollText').textContent = m
      ? "Faites défiler : les couches de votre futur site se séparent une à une. Cliquez sur une étape pour y aller directement. Ce type d'animation sert à expliquer un produit, un savoir-faire ou une méthode."
      : "Les couches de votre futur site se séparent une à une. Cliquez sur une étape pour la revoir. Sur votre site, ce type d'animation suit le défilement de la page et sert à expliquer un produit, un savoir-faire ou une méthode.";
    autoStart = performance.now();
  }
  function onScroll(){
    if (!active || !scrollMode) return;
    var r = stack.getBoundingClientRect(), span = r.height - window.innerHeight;
    var p = span > 0 ? Math.max(0, Math.min(1, -r.top / span)) : 1;
    paint(reduced ? 1 : p);
  }
  // Lecture automatique : 0 → 1 en 6 s, pause, retour, pause
  function autoTarget(now){
    if (manualP !== null && now < pausedUntil) return manualP;
    manualP = null;
    var t = ((now - autoStart) / 1000) % 11;
    if (t < 6) return t / 6;
    if (t < 8.5) return 1;
    if (t < 9.7) return 1 - (t - 8.5) / 1.2;
    return 0;
  }
  function autoLoop(now){
    if (active && !scrollMode){
      var target = reduced ? (manualP !== null ? manualP : 1) : autoTarget(now);
      curP += (target - curP) * (manualP !== null ? .12 : .25);
      paint(curP);
    }
    requestAnimationFrame(autoLoop);
  }
  function goStep(i){
    var p = i / 3;
    if (scrollMode){
      var top = stack.getBoundingClientRect().top + window.scrollY;
      var span = stack.offsetHeight - window.innerHeight;
      window.scrollTo({top: top + span * p + 2, behavior: reduced ? 'auto' : 'smooth'});
    } else { manualP = p; pausedUntil = performance.now() + 5000; }
  }
  steps.forEach(function(li, i){
    li.tabIndex = 0; li.setAttribute('role', 'button');
    li.addEventListener('click', function(){ goStep(i); });
    li.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); goStep(i); } });
  });
  window.addEventListener('scroll', onScroll, {passive: true});
  window.addEventListener('resize', function(){ setMode(); onScroll(); });
  requestAnimationFrame(autoLoop);

  /* ---------- Boucle de rendu : uniquement quand la page Labo est ouverte et la scène visible ---------- */
  var last = performance.now();
  function loop(now){
    var dt = Math.min(.05, (now - last) / 1000); last = now;
    if (active && !document.hidden){
      var t = now / 1000;
      scenes.forEach(function(s){ if (s.visible){ s.tick(t, dt); s.renderer.render(s.scene, s.camera); } });
    }
    requestAnimationFrame(loop);
  }

  function start(){
    if (started) return; started = true;
    initHero();
    requestAnimationFrame(loop);
  }

  document.addEventListener('click', function(e){
    var a = e.target.closest('[data-labscroll]'); if (!a) return;
    e.preventDefault();
    var el = document.getElementById(a.getAttribute('data-labscroll'));
    if (el) el.scrollIntoView({behavior: reduced ? 'auto' : 'smooth', block: 'start'});
  });

  window.reflektLab = {onPage: function(name){
    active = name === 'labo';
    if (active){ loadThree(start); requestAnimationFrame(function(){ setMode(); onScroll(); }); }
  }};
  window.reflektLab.onPage((location.hash || '').replace('#', '') || 'accueil');
})();

if (window.reflektLab) window.reflektLab.onPage(document.body.getAttribute('data-page'));


/* ===== Animations Reflekt ===== */
(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SEL = '.statement>*, .section-head>*, .service-card, .proof-main>*, .metric, .home-paths-head>*, .path-grid>a, .offer-copy>*, .offer-group-head>*, .pricing-card, .follow-mini article, .follow-card, .cmp-wrap, .follow-details .shell>*, .expertise-list article, .process-band li, .inner-cta>*, .offer-reassurance .shell>*, .founder-card, .team-belief-inner>*, .team-values article, .team-cta .shell>*, .faq-group, .lab-demo-head>*, .lab-rules article, .contact-grid>*';
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function(es){
    es.forEach(function(e){ var el=e.target, bars=el.classList.contains('rv-bars');
      if(!e.isIntersecting){                       /* sorti de l'écran : on le remet en attente pour rejouer l'animation au prochain passage */
        if(bars) el.classList.remove('go'); else { el.classList.remove('rv-in'); el.classList.add('rv-wait'); }
        return; }
      if(e.intersectionRatio < 0.08) return;
      if(bars){ el.classList.add('go'); return; }
      el.classList.add('rv-in'); el.classList.remove('rv-wait'); });
  }, {threshold:[0, 0.08]}) : null;
  function scan(){
    if(reduced || !io) return;
    var page = document.querySelector('.page.active') || document;
    var vh = window.innerHeight;
    var groups = new Map();
    page.querySelectorAll(SEL).forEach(function(el){
      if(el.dataset.rv) return; el.dataset.rv = '1';
      var r = el.getBoundingClientRect();
      var parent = el.parentElement, i = groups.get(parent) || 0; groups.set(parent, i + 1);
      el.style.transitionDelay = Math.min(i, 5) * 80 + 'ms';
      if(r.top >= vh * 0.92) el.classList.add('rv-wait');   /* déjà visible au chargement : on ne cache rien */
      io.observe(el);
    });
    page.querySelectorAll('.mini-chart').forEach(function(c){
      if(c.dataset.rv) return; c.dataset.rv='1'; c.classList.add('rv-bars'); io.observe(c);
    });
  }
  window.addEventListener('hashchange', function(){ setTimeout(scan, 60); });
  document.addEventListener('click', function(e){ if(e.target.closest('[data-page],a[href]')) setTimeout(scan, 120); });
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
  window.addEventListener('load', scan);
})();

