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
    });
  });

  // Add Resource button: prompt for subject/area and YouTube URL
  document.getElementById('add-resource').addEventListener('click',()=>{
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
});
