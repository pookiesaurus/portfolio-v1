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
      year:   [...document.querySelectorAll('input[value="2025"], input[value="2024"], input[value="2023"]')].filter(c=>c.checked).map(c=>c.value),
      topic:  [...document.querySelectorAll('input[value="design"], input[value="tech"], input[value="culture"], input[value="personal"]')].filter(c=>c.checked).map(c=>c.value),
      length: [...document.querySelectorAll('input[value="short"], input[value="medium"], input[value="long"]')].filter(c=>c.checked).map(c=>c.value),
    };
 
    const anyActive = checked.year.length || checked.topic.length || checked.length.length;
    document.getElementById('clearBtn').classList.toggle('visible', !!anyActive);
 
    const rows = document.querySelectorAll('.article-row');
    let visible = 0;
 
    rows.forEach(row => {
      const yearMatch  = !checked.year.length   || checked.year.includes(row.dataset.year);
      const topicMatch = !checked.topic.length  || checked.topic.includes(row.dataset.topic);
      const lenMatch   = !checked.length.length || checked.length.includes(row.dataset.length);
 
      if (yearMatch && topicMatch && lenMatch) {
        row.classList.remove('hidden');
        visible++;
      } else {
        row.classList.add('hidden');
      }
    });
 
    document.getElementById('emptyState').classList.toggle('visible', visible === 0);
  }
 
  function clearFilters() {
    document.querySelectorAll('.filter-option input').forEach(c => c.checked = false);
    applyFilters();
  }