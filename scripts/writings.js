  function hideRow(row) {
  const h = row.scrollHeight;
  // row.style.maxHeight = h + 'px';
  row.style.opacity = '1';
  row.style.padding = '0 20px 0';
  
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // row.style.maxHeight = '0px';
      row.style.opacity = '0';
      row.style.marginBottom = '0';
    });
  });
}

function showRow(row) {
  // row.style.maxHeight = '150px';
  row.style.opacity = '1';
  row.style.marginBottom = '16px';
  row.style.padding = '20px 20px 18px';
}
  
  // Toggle filter accordion (stop propagation so checkboxes inside don't retrigger)
  function toggleGroup(el) {
    // Only toggle when clicking the header area, not the options themselves
    el.classList.toggle('open');
  }
 
  // Stop checkbox clicks from bubbling up to toggleGroup
  document.querySelectorAll('.filter-options').forEach(opts => {
    opts.addEventListener('click', e => e.stopPropagation());
  });
 
  // Apply filters
  function applyFilters() {
    const valuesFor = (filter) =>
      [...document.querySelectorAll(`input[data-filter="${filter}"]:checked`)].map(c => c.value);
    const checked = {
      year:   valuesFor('year'),
      topic:  valuesFor('topic'),
      length: valuesFor('length'),
    };
 
    const anyActive = checked.year.length || checked.topic.length || checked.length.length;
    document.getElementById('clearBtn').classList.toggle('visible', !!anyActive);
 
    const rows = document.querySelectorAll('.article-row');
    let visible = 0;
 
    rows.forEach(row => {
      const yearMatch  = !checked.year.length   || checked.year.includes(row.dataset.year);
      // const topicMatch = !checked.topic.length  || checked.topic.includes(row.dataset.topic);
      const rowTopics  = (row.dataset.topic || '').split(' ');
      const topicMatch = !checked.topic.length  || checked.topic.some(t => rowTopics.includes(t));
      const lenMatch   = !checked.length.length || checked.length.includes(row.dataset.length);
 
      if (yearMatch && topicMatch && lenMatch) {
        // row.classList.remove('hidden');
        // row.style.maxHeight = row.scrollHeight + 'px';
        showRow(row);
        visible++;
      } else {
        // row.classList.add('hidden');

        // // Pin to actual height first so it animates from real size → 0
        // row.style.maxHeight = row.scrollHeight + 'px';
        // // Force a reflow so the browser registers the starting value
        // row.offsetHeight;
        // row.classList.add('hidden');
        // row.style.maxHeight = '0px';
        hideRow(row);
      }
    });
 
    document.getElementById('emptyState').classList.toggle('visible', visible === 0);
  }
 
  function clearFilters() {
    document.querySelectorAll('.filter-option input').forEach(c => c.checked = false);
    applyFilters();
  }

  /* ---- Posts written in the editor (/writing/new/) ----
     Adds a row for each post in /writing/posts/index.json, sorts every
     row newest first, and builds the Date filter from the years present. */
  function postRow(post) {
    const a = document.createElement('a');
    a.href = `/writing/post/?p=${encodeURIComponent(post.slug)}`;
    a.style.cssText = 'text-decoration: none; color: inherit; display: contents;';
    const row = document.createElement('div');
    row.className = 'article-row';
    row.dataset.date = post.date;
    row.dataset.year = post.date.slice(0, 4);
    row.dataset.topic = (post.topics || []).join(' ');
    row.dataset.length = Writing.lengthBucket(post.words || 0);
    row.innerHTML = `
        <h3>${Writing.escapeHtml(post.title)}</h3>
        ${post.summary ? `<p>${Writing.escapeHtml(post.summary)}</p>` : ''}
        <div class="article-meta">${Writing.metaHtml(post)}</div>`;
    a.appendChild(row);
    return a;
  }

  function buildYearFilter() {
    const years = [...new Set(
      [...document.querySelectorAll('.article-row')].map(r => r.dataset.year).filter(Boolean)
    )].sort().reverse();
    document.getElementById('yearOptions').innerHTML = years.map(y => `
          <label class="filter-option">
            <input type="checkbox" data-filter="year" value="${y}" onchange="applyFilters()"> ${y}
          </label>`).join('');
  }

  async function loadPosts() {
    const panel = document.getElementById('articlesPanel');
    const emptyState = document.getElementById('emptyState');
    try {
      const res = await fetch('/writing/posts/index.json', { cache: 'no-cache' });
      const posts = res.ok ? await res.json() : [];
      posts.forEach(post => panel.insertBefore(postRow(post), emptyState));
    } catch {}

    // Newest first, across editor posts and the hand-written rows.
    const rows = [...panel.querySelectorAll(':scope > a')]
      .filter(a => a.querySelector('.article-row'))
      .sort((a, b) => {
        const da = a.querySelector('.article-row').dataset.date || '';
        const db = b.querySelector('.article-row').dataset.date || '';
        return db.localeCompare(da);
      });
    rows.forEach(a => panel.insertBefore(a, emptyState));
    buildYearFilter();
  }

  loadPosts();
