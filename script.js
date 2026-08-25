// Simple interactions: toggle subjects, load video, save notes + resources in localStorage
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.subject-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const areas = btn.nextElementSibling;
      // toggle display
      areas.style.display = areas.style.display === 'block' ? 'none' : 'block';
      // set active state on subject buttons
      document.querySelectorAll('.subject-btn').forEach(s=>s.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  const playerWrap = document.getElementById('player-wrap');
  const currentArea = document.getElementById('current-area');

  function loadVideo(title, url){
    currentArea.textContent = title;
    if(!url){
      playerWrap.innerHTML = '<div id="player-placeholder"><p>No video for this area yet. Use Add Resource to paste a YouTube link.</p></div>';
      return;
    }
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    playerWrap.innerHTML = '';
    playerWrap.appendChild(iframe);
  }

  // Area buttons
  document.querySelectorAll('.area-btn').forEach(btn=>{
    const areaKey = btn.dataset.area;
    // restore saved URL if present
    const saved = localStorage.getItem('video:'+areaKey);
    if(saved) btn.dataset.video = saved;

    btn.addEventListener('click',()=>{
      // active state
      document.querySelectorAll('.area-btn').forEach(a=>a.classList.remove('active'));
      btn.classList.add('active');
      const vid = btn.dataset.video;
      loadVideo(btn.textContent, vid);
      // notify listeners that active area changed
      document.dispatchEvent(new CustomEvent('area-changed',{detail:{area: areaKey}}));
    });
  });

  // Add Resource button: prompt for subject/area and YouTube URL
  const addResourceBtn = document.getElementById('add-resource');
  const isAdminGlobal = ()=> !!sessionStorage.getItem('samsclub-admin');
  addResourceBtn.addEventListener('click',()=>{
    if(!isAdminGlobal()){
      alert('Only admins can add resources. Please sign in via Admin.');
      const adminBtn = document.getElementById('admin-login'); if(adminBtn) adminBtn.click();
      return;
    }
    const area = prompt('Enter area id (e.g. math-algebra or sci-bio)');
    if(!area) return;
    const url = prompt('Paste full YouTube embed URL (https://www.youtube.com/embed/VIDEO_ID) or watch URL');
    if(!url) return;
    // normalize watch?v= to embed
    let embed = url;
    const watchMatch = url.match(/[?&]v=([\w-]+)/);
    if(watchMatch) embed = 'https://www.youtube.com/embed/'+watchMatch[1];
    const id = 'video:'+area;
    localStorage.setItem(id, embed);
    // attach to existing button if present
    const btn = document.querySelector(`[data-area="${area}"]`);
    if(btn){ btn.dataset.video = embed; alert('Resource saved and attached to existing area.'); }
    else alert('Resource saved. Create a button with data-area="'+area+'" to attach it in the sidebar.');
  });

  // Notes autosave
  const notes = document.getElementById('notes');
  const notesKey = 'samsclub-notes';
  notes.value = localStorage.getItem(notesKey) || '';
  notes.addEventListener('input', ()=> localStorage.setItem(notesKey, notes.value));

  // Load default welcome state if any sample in sidebar data-video
  const first = document.querySelector('.area-btn[data-video]');
  if(first) first.click();

  // ensure active classes for initial state
  const activeArea = document.querySelector('.area-btn.active') || document.querySelector('.area-btn[data-video]');
  if(activeArea) activeArea.classList.add('active');
  if(activeArea){ document.dispatchEvent(new CustomEvent('area-changed',{detail:{area: activeArea.dataset.area}})); }
  
  // rotating slogans
  const slogans = [
    'Learn. Grow. Repeat.',
    'Curiosity fuels success.',
    'Master concepts, one video at a time.',
    'Built for students, by students.'
  ];
  let sIndex = 0;
  const sloganEl = document.getElementById('slogan');
  if(sloganEl){
    setInterval(()=>{
      sIndex = (sIndex + 1) % slogans.length;
      sloganEl.style.opacity = 0;
      setTimeout(()=>{ sloganEl.textContent = slogans[sIndex]; sloganEl.style.opacity = 1; }, 300);
    }, 4200);
  }

  /* --- Animated mathy background canvas --- */
  (function setupMathBackground(){
    const canvas = document.getElementById('math-bg');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    const glyphs = ['π','∑','√','∞','∫','ƒ(x)','x²','Δ','θ','λ','y′','e^x','sin','cos','tan'];

    function resize(){
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function init(){
      particles = [];
      const count = Math.round((W*H)/90000);
      for(let i=0;i<count;i++){
        particles.push({
          x: Math.random()*W,
          y: Math.random()*H,
          vx: (Math.random()-0.5)*0.2,
          vy: -0.2 - Math.random()*0.4,
          size: 12+Math.random()*22,
          glyph: glyphs[Math.floor(Math.random()*glyphs.length)],
          alpha: 0.4+Math.random()*0.6,
        });
      }
    }

    function step(){
      ctx.clearRect(0,0,W,H);
      for(const p of particles){
        p.x += p.vx;
        p.y += p.vy;
        p.alpha *= 0.9999;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = '#111';
        ctx.font = `${p.size}px Georgia`;
        ctx.fillText(p.glyph, p.x, p.y);
        ctx.restore();
        if(p.y < -30 || p.x < -40 || p.x > W+40){
          p.x = Math.random()*W;
          p.y = H + (10+Math.random()*80);
          p.alpha = 0.5+Math.random()*0.6;
        }
      }
      requestAnimationFrame(step);
    }

    window.addEventListener('resize', ()=>{ resize(); init(); });
    resize(); init(); step();
  })();

  /* --- Admin / whitelist protected panel (client-side) --- */
  (function adminPanel(){
    const WHITELIST = [
      {user:'alice', pass:'alpha123'},
      {user:'bob', pass:'bravo456'},
      {user:'KevinW', pass:'Kw@10125686'}
    ];
    const adminBtn = document.getElementById('admin-login');
    const modal = document.getElementById('admin-modal');
    const loginForm = document.getElementById('login-form');
    const panel = document.getElementById('admin-panel');
    const closeBtn = document.getElementById('admin-close');
    const submit = document.getElementById('admin-submit');
    const logout = document.getElementById('admin-logout');
    const feedback = document.getElementById('admin-feedback');

    function showModal(){
      modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false');
    }
    function hideModal(){
      modal.classList.add('hidden'); modal.setAttribute('aria-hidden','true');
    }

    function adminSignedIn(){
      return !!sessionStorage.getItem('samsclub-admin');
    }

    function setAdminUIState(){
      const addBtn = document.getElementById('add-resource');
      if(addBtn) addBtn.disabled = !adminSignedIn();
    }

    function getCurrentArea(){ const a = document.querySelector('.area-btn.active'); return a ? a.dataset.area : null; }

    adminBtn && adminBtn.addEventListener('click', ()=>{ showModal(); loginForm.classList.remove('hidden'); panel.classList.add('hidden'); });
    closeBtn && closeBtn.addEventListener('click', hideModal);

    function isWhitelisted(u,p){
      return WHITELIST.some(it=> it.user === u && it.pass === p);
    }

    submit && submit.addEventListener('click', ()=>{
      const u = document.getElementById('admin-username').value.trim();
      const p = document.getElementById('admin-password').value;
      if(!u||!p){ feedback.textContent = 'Provide username and password.'; return; }
      if(isWhitelisted(u,p)){
        sessionStorage.setItem('samsclub-admin', u);
        loginForm.classList.add('hidden'); panel.classList.remove('hidden'); feedback.textContent = 'Signed in as '+u;
        setAdminUIState(); loadAdminState(); refreshLessons(getCurrentArea());
      } else {
        feedback.textContent = 'Invalid credentials.';
      }
    });

    logout && logout.addEventListener('click', ()=>{
      sessionStorage.removeItem('samsclub-admin'); feedback.textContent = 'Logged out.'; loginForm.classList.remove('hidden'); panel.classList.add('hidden'); setAdminUIState(); refreshLessons(getCurrentArea());
    });

    function loadAdminState(){
      const who = sessionStorage.getItem('samsclub-admin');
      if(who){ showModal(); loginForm.classList.add('hidden'); panel.classList.remove('hidden'); feedback.textContent = 'Signed in as '+who; }
      setAdminUIState();
    }

    // Lessons management
    function saveLessons(list){ localStorage.setItem('lessons', JSON.stringify(list)); }
    function loadLessons(){ try{ return JSON.parse(localStorage.getItem('lessons')||'[]'); }catch(e){return [];} }

    function renderLesson(lesson){
      const wrap = document.getElementById('lessons-list');
      if(!wrap) return;
      const el = document.createElement('div');
      el.className = 'lesson-item';
      const title = document.createElement('div'); title.textContent = lesson.title;
      title.style.fontWeight = '600';
      el.appendChild(title);

      const meta = document.createElement('div'); meta.style.fontSize='12px'; meta.style.opacity=0.8; meta.textContent = lesson.area || 'misc';
      el.appendChild(meta);

      const controls = document.createElement('div'); controls.style.marginTop='8px'; controls.style.display='flex'; controls.style.gap='8px';

      const playBtn = document.createElement('button'); playBtn.textContent = 'Play'; playBtn.className='small';
      playBtn.addEventListener('click', ()=>{ loadVideo(lesson.title, lesson.video || null); });
      controls.appendChild(playBtn);

      const isAdmin = adminSignedIn();
      if(isAdmin){
        const attach = document.createElement('button'); attach.textContent='Attach'; attach.className='small';
        attach.addEventListener('click', ()=>{
          if(!lesson.area) return alert('Lesson has no area id.');
          if(!lesson.video) return alert('Lesson has no video to attach.');
          localStorage.setItem('video:'+lesson.area, lesson.video);
          const btn = document.querySelector(`[data-area="${lesson.area}"]`);
          if(btn) btn.dataset.video = lesson.video;
          alert('Video attached to area '+lesson.area);
        });
        controls.appendChild(attach);

        if(lesson.video){
          const unlink = document.createElement('button'); unlink.textContent='Unlink Video'; unlink.className='small';
          unlink.addEventListener('click', ()=>{
            if(!confirm('Remove video for area '+lesson.area+'?')) return;
            localStorage.removeItem('video:'+lesson.area);
            // update lesson record
            const items = loadLessons();
            const idx = items.findIndex(it=>it.id===lesson.id);
            if(idx>-1){ items[idx].video = null; saveLessons(items); }
            const btn = document.querySelector(`[data-area="${lesson.area}"]`);
            if(btn) delete btn.dataset.video;
            refreshLessons(getCurrentArea());
          });
          controls.appendChild(unlink);
        }

        const del = document.createElement('button'); del.textContent='Delete'; del.className='small danger';
        del.addEventListener('click', ()=>{
          if(!confirm('Delete lesson "'+lesson.title+'"? This will remove the lesson and its attached video.')) return;
          const items = loadLessons();
          const remaining = items.filter(it=>it.id!==lesson.id);
          saveLessons(remaining);
          if(lesson.area && lesson.video) localStorage.removeItem('video:'+lesson.area);
          refreshLessons(getCurrentArea());
        });
        controls.appendChild(del);
      }

      el.appendChild(controls);
      wrap.appendChild(el);
    }

    function refreshLessons(area){
      const wrap = document.getElementById('lessons-list');
      const section = document.getElementById('lessons-section');
      if(!wrap || !section) return;
      wrap.innerHTML = '';
      const items = loadLessons();
      const filtered = area ? items.filter(it => it.area === area) : [];
      if(filtered.length === 0){
        section.style.display = 'none';
        return;
      }
      section.style.display = 'block';
      filtered.forEach(renderLesson);
    }

    // listen for area changes from the main UI
    document.addEventListener('area-changed', (e)=>{ refreshLessons(e.detail && e.detail.area); });

    // hook add lesson
    const addBtn = document.getElementById('lesson-add');
    if(addBtn){
      addBtn.addEventListener('click', ()=>{
        const title = document.getElementById('lesson-title').value.trim();
        const area = document.getElementById('lesson-area').value.trim();
        const video = document.getElementById('lesson-video').value.trim();
        const content = document.getElementById('lesson-content').value.trim();
        if(!title) {
          feedback.textContent = 'Title required.'; return;
        }
        if(!isAdminGlobal()) {
          feedback.textContent = 'Only admins can create lessons.'; return;
        }
        const lessons = loadLessons();
        const lesson = {id:Date.now(), title, area: area||'misc', video: video||null, content };
        lessons.unshift(lesson); saveLessons(lessons); refreshLessons(getCurrentArea()); feedback.textContent = 'Lesson added.';
        // If area exists in sidebar, attach video
        if(area && video){
          localStorage.setItem('video:'+area, video); const btn = document.querySelector(`[data-area="${area}"]`); if(btn) btn.dataset.video = video;
        }
      });
    }

    // initialize
    refreshLessons(getCurrentArea()); loadAdminState();
  })();
});
