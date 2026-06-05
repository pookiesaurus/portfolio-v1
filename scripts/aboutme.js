// Snippets scroll buttons
  function getSnippetsScrollAmount(el) {
    const firstCard = el.querySelector('.photo-card');
    if (!firstCard) return 205;

    const cardWidth = firstCard.getBoundingClientRect().width || 205;
    const gapValue = parseFloat(getComputedStyle(el).gap) || 10;
    const visibleCards = Math.floor((el.clientWidth + gapValue) / (cardWidth + gapValue));

    let amount;
    if (visibleCards < 4) {
      amount = cardWidth * 2 + gapValue;
    } else {
      const cardsToScroll = Math.max(1, visibleCards - 2);
      amount = cardsToScroll * cardWidth + Math.max(0, cardsToScroll - 1) * gapValue;
    }

    return Math.max(cardWidth, Math.round(amount));
  }

  function scrollSnippets(dir) {
    const el = document.getElementById('snippetsScroll');
    const amount = getSnippetsScrollAmount(el);
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  }
 
  function updateSnippetButtons() {
    const el = document.getElementById('snippetsScroll');
    const leftBtn  = document.getElementById('snippetLeft');
    const rightBtn = document.getElementById('snippetRight');
    const atStart  = el.scrollLeft <= 2;
    const atEnd    = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
    leftBtn.classList.toggle('dimmed',  atStart);
    rightBtn.classList.toggle('dimmed', atEnd);
  }
 
  document.getElementById('snippetsScroll').addEventListener('scroll', updateSnippetButtons, { passive: true });
  updateSnippetButtons();