/* ===================================================================
   Writing editor — /writing/new/

   Write in Markdown, preview it exactly as the post page shows it, then
   Publish. Publishing commits straight to the GitHub repo through the
   GitHub API (the site is static, so there is no server to save to):

     writing/posts/<slug>.md          the post body
     writing/posts/index.json         the list /writing/ reads
     writing/posts/images/<file>.webp images pasted or dropped in

   GitHub Pages then redeploys, usually within a minute or two.

   The GitHub token is kept only in this browser's localStorage. Use a
   fine-grained token limited to this one repo with
   "Contents: Read and write" and nothing else.
   =================================================================== */

(function () {
  const REPO = { owner: "pookiesaurus", repo: "portfolio-v1", branch: "main" };
  const POSTS_DIR = "writing/posts";
  const TOKEN_KEY = "writingEditor.token";
  const DRAFT_KEY = "writingEditor.draft";
  const MAX_IMAGE_WIDTH = 1600;

  const $ = (id) => document.getElementById(id);
  const els = {
    existing: $("existing"),
    title: $("title"),
    slug: $("slug"),
    date: $("date"),
    summary: $("summary"),
    topics: [...document.querySelectorAll('input[name="topic"]')],
    body: $("body"),
    stats: $("stats"),
    publish: $("publishBtn"),
    status: $("status"),
    token: $("token"),
    saveToken: $("saveTokenBtn"),
    tokenStatus: $("tokenStatus"),
    writeView: $("writeView"),
    previewView: $("previewView"),
    tabs: [...document.querySelectorAll(".editor-tabs [data-tab]")],
    heroTitle: $("heroTitle"),
    previewMeta: $("previewMeta"),
    previewBody: $("previewBody"),
    toc: $("toc"),
    writeCard: document.querySelector(".editor-write"),
    imageInput: $("imageInput"),
  };

  let editingSlug = null; // set when an existing post is loaded
  let slugTouched = false; // stop auto-slugging once the link is edited by hand
  let dirty = false;
  let tocCleanup = () => {};
  const localImages = new Map(); // repo path -> object URL, for previewing before deploy

  /* ---------------- storage (can throw in private windows) ---------------- */

  function store(key, value) {
    try {
      if (value == null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch {}
  }
  function load(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  const getToken = () => load(TOKEN_KEY) || "";

  /* ---------------- status line ---------------- */

  function setStatus(html, kind) {
    els.status.innerHTML = html;
    els.status.className = `editor-status${kind ? ` is-${kind}` : ""}`;
  }

  /* ---------------- GitHub API ---------------- */

  async function gh(path, { method = "GET", body, allow404 = false } = {}) {
    const token = getToken();
    if (!token) throw new Error("Connect GitHub first (GitHub connection, below).");
    const res = await fetch(`https://api.github.com/repos/${REPO.owner}/${REPO.repo}${path ? `/${path}` : ""}`, {
      method,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (allow404 && res.status === 404) return null;
    if (!res.ok) {
      let msg = `${res.status} ${res.statusText}`;
      try {
        msg = (await res.json()).message || msg;
      } catch {}
      if (res.status === 401) msg = "GitHub rejected the token. It may have expired.";
      if (res.status === 403 || res.status === 404) msg += " (check the token can write to this repo)";
      throw new Error(msg);
    }
    return res.json();
  }

  function bytesToBase64(bytes) {
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(bin);
  }
  const textToBase64 = (text) => bytesToBase64(new TextEncoder().encode(text));
  function base64ToText(b64) {
    const bin = atob(b64.replace(/\n/g, ""));
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  }

  // Returns { sha, text } or null when the file doesn't exist yet.
  async function getFile(path) {
    const data = await gh(`contents/${path}?ref=${REPO.branch}`, { allow404: true });
    return data ? { sha: data.sha, text: base64ToText(data.content) } : null;
  }

  function putFile(path, base64, message, sha) {
    return gh(`contents/${path}`, {
      method: "PUT",
      body: { message, content: base64, branch: REPO.branch, ...(sha ? { sha } : {}) },
    });
  }

  // Prefer the repo (always fresh) when connected; otherwise the live site.
  async function fetchIndex() {
    if (getToken()) {
      const file = await getFile(`${POSTS_DIR}/index.json`);
      return file ? JSON.parse(file.text) : [];
    }
    const res = await fetch(`/${POSTS_DIR}/index.json`, { cache: "no-cache" });
    return res.ok ? res.json() : [];
  }

  async function fetchBody(slug) {
    if (getToken()) {
      const file = await getFile(`${POSTS_DIR}/${slug}.md`);
      if (file) return file.text;
    }
    const res = await fetch(`/${POSTS_DIR}/${slug}.md`, { cache: "no-cache" });
    if (!res.ok) throw new Error("Couldn't load that post.");
    return res.text();
  }

  /* ---------------- form state ---------------- */

  function today() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function readForm() {
    return {
      title: els.title.value.trim(),
      slug: els.slug.value.trim(),
      date: els.date.value,
      summary: els.summary.value.trim(),
      topics: els.topics.filter((t) => t.checked).map((t) => t.value),
      body: els.body.value,
    };
  }

  function fillForm(data) {
    els.title.value = data.title || "";
    els.slug.value = data.slug || "";
    els.date.value = data.date || today();
    els.summary.value = data.summary || "";
    els.topics.forEach((t) => (t.checked = (data.topics || []).includes(t.value)));
    els.body.value = data.body || "";
    updateStats();
  }

  function setEditing(slug) {
    editingSlug = slug;
    slugTouched = !!slug;
    els.slug.readOnly = !!slug; // changing a live post's link would break shared links
    els.publish.textContent = slug ? "Update" : "Publish";
    els.existing.value = slug || "";
  }

  function updateStats() {
    const words = Writing.countWords(els.body.value);
    els.stats.textContent = `${words.toLocaleString("en-AU")} words · ${Writing.lengthBucket(words)}`;
  }

  let draftTimer = null;
  function onChange() {
    dirty = true;
    updateStats();
    clearTimeout(draftTimer);
    draftTimer = setTimeout(() => {
      store(DRAFT_KEY, JSON.stringify({ ...readForm(), editingSlug }));
    }, 400);
  }

  /* ---------------- existing posts ---------------- */

  async function refreshExisting() {
    try {
      const posts = await fetchIndex();
      const current = els.existing.value;
      els.existing.innerHTML = '<option value="">New writing</option>';
      posts.forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p.slug;
        opt.textContent = p.title;
        els.existing.appendChild(opt);
      });
      els.existing.value = current;
      return posts;
    } catch (err) {
      setStatus(Writing.escapeHtml(err.message), "error");
      return [];
    }
  }

  els.existing.addEventListener("change", async () => {
    const slug = els.existing.value;
    if (dirty && !confirm("Discard the changes you haven't published?")) {
      els.existing.value = editingSlug || "";
      return;
    }
    if (!slug) {
      setEditing(null);
      fillForm({});
      dirty = false;
      store(DRAFT_KEY, null);
      setStatus("");
      return;
    }
    try {
      setStatus("Loading…");
      const posts = await fetchIndex();
      const post = posts.find((p) => p.slug === slug);
      const body = await fetchBody(slug);
      setEditing(slug);
      fillForm({ ...post, body });
      dirty = false;
      setStatus(`Editing “${Writing.escapeHtml(post.title)}”.`);
    } catch (err) {
      setStatus(Writing.escapeHtml(err.message), "error");
    }
  });

  /* ---------------- details fields ---------------- */

  els.title.addEventListener("input", () => {
    if (!slugTouched && !editingSlug) els.slug.value = Writing.slugify(els.title.value);
    onChange();
  });
  els.slug.addEventListener("input", () => {
    slugTouched = els.slug.value !== "";
    els.slug.value = els.slug.value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    onChange();
  });
  [els.date, els.summary, els.body].forEach((el) => el.addEventListener("input", onChange));
  els.topics.forEach((t) => t.addEventListener("change", onChange));

  /* ---------------- toolbar + shortcuts ---------------- */

  function replaceSelection(fn) {
    const ta = els.body;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const { text, selStart, selEnd } = fn(value.slice(s, e));
    ta.focus();
    ta.setRangeText(text, s, e, "end");
    if (selStart != null) ta.setSelectionRange(s + selStart, s + selEnd);
    onChange();
  }

  function wrap(before, after = before, placeholder = "text") {
    replaceSelection((sel) => {
      const inner = sel || placeholder;
      return { text: before + inner + after, selStart: before.length, selEnd: before.length + inner.length };
    });
  }

  // Applies a prefix ("## ", "> ", "- ") to every selected line,
  // replacing any heading/quote/list prefix already there.
  function prefixLines(prefix) {
    const ta = els.body;
    const start = ta.value.lastIndexOf("\n", ta.selectionStart - 1) + 1;
    let end = ta.value.indexOf("\n", ta.selectionEnd);
    if (end === -1) end = ta.value.length;
    ta.setSelectionRange(start, end);
    replaceSelection((sel) => {
      const text = sel
        .split("\n")
        .map((line) => prefix + line.replace(/^(#{1,6} |> |- |\d+\. )/, ""))
        .join("\n");
      return { text, selStart: text.length, selEnd: text.length };
    });
  }

  const actions = {
    h1: () => prefixLines("# "),
    h2: () => prefixLines("## "),
    h3: () => prefixLines("### "),
    bold: () => wrap("**"),
    italic: () => wrap("*"),
    link: () =>
      replaceSelection((sel) => {
        const label = sel || "link text";
        return { text: `[${label}](https://)`, selStart: label.length + 3, selEnd: label.length + 11 };
      }),
    quote: () => prefixLines("> "),
    list: () => prefixLines("- "),
    divider: () =>
      replaceSelection(() => ({ text: "\n\n---\n\n", selStart: null, selEnd: null })),
    image: () => els.imageInput.click(),
  };

  document.querySelectorAll(".editor-toolbar [data-action]").forEach((btn) => {
    btn.addEventListener("click", () => actions[btn.dataset.action]());
  });

  els.body.addEventListener("keydown", (e) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    const key = e.key.toLowerCase();
    if (key === "b") actions.bold();
    else if (key === "i") actions.italic();
    else if (key === "k") actions.link();
    else return;
    e.preventDefault();
  });

  /* ---------------- images ---------------- */

  // Shrinks to MAX_IMAGE_WIDTH and re-encodes as WebP, the same
  // treatment the rest of the site's images got.
  async function toWebp(file) {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_WIDTH / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    return new Promise((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't convert image"))), "image/webp", 0.82)
    );
  }

  async function uploadImages(files) {
    const images = [...files].filter((f) => f.type.startsWith("image/"));
    if (!images.length) return;
    if (!getToken()) {
      setStatus("Connect GitHub first to add images (GitHub connection, below).", "error");
      return;
    }
    for (const file of images) {
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      const marker = `![Uploading ${alt}…]()`;
      replaceSelection(() => ({ text: `\n${marker}\n`, selStart: null, selEnd: null }));
      try {
        setStatus(`Uploading ${Writing.escapeHtml(file.name)}…`);
        const blob = await toWebp(file);
        const name = `${els.slug.value || "post"}-${Date.now().toString(36)}.webp`;
        const repoPath = `${POSTS_DIR}/images/${name}`;
        const bytes = new Uint8Array(await blob.arrayBuffer());
        await putFile(repoPath, bytesToBase64(bytes), `Add image for writing: ${name}`);
        localImages.set(`/${repoPath}`, URL.createObjectURL(blob));
        els.body.value = els.body.value.replace(marker, `![${alt}](/${repoPath})`);
        setStatus(`Added ${Writing.escapeHtml(file.name)}.`, "ok");
      } catch (err) {
        els.body.value = els.body.value.replace(`\n${marker}\n`, "\n");
        setStatus(`Image upload failed: ${Writing.escapeHtml(err.message)}`, "error");
      }
      onChange();
    }
  }

  els.imageInput.addEventListener("change", () => {
    uploadImages(els.imageInput.files);
    els.imageInput.value = "";
  });
  els.body.addEventListener("paste", (e) => {
    const files = [...(e.clipboardData?.files || [])];
    if (files.some((f) => f.type.startsWith("image/"))) {
      e.preventDefault();
      uploadImages(files);
    }
  });
  els.writeCard.addEventListener("dragover", (e) => {
    if ([...e.dataTransfer.types].includes("Files")) {
      e.preventDefault();
      els.writeCard.classList.add("is-dragging");
    }
  });
  els.writeCard.addEventListener("dragleave", () => els.writeCard.classList.remove("is-dragging"));
  els.writeCard.addEventListener("drop", (e) => {
    els.writeCard.classList.remove("is-dragging");
    if (e.dataTransfer.files.length) {
      e.preventDefault();
      uploadImages(e.dataTransfer.files);
    }
  });

  /* ---------------- write / preview ---------------- */

  function showTab(tab) {
    const preview = tab === "preview";
    els.tabs.forEach((t) => t.setAttribute("aria-pressed", String(t.dataset.tab === tab)));
    els.writeView.hidden = preview;
    els.previewView.hidden = !preview;
    tocCleanup();
    if (!preview) {
      els.heroTitle.textContent = editingSlug ? "Edit writing" : "New writing";
      return;
    }
    const data = readForm();
    els.heroTitle.textContent = data.title || "Untitled";
    els.previewMeta.innerHTML = Writing.metaHtml({ ...data, words: Writing.countWords(data.body) });
    const headings = Writing.renderMarkdown(data.body || "*Nothing written yet.*", els.previewBody);
    // Images uploaded this session aren't deployed yet; show local copies.
    els.previewBody.querySelectorAll("img").forEach((img) => {
      const local = localImages.get(img.getAttribute("src"));
      if (local) img.src = local;
    });
    tocCleanup = Writing.buildToc(headings, els.toc);
    window.scrollTo({ top: 0 });
  }

  els.tabs.forEach((t) => t.addEventListener("click", () => showTab(t.dataset.tab)));

  /* ---------------- publish ---------------- */

  async function publish() {
    const data = readForm();
    if (!data.title) return setStatus("Add a title first.", "error");
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(data.slug)) {
      return setStatus("The link can only use lowercase letters, numbers and single dashes.", "error");
    }
    if (!data.date) return setStatus("Pick a date.", "error");
    if (!data.body.trim()) return setStatus("Write something first.", "error");
    if (data.body.includes("![Uploading")) return setStatus("Wait for images to finish uploading.", "error");

    els.publish.disabled = true;
    try {
      setStatus("Publishing…");
      const indexFile = await getFile(`${POSTS_DIR}/index.json`);
      const posts = indexFile ? JSON.parse(indexFile.text) : [];
      if (!editingSlug && posts.some((p) => p.slug === data.slug)) {
        throw new Error("Another writing already uses that link. Change the link, or pick it from “Edit existing”.");
      }

      const verb = editingSlug ? "Update" : "Publish";
      const mdPath = `${POSTS_DIR}/${data.slug}.md`;
      const existingMd = await getFile(mdPath);
      const body = data.body.endsWith("\n") ? data.body : `${data.body}\n`;
      await putFile(mdPath, textToBase64(body), `${verb} writing: ${data.title}`, existingMd?.sha);

      const entry = {
        slug: data.slug,
        title: data.title,
        date: data.date,
        summary: data.summary,
        topics: data.topics,
        words: Writing.countWords(data.body),
      };
      const next = posts.filter((p) => p.slug !== data.slug).concat(entry);
      next.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
      await putFile(
        `${POSTS_DIR}/index.json`,
        textToBase64(`${JSON.stringify(next, null, 2)}\n`),
        `${verb} writings list: ${data.title}`,
        indexFile?.sha
      );

      dirty = false;
      store(DRAFT_KEY, null);
      await refreshExisting();
      setEditing(data.slug);
      const url = `/writing/post/?p=${data.slug}`;
      setStatus(
        `${verb === "Publish" ? "Published" : "Updated"}. It goes live in a minute or two at <a href="${url}">${url}</a>.`,
        "ok"
      );
    } catch (err) {
      setStatus(Writing.escapeHtml(err.message), "error");
    } finally {
      els.publish.disabled = false;
    }
  }

  els.publish.addEventListener("click", publish);

  /* ---------------- GitHub connection ---------------- */

  function showTokenState() {
    const has = !!getToken();
    els.token.value = "";
    els.token.placeholder = has ? "Connected. Paste a new token to replace it" : "github_pat_…";
    els.saveToken.textContent = has ? "Disconnect" : "Connect";
  }

  els.saveToken.addEventListener("click", async () => {
    const value = els.token.value.trim();
    if (!value && getToken()) {
      store(TOKEN_KEY, null);
      els.tokenStatus.textContent = "Disconnected. The token was removed from this browser.";
      showTokenState();
      return;
    }
    if (!value) return;
    store(TOKEN_KEY, value);
    els.tokenStatus.textContent = "Checking…";
    try {
      const repo = await gh("");
      if (!repo.permissions?.push) throw new Error("This token can read the repo but not write to it.");
      els.tokenStatus.textContent = `Connected to ${repo.full_name}.`;
      refreshExisting();
    } catch (err) {
      store(TOKEN_KEY, null);
      els.tokenStatus.textContent = err.message;
    }
    showTokenState();
  });
  els.token.addEventListener("input", () => {
    els.saveToken.textContent = els.token.value.trim() ? "Connect" : getToken() ? "Disconnect" : "Connect";
  });

  /* ---------------- start up ---------------- */

  window.addEventListener("beforeunload", (e) => {
    if (dirty) e.preventDefault();
  });

  showTokenState();
  if (!getToken()) {
    document.querySelector(".editor-settings").open = true;
  }

  let draft = null;
  try {
    draft = JSON.parse(load(DRAFT_KEY) || "null");
  } catch {}
  refreshExisting().then(() => {
    if (draft) {
      setEditing(draft.editingSlug || null);
      fillForm(draft);
      dirty = true;
      setStatus("Restored your unpublished draft.");
    } else {
      setEditing(null);
      fillForm({});
    }
    slugTouched = !!draft?.slug && draft.slug !== Writing.slugify(draft.title || "");
  });
})();
