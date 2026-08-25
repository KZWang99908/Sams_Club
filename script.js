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

  // Manual lessons: populate `MANUAL_LESSONS` below with lesson objects
  const MANUAL_LESSONS = [
    // Example structure — add your lessons here:
    // { id: 1, title: 'Intro to Algebra', area: 'math-algebra', video: 'https://www.youtube.com/embed/VIDEO_ID', content: 'Short lesson notes' },
    {id: 1, title: 'Intro to Chemistry', area: 'science-chemistry', video: 'https://www.youtube.com/embed/ZacZpScAiHViGXl5', content: 'Basic concepts of chemistry and their properties'}
  ];

  // Helper: persist manual lessons into localStorage only if lessons are empty
  function seedManualLessons(){
    try{
      const existing = localStorage.getItem('lessons');
      if(!existing || existing === '[]'){
        const seeded = MANUAL_LESSONS.map((l,i)=> ({ id: l.id || Date.now() + i, title: l.title||'', area: l.area||'misc', video: l.video||null, content: l.content||'' }));
        localStorage.setItem('lessons', JSON.stringify(seeded));
      }
    }catch(e){ console.warn('Failed to seed manual lessons', e); }
  }

  // Notes autosave
  const notes = document.getElementById('notes');
  const notesKey = 'samsclub-notes';
  let currentLessonId = null;
  // load global notes by default
  notes.value = localStorage.getItem(notesKey) || '';
  notes.addEventListener('input', ()=>{
    if(currentLessonId){
      localStorage.setItem('lesson-notes:'+currentLessonId, notes.value);
    } else {
      localStorage.setItem(notesKey, notes.value);
    }
  });

  // When area changes, clear lesson view and show global notes
  document.addEventListener('area-changed', ()=>{ currentLessonId = null; notes.value = localStorage.getItem(notesKey) || ''; });

  // Render lesson buttons inside sidebar under their matching area
  function renderSidebarLessons(){
    // remove existing lesson-link nodes
    document.querySelectorAll('.lesson-link').forEach(n=>n.remove());
    const lessons = (function(){ try{ return JSON.parse(localStorage.getItem('lessons')||'[]'); }catch(e){return [];} })();
    lessons.forEach(lesson=>{
      if(!lesson.area) return;
      const areaBtn = document.querySelector(`[data-area="${lesson.area}"]`);
      if(!areaBtn) return;
      // create small lesson button
      const btn = document.createElement('button');
      btn.className = 'lesson-link';
      btn.textContent = lesson.title;
      btn.dataset.lessonId = lesson.id;
      btn.style.display = 'block';
      btn.style.margin = '6px 0 0 12px';
      btn.style.padding = '6px 8px';
      btn.style.fontSize = '13px';
      btn.style.borderRadius = '8px';
      btn.style.border = '1px solid rgba(0,0,0,0.06)';
      btn.style.background = '#fff';
      btn.addEventListener('click', ()=>{
        // mark parent area active
        document.querySelectorAll('.area-btn').forEach(a=>a.classList.remove('active'));
        areaBtn.classList.add('active');
        // dispatch area change
        document.dispatchEvent(new CustomEvent('area-changed',{detail:{area: lesson.area}}));
        // load lesson video and notes
        loadVideo(lesson.title, lesson.video || null);
        currentLessonId = lesson.id;
        const stored = localStorage.getItem('lesson-notes:'+lesson.id);
        notes.value = stored !== null ? stored : (lesson.content || '');
      });
      // insert after the area button
      const parent = areaBtn.parentElement;
      if(parent) parent.insertBefore(btn, areaBtn.nextSibling);
    });
  }

  // Ensure manual lessons are seeded (if any) then render sidebar
  seedManualLessons();

  // Load default welcome state if any sample in sidebar data-video
  const first = document.querySelector('.area-btn[data-video]');
  if(first) first.click();

  // ensure active classes for initial state
  const activeArea = document.querySelector('.area-btn.active') || document.querySelector('.area-btn[data-video]');
  if(activeArea) activeArea.classList.add('active');
  if(activeArea){ document.dispatchEvent(new CustomEvent('area-changed',{detail:{area: activeArea.dataset.area}})); }
  // render lesson buttons in sidebar for any saved lessons
  renderSidebarLessons();
  
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

  // Lessons management (no admin UI)
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

    const controls = document.createElement('div'); controls.style.marginTop='8px';
    const playBtn = document.createElement('button'); playBtn.textContent = 'Play'; playBtn.className='small';
    playBtn.addEventListener('click', ()=>{ loadVideo(lesson.title, lesson.video || null); });
    controls.appendChild(playBtn);
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
    if(filtered.length === 0){ section.style.display = 'none'; return; }
    section.style.display = 'block';
    filtered.forEach(renderLesson);
  }

  // listen for area changes from the main UI
  document.addEventListener('area-changed', (e)=>{ refreshLessons(e.detail && e.detail.area); });
});
