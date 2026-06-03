// Category filter
// Category filter — class-based so max-height transition works
  function filterCategory(el, filter) {
    document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');

    const panels = {
      ux:   document.getElementById('panel-ux'),
      cs:   document.getElementById('panel-cs'),
      misc: document.getElementById('panel-misc'),
    };

    if (filter === 'all') {
      Object.values(panels).forEach(p => p.classList.remove('collapsed'));
    } else {
      Object.entries(panels).forEach(([key, p]) => {
        p.classList.toggle('collapsed', key !== filter);
      });
    }
  }

  // set initial state
  filterCategory(document.querySelector('[data-filter="all"]'), 'all');