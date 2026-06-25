  // Clock
  function updateClock() {
    const now = new Date();
    const t = now.toLocaleTimeString('en-AU', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false, timeZone: 'Australia/Melbourne'
    });
    document.getElementById('clock').textContent = t;
  }
  updateClock();
  setInterval(updateClock, 1000);

  


  const html = document.documentElement;
const body = document.querySelector('body');

/* START GRADUAL TRANSITION */
  // const stops = [
  //   { p: 0.00, c: [80, 97, 153] },     // #506199
  //   { p: 0.1667, c: [108, 129, 170] }, // #6C81AA
  //   { p: 0.3333, c: [132, 155, 181] }, // #849BB5
  //   { p: 0.50, c: [156, 177, 186] },   // #9CB1BA
  //   { p: 0.6667, c: [178, 193, 182] }, // #B2C1B6
  //   { p: 0.8333, c: [201, 199, 167] }, // #C9C7A7
  //   { p: 1.00, c: [213, 182, 143] }    // #D5B68F (fixed end)
  // ];

  // const stops = [
  //   { p: 0.00, c: [77, 135, 197] }, // #4D87C5
  //   { p: 1.00, c: [130, 188, 104] } // #82BC68
  // ];

  // function lerp(a, b, t) {
  //   return a + (b - a) * t;
  // }

  // function mix(c1, c2, t) {
  //   return [
  //     Math.round(lerp(c1[0], c2[0], t)),
  //     Math.round(lerp(c1[1], c2[1], t)),
  //     Math.round(lerp(c1[2], c2[2], t))
  //   ];
  // }

  // function getColor(t) {
  //   t = Math.min(1, Math.max(0, t));

  //   for (let i = 0; i < stops.length - 1; i++) {
  //     const a = stops[i];
  //     const b = stops[i + 1];

  //     if (t >= a.p && t <= b.p) {
  //       const localT = (t - a.p) / (b.p - a.p);
  //       const c = mix(a.c, b.c, localT);
  //       return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  //     }
  //   }

  //   const last = stops[stops.length - 1].c;
  //   return `rgb(${last[0]}, ${last[1]}, ${last[2]})`;
  // }

  // function updateBackground() {
  //   const scrollTop = window.scrollY;
  //   const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  //   const t = maxScroll > 0 ? scrollTop / maxScroll : 0;

  //   body.style.backgroundColor = getColor(t);
  // }

  // window.addEventListener("scroll", updateBackground, { passive: true });
  // updateBackground();

  /* END GRADUAL TRANSITION */

  const topColor = "rgb(77, 135, 197)";    // #4D87C5
  const bottomColor = "rgb(130, 188, 104)"; // #82BC68

  let currentColor = null;
  let ticking = false;

  function applyColor() {
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    const t = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;

    const newColor = t < 0.5 ? topColor : bottomColor;

    if (newColor !== currentColor) {
      currentColor = newColor;
      body.style.backgroundColor = newColor;
    }

    ticking = false;
  }

  function updateBackground() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(applyColor);
    }
  }

  window.addEventListener("scroll", updateBackground, { passive: true });
  updateBackground();

 /* ORIGINAL MUSIC */
//   const tracks = [
//     {
//       title: 'the louvre',
//       artist: 'lorde',
//       src: '/audio/track1.mp3',
//       cover: '/images/cover1.png'
//     },
//     {
//       title: 'born to die',
//       artist: 'lana del rey',
//       src: '/audio/track2.mp3',
//       cover: '/images/cover2.jpg'
//     },
//     {
//       title: 'stupid song',
//       artist: 'olivia rodrigo',
//       src: '/audio/track3.mp3',
//       cover: '/images/cover3.webp'
//     },
//     {
//       title: 'fame is a gun',
//       artist: 'addison rae',
//       src: '/audio/track4.mp3',
//       cover: '/images/cover4.webp'
//     },
//     {
//       title: 'snow angel',
//       artist: 'reneé rapp',
//       src: '/audio/track5.mp3',
//       cover: '/images/cover5.png'
//     }
//   ];

//   const audio = new Audio();
//   audio.volume = 0.1;

//   let isPlaying = false;
//   let currentTrack = 0;
//   let isScrubbing = false;

//   const disc = document.getElementById('np-disc');
//   const cover = document.getElementById('np-cover');
//   const label = document.getElementById('np-label');
//   // const titleEl = document.getElementById('np-title');
//   // const artistEl = document.getElementById('np-artist');
//   const bar = document.getElementById('np-bar');
//   const bar2 = document.getElementById('fill2');
//   const barTrack = document.getElementById('track2');
//   const thumb = document.getElementById('np-bar-thumb');
//   const playBtn = document.getElementById('np-playpause');
//   const pill = document.getElementById('now-playing');


//   function loadTrack(i, autoplay) {
//     // const t = tracks[i];
//     // audio.src = t.src;
//     // audio.volume = 0.1;
//     // document.getElementById('np-label').textContent = `${t.title} · ${t.artist}`;
//     // document.getElementById('np-cover').src = t.cover;
//       const t = tracks[i];
//     audio.src = t.src;
//     audio.volume = 0.1;
//     // titleEl.textContent = t.title;
//     // artistEl.textContent = t.artist;
//     label.innerHTML = `${t.title} · <span style="color: rgba(0, 0 , 0, 0.45);">${t.artist}</span>`;
//     cover.src = t.cover;
//     bar.style.width = '0%';
//     if (autoplay) {
//       audio.play().catch(() => {});
//       setPlaying(true);
//     }
//   }

//   function setPlaying(playing) {
//     isPlaying = playing;
//     disc.classList.toggle('playing', playing);
//     playBtn.classList.toggle('np-pause', playing);
//     playBtn.classList.toggle('np-play', !playing);
//     playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
//   }


//   // function togglePlay() {
//   //   if (isPlaying) {
//   //     audio.pause();
//   //     isPlaying = false;
//   //     document.getElementById('np-disc').style.animationPlayState = 'paused';
//   //   } else {
//   //     audio.play();
//   //     isPlaying = true;
//   //     document.getElementById('np-disc').style.animationPlayState = 'running';
//   //   }
//   // }

//   function togglePlay() {
//   if (isPlaying) {
//     audio.pause();
//     setPlaying(false);
//   } else {
//     audio.play().catch(() => {});
//     setPlaying(true);
//   }
// }

//   function nextTrack() {
//   currentTrack = (currentTrack + 1) % tracks.length;
//   loadTrack(currentTrack, isPlaying);
// }

// function prevTrack() {
//   currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
//   loadTrack(currentTrack, isPlaying);
// }

// document.getElementById('np-prev').addEventListener('click', (e) => { e.stopPropagation(); prevTrack(); });
// document.getElementById('np-next').addEventListener('click', (e) => { e.stopPropagation(); nextTrack(); });
// playBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });

//   audio.addEventListener('timeupdate', () => {
//     if (!audio.duration) return;
//     const pct = (audio.currentTime / audio.duration) * 100;
//     bar.style.width = pct + '%';
//     bar2.style.width = pct + '%';
//   });

//   audio.addEventListener('ended', () => {
//     // isPlaying = false;
//     // document.getElementById('np-disc').style.animationPlayState = 'paused';
//     // document.getElementById('np-bar').style.width = '0%';
//     currentTrack = (currentTrack + 1) % tracks.length; // loop playlist
//     loadTrack(currentTrack);

//     audio.play();
//     isPlaying = true;

//     document.getElementById('np-disc').style.animationPlayState = 'running';
//     document.getElementById('np-bar').style.width = '0%';
//   });

//   // START SCRUBBING

//   /* ---- draggable scrub thumb ---- */
// function pctFromEvent(e) {
//   const rect = barTrack.getBoundingClientRect();
//   const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
//   return Math.min(1, Math.max(0, x / rect.width));
// }

// function startScrub(e) {
//   e.stopPropagation();
//   e.preventDefault();
//   isScrubbing = true;
//   bar2.classList.add('scrubbing');
//   thumb.classList.add('dragging');
// //   barTrack.classList.add('scrub-active');
// //   pill.classList.add('scrub-open');
//   moveScrub(e);
//   window.addEventListener('pointermove', moveScrub);
//   window.addEventListener('pointerup', endScrub);
// }

// function moveScrub(e) {
//   if (!isScrubbing || !audio.duration) return;
//   const pct = pctFromEvent(e);
//   bar2.style.width = (pct * 100) + '%';
//   audio.currentTime = pct * audio.duration;
// }

// function endScrub() {
//   isScrubbing = false;
//   bar2.classList.remove('scrubbing');
//   thumb.classList.remove('dragging');
// //   barTrack.classList.remove('scrub-active');
// //   pill.classList.remove('scrub-open');
//   window.removeEventListener('pointermove', moveScrub);
//   window.removeEventListener('pointerup', endScrub);
// }

// thumb.addEventListener('pointerdown', startScrub);

// // also allow clicking anywhere on the track to jump
// barTrack.addEventListener('pointerdown', (e) => {
//   if (e.target === thumb) return; // already handled
//   e.stopPropagation();
//   if (!audio.duration) return;
//   const pct = pctFromEvent(e);
//   audio.currentTime = pct * audio.duration;
//   bar.style.width = (pct * 100) + '%';
// });


//   // END SCRUBBING

// loadTrack(currentTrack);

 /* END ORIGINAL MUSIC */

 const tracks = [
    {
      title: 'the louvre',
      artist: 'lorde',
      src: '/audio/track1.mp3',
      cover: '/images/cover1.png'
    },
    {
      title: 'born to die',
      artist: 'lana del rey',
      src: '/audio/track2.mp3',
      cover: '/images/cover2.jpg'
    },
    {
      title: 'stupid song',
      artist: 'olivia rodrigo',
      src: '/audio/track3.mp3',
      cover: '/images/cover3.webp'
    },
    {
      title: 'fame is a gun',
      artist: 'addison rae',
      src: '/audio/track4.mp3',
      cover: '/images/cover4.webp'
    },
    {
      title: 'snow angel',
      artist: 'reneé rapp',
      src: '/audio/track5.mp3',
      cover: '/images/cover5.png'
    }
  ];

  const audio = new Audio();
  audio.volume = 0.1;

  let isPlaying = false;
  let currentTrack = 0;
  let isScrubbing = false;
  let lastSave = 0;

  const disc = document.getElementById('np-disc');
  const cover = document.getElementById('np-cover');
  const label = document.getElementById('np-label');
  // const titleEl = document.getElementById('np-title');
  // const artistEl = document.getElementById('np-artist');
  const bar = document.getElementById('np-bar');
  const bar2 = document.getElementById('fill2');
  const barTrack = document.getElementById('track2');
  const thumb = document.getElementById('np-bar-thumb');
  const playBtn = document.getElementById('np-playpause');
  const pill = document.getElementById('now-playing');

  const NP_STORAGE_KEY = 'npState';

  function saveState() {
    try {
      localStorage.setItem(NP_STORAGE_KEY, JSON.stringify({
        trackIndex: currentTrack,
        currentTime: audio.currentTime || 0,
        isPlaying: isPlaying,
        savedAt: Date.now()
      }));
    } catch {}
  }

  function loadTrack(i, autoplay) {
    // const t = tracks[i];
    // audio.src = t.src;
    // audio.volume = 0.1;
    // document.getElementById('np-label').textContent = `${t.title} · ${t.artist}`;
    // document.getElementById('np-cover').src = t.cover;
      const t = tracks[i];
    audio.src = t.src;
    audio.volume = 0.1;
    // titleEl.textContent = t.title;
    // artistEl.textContent = t.artist;
    label.innerHTML = `${t.title} · <span style="color: rgba(0, 0 , 0, 0.45);">${t.artist}</span>`;
    cover.src = t.cover;
    bar.style.width = '0%';
    if (autoplay) {
      audio.play().catch(() => {});
      setPlaying(true);
    }
    saveState();
  }

  function setPlaying(playing) {
    isPlaying = playing;
    disc.classList.toggle('playing', playing);
    playBtn.classList.toggle('np-pause', playing);
    playBtn.classList.toggle('np-play', !playing);
    playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    saveState();
  }


  // function togglePlay() {
  //   if (isPlaying) {
  //     audio.pause();
  //     isPlaying = false;
  //     document.getElementById('np-disc').style.animationPlayState = 'paused';
  //   } else {
  //     audio.play();
  //     isPlaying = true;
  //     document.getElementById('np-disc').style.animationPlayState = 'running';
  //   }
  // }

  function togglePlay() {
  if (isPlaying) {
    audio.pause();
    setPlaying(false);
  } else {
    audio.play().catch(() => {});
    setPlaying(true);
  }
}

  function nextTrack() {
  currentTrack = (currentTrack + 1) % tracks.length;
  loadTrack(currentTrack, isPlaying);
}

function prevTrack() {
  currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
  loadTrack(currentTrack, isPlaying);
}

document.getElementById('np-prev').addEventListener('click', (e) => { e.stopPropagation(); prevTrack(); });
document.getElementById('np-next').addEventListener('click', (e) => { e.stopPropagation(); nextTrack(); });
playBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    bar.style.width = pct + '%';
    bar2.style.width = pct + '%';

    const now = Date.now();
    if (now - lastSave > 2000) {
      saveState();
      lastSave = now;
    }
  });

  audio.addEventListener('ended', () => {
    // isPlaying = false;
    // document.getElementById('np-disc').style.animationPlayState = 'paused';
    // document.getElementById('np-bar').style.width = '0%';
    currentTrack = (currentTrack + 1) % tracks.length; // loop playlist
    loadTrack(currentTrack);

    audio.play();
    isPlaying = true;

    document.getElementById('np-disc').style.animationPlayState = 'running';
    document.getElementById('np-bar').style.width = '0%';
    saveState();
  });

  window.addEventListener('beforeunload', saveState);

  // START SCRUBBING

  /* ---- draggable scrub thumb ---- */
function pctFromEvent(e) {
  const rect = barTrack.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  return Math.min(1, Math.max(0, x / rect.width));
}

function startScrub(e) {
  e.stopPropagation();
  e.preventDefault();
  isScrubbing = true;
  bar2.classList.add('scrubbing');
  thumb.classList.add('dragging');
//   barTrack.classList.add('scrub-active');
//   pill.classList.add('scrub-open');
  moveScrub(e);
  window.addEventListener('pointermove', moveScrub);
  window.addEventListener('pointerup', endScrub);
}

function moveScrub(e) {
  if (!isScrubbing || !audio.duration) return;
  const pct = pctFromEvent(e);
  bar2.style.width = (pct * 100) + '%';
  audio.currentTime = pct * audio.duration;
}

function endScrub() {
  isScrubbing = false;
  bar2.classList.remove('scrubbing');
  thumb.classList.remove('dragging');
//   barTrack.classList.remove('scrub-active');
//   pill.classList.remove('scrub-open');
  window.removeEventListener('pointermove', moveScrub);
  window.removeEventListener('pointerup', endScrub);
  saveState();
}

thumb.addEventListener('pointerdown', startScrub);

// also allow clicking anywhere on the track to jump
barTrack.addEventListener('pointerdown', (e) => {
  if (e.target === thumb) return; // already handled
  e.stopPropagation();
  if (!audio.duration) return;
  const pct = pctFromEvent(e);
  audio.currentTime = pct * audio.duration;
  bar.style.width = (pct * 100) + '%';
  saveState();
});


  // END SCRUBBING

  function restoreState() {
    let state = null;
    try {
      const raw = localStorage.getItem(NP_STORAGE_KEY);
      if (raw) state = JSON.parse(raw);
    } catch {}

    if (!state) {
      loadTrack(currentTrack);
      return;
    }

    currentTrack = state.trackIndex ?? 0;
    const t = tracks[currentTrack];
    audio.src = t.src;
    audio.volume = 0.1;
    label.innerHTML = `${t.title} · <span style="color: rgba(0, 0 , 0, 0.45);">${t.artist}</span>`;
    cover.src = t.cover;

    audio.addEventListener('loadedmetadata', () => {
      audio.currentTime = state.currentTime || 0;
      const pct = (audio.currentTime / audio.duration) * 100;
      bar.style.width = pct + '%';
      bar2.style.width = pct + '%';

      if (state.isPlaying) {
        audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      }
    }, { once: true });
  }

  restoreState();


function isMobile() {
  return window.innerWidth <= 768;
}

function checkNearBottom() {
  if (!isMobile()) return; // only run this behavior on mobile widths

  const scrollPosition = window.scrollY + window.innerHeight;
  const pageHeight = document.documentElement.scrollHeight;
  const distanceFromBottom = pageHeight - scrollPosition;

  if (distanceFromBottom <= 20) {
    document.documentElement.style.setProperty('--background-img', `url(/images/background-mobile-bottom.png)`);
    // document.body.style.backgroundImage = 'url(/images/background-mobile-bottom.png)';
  } else {
    document.documentElement.style.setProperty('--background-img', `url(/images/backgroundtest3.jpeg)`);
    // document.body.style.backgroundImage = 'url(/images/backgroundtest3.jpeg)';
  }
}

window.addEventListener('scroll', checkNearBottom, { passive: true });
window.addEventListener('resize', checkNearBottom);
checkNearBottom();