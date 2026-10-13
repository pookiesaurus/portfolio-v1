/* Post page — /writing/post/?p=<slug>
   Loads the post's details from /writing/posts/index.json and its body
   from /writing/posts/<slug>.md, then builds the contents nav. */

(async function () {
  const titleEl = document.getElementById("postTitle");
  const metaEl = document.getElementById("postMeta");
  const bodyEl = document.getElementById("postBody");
  const tocEl = document.getElementById("toc");

  function showMissing() {
    titleEl.textContent = "Not found";
    document.title = "Not found · Writings";
    metaEl.innerHTML = "";
    bodyEl.innerHTML =
      '<p>This writing doesn\'t exist, or hasn\'t gone live yet. <a href="/writing/">Back to all writings</a>.</p>';
    Writing.buildToc([], tocEl);
  }

  const slug = new URLSearchParams(location.search).get("p") || "";
  if (!/^[a-z0-9-]+$/.test(slug)) return showMissing();

  try {
    const [index, md] = await Promise.all([
      fetch("/writing/posts/index.json", { cache: "no-cache" }).then((r) => (r.ok ? r.json() : [])),
      fetch(`/writing/posts/${slug}.md`, { cache: "no-cache" }).then((r) => (r.ok ? r.text() : null)),
    ]);
    const post = index.find((p) => p.slug === slug);
    if (!post || md == null) return showMissing();

    titleEl.textContent = post.title;
    document.title = `${post.title} · Writings`;
    if (post.summary) {
      document.querySelector('meta[name="description"]')?.setAttribute("content", post.summary);
    }
    metaEl.innerHTML = Writing.metaHtml(post);
    const headings = Writing.renderMarkdown(md, bodyEl);
    Writing.buildToc(headings, tocEl);

    // Honour a #section in the URL once the headings exist.
    if (location.hash) {
      document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
    }
  } catch (err) {
    console.error(err);
    showMissing();
  }
})();
