// Snippets scroll buttons
  function scrollSnippets(dir) {
    const el = document.getElementById('snippetsScroll');
    const amount = 200; 
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