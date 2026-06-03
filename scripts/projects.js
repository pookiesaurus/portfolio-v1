// // Category filter
// // Category filter — class-based so max-height transition works
//   function filterCategory(el, filter) {
//     document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
//     el.classList.add('active');

//     const panels = {
//       ux:   document.getElementById('panel-ux'),
//       cs:   document.getElementById('panel-cs'),
//       misc: document.getElementById('panel-misc'),
//     };

//     if (filter === 'all') {
//       Object.values(panels).forEach(p => p.classList.remove('collapsed'));
//     } else {
//       Object.entries(panels).forEach(([key, p]) => {
//         p.classList.toggle('collapsed', key !== filter);
//       });
//     }
//   }

//   // set initial state
//   filterCategory(document.querySelector('[data-filter="all"]'), 'all');

// function filterCategory(el, filter) {
//   document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
//   el.classList.add('active');

//   const panels = {
//     ux:   document.getElementById('panel-ux'),
//     cs:   document.getElementById('panel-cs'),
//     misc: document.getElementById('panel-misc'),
//   };

//   const selectedWorks = document.querySelector('.selected-works');

//   if (filter === 'all') {
//     Object.values(panels).forEach(p => p.classList.remove('collapsed'));
//     selectedWorks.classList.add('grid-mode');
//   } else {
//     Object.entries(panels).forEach(([key, p]) => {
//       p.classList.toggle('collapsed', key !== filter);
//     });
//     selectedWorks.classList.remove('grid-mode');
//   }
// }

// filterCategory(document.querySelector('[data-filter="all"]'), 'all');

function filterCategory(el, filter) {
  document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');

  const panels = {
    ux:   document.getElementById('panel-ux'),
    cs:   document.getElementById('panel-cs'),
    misc: document.getElementById('panel-misc'),
  };

  const selectedWorks = document.querySelector('.selected-works');

  // fade out
  selectedWorks.style.opacity = '0';
  selectedWorks.style.transform = 'translateY(6px)';

  setTimeout(() => {
    if (filter === 'all') {
      Object.values(panels).forEach(p => p.classList.remove('collapsed'));
      selectedWorks.classList.add('grid-mode');
    } else {
      Object.entries(panels).forEach(([key, p]) => {
        p.classList.toggle('collapsed', key !== filter);
      });
      selectedWorks.classList.remove('grid-mode');
    }

    // fade back in
    selectedWorks.style.opacity = '1';
    selectedWorks.style.transform = 'translateY(0)';
  }, 200);
}


filterCategory(document.querySelector('[data-filter="all"]'), 'all');