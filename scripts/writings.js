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
    const checked = {
      // year:   [...document.querySelectorAll('input[value="2026"], input[value="2025"], input[value="2024"], input[value="2023"]')].filter(c=>c.checked).map(c=>c.value),
            year:   [...document.querySelectorAll('input[value="2026"]')].filter(c=>c.checked).map(c=>c.value),

      topic:  [...document.querySelectorAll('input[value="design"], input[value="tech"], input[value="culture"], input[value="personal"]')].filter(c=>c.checked).map(c=>c.value),
      length: [...document.querySelectorAll('input[value="short"], input[value="medium"], input[value="long"]')].filter(c=>c.checked).map(c=>c.value),
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