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

  const stops = [
    { p: 0.00, c: [80, 97, 153] },     // #506199
    { p: 0.1667, c: [108, 129, 170] }, // #6C81AA
    { p: 0.3333, c: [132, 155, 181] }, // #849BB5
    { p: 0.50, c: [156, 177, 186] },   // #9CB1BA
    { p: 0.6667, c: [178, 193, 182] }, // #B2C1B6
    { p: 0.8333, c: [201, 199, 167] }, // #C9C7A7
    { p: 1.00, c: [213, 182, 143] }    // #D5B68F (fixed end)
  ];

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function mix(c1, c2, t) {
    return [
      Math.round(lerp(c1[0], c2[0], t)),
      Math.round(lerp(c1[1], c2[1], t)),
      Math.round(lerp(c1[2], c2[2], t))
    ];
  }

  function getColor(t) {
    t = Math.min(1, Math.max(0, t));

    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i];
      const b = stops[i + 1];

      if (t >= a.p && t <= b.p) {
        const localT = (t - a.p) / (b.p - a.p);
        const c = mix(a.c, b.c, localT);
        return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
      }
    }

    const last = stops[stops.length - 1].c;
    return `rgb(${last[0]}, ${last[1]}, ${last[2]})`;
  }

  function updateBackground() {
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    const t = maxScroll > 0 ? scrollTop / maxScroll : 0;

    html.style.background = getColor(t);
  }

  window.addEventListener("scroll", updateBackground, { passive: true });
  updateBackground();

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
    }
  ];

  const audio = new Audio();
  audio.volume = 0.1;

  let isPlaying = false;
  let currentTrack = 0;

  function loadTrack(i) {
    const t = tracks[i];
    audio.src = t.src;
    audio.volume = 0.1;
    document.getElementById('np-label').textContent = `${t.title} · ${t.artist}`;
    document.getElementById('np-cover').src = t.cover;
  }

  function togglePlay() {
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      document.getElementById('np-disc').style.animationPlayState = 'paused';
    } else {
      audio.play();
      isPlaying = true;
      document.getElementById('np-disc').style.animationPlayState = 'running';
    }
  }

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    document.getElementById('np-bar').style.width = pct + '%';
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
  });

  loadTrack(currentTrack);

