/* ===================================================================
   Shared helpers for writings — used by the post page (/writing/post/)
   and the editor (/writing/new/) so the preview matches what ships.

   Posts live in /writing/posts/:
     index.json   — list of { slug, title, date, summary, topics, words }
     <slug>.md    — the post body, in Markdown

   Needs marked + DOMPurify loaded first.
   =================================================================== */

(function () {
  const TOPICS = {
    design: "Design",
    tech: "Technology",
    culture: "Culture",
    personal: "Personal",
  };

  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  function slugify(text) {
    return String(text)
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // Rough reading word count: drops code blocks, image syntax and
  // Markdown punctuation so "## Heading" counts as one word, not two.
  function countWords(md) {
    return String(md)
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[#>*_`~|-]/g, " ")
      .split(/\s+/)
      .filter(Boolean).length;
  }

  function lengthBucket(words) {
    if (words < 500) return "short";
    if (words <= 1500) return "medium";
    return "long";
  }

  // "2025-06-04" -> "4 June 2025" (parsed by hand so time zones can't
  // shift the day).
  function formatDate(iso) {
    const [y, m, d] = String(iso).split("-").map(Number);
    if (!y || !m || !d) return "";
    return `${d} ${MONTHS[m - 1]} ${y}`;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Same markup as the rows on /writing/: date ✦ words ✦ topic tags.
  function metaHtml(post) {
    const parts = [];
    if (post.date) parts.push(`<span class="meta-dot">${escapeHtml(formatDate(post.date))}</span>`);
    if (post.words != null) {
      if (parts.length) parts.push(`<span class="meta-dot star">✦</span>`);
      parts.push(`<span class="meta-dot">${Number(post.words).toLocaleString("en-AU")} words</span>`);
    }
    const topics = (post.topics || []).filter((t) => TOPICS[t]);
    if (topics.length) {
      if (parts.length) parts.push(`<span class="meta-dot star">✦</span>`);
      topics.forEach((t) => {
        parts.push(`<span class="meta-dot"><span class="topic-tag">${TOPICS[t]}</span></span>`);
      });
    }
    return parts.join("\n");
  }

  // Renders Markdown into `target` and returns its h1–h3 headings,
  // each given a unique id so the contents nav can link to it.
  function renderMarkdown(md, target) {
    target.innerHTML = DOMPurify.sanitize(marked.parse(String(md), { gfm: true }));

    const used = new Set();
    const headings = [...target.querySelectorAll("h1, h2, h3")];
    headings.forEach((h) => {
      const base = slugify(h.textContent) || "section";
      let id = base;
      let n = 2;
      while (used.has(id) || (document.getElementById(id) && document.getElementById(id) !== h)) {
        id = `${base}-${n++}`;
      }
      used.add(id);
      h.id = id;
    });

    target.querySelectorAll('a[href^="http"]').forEach((a) => {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    });
    target.querySelectorAll("img").forEach((img) => {
      img.loading = "lazy";
      img.decoding = "async";
    });

    return headings;
  }

  // Fills the left-hand contents nav from the headings and highlights
  // whichever section is currently being read. Returns a cleanup
  // function (the editor rebuilds the nav on every preview).
  function buildToc(headings, nav) {
    const panel = nav.closest(".toc-panel");
    nav.innerHTML = "";
    panel?.classList.toggle("is-empty", headings.length === 0);
    if (!headings.length) return () => {};

    const minLevel = Math.min(...headings.map((h) => Number(h.tagName[1])));
    const links = headings.map((h) => {
      const a = document.createElement("a");
      a.href = `#${h.id}`;
      a.textContent = h.textContent;
      a.className = `toc-link toc-l${Number(h.tagName[1]) - minLevel + 1}`;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        h.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `#${h.id}`);
      });
      nav.appendChild(a);
      return a;
    });

    let activeIndex = -1;
    let ticking = false;
    function update() {
      ticking = false;
      // The last heading that has scrolled past the sticky nav wins.
      let current = 0;
      headings.forEach((h, i) => {
        if (h.getBoundingClientRect().top - 140 <= 0) current = i;
      });
      if (current !== activeIndex) {
        links.forEach((l, i) => l.classList.toggle("active", i === current));
        activeIndex = current;
      }
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }

  window.Writing = {
    TOPICS,
    slugify,
    countWords,
    lengthBucket,
    formatDate,
    escapeHtml,
    metaHtml,
    renderMarkdown,
    buildToc,
  };
})();
