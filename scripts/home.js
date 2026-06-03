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

  function fitPhotoCards() {
    const scroll = document.querySelector('.photos-scroll');
    const cards = scroll.querySelectorAll('.photo-card');
    const containerWidth = scroll.parentElement.clientWidth - 70; // account for padding
    const cardWidth = 210;
    const gap = 12;

    // How many cards fit?
    const count = Math.floor((containerWidth + gap) / (cardWidth + gap));

    cards.forEach((card, i) => {
      card.style.display = i < count ? 'flex' : 'none';
      if (count === 1) {
        card.style.transform = 'rotate(0deg)';
        cards[0].style.flex = '0 0 100%';
        cards[0].querySelector('img').style.height = 'auto';
        cards[0].querySelector('img').style.aspectRatio = '189 / 220';
        cards[0].style.padding = '14px';
        cards[0].style.gap = '10px';
        cards[0].querySelector('.caption').style.fontSize = '20px';
      } else {
        card.style.transform = ''; // restore the CSS nth-child rotation
        card.style.flex = '';
        card.querySelector('img').style.height = '';
        card.querySelector('img').style.aspectRatio = '';
        card.style.padding = '';
        card.style.gap = '';
        card.querySelector('.caption').style.fontSize = '';
      }
    });

    scroll.style.justifyContent = count <= 2 ? 'space-around' : 'space-between';
  }

  fitPhotoCards();
  window.addEventListener('resize', fitPhotoCards);