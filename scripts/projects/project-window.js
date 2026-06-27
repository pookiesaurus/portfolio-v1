/* ===================================================================
   Project Window Engine
   Vanilla JS, no dependencies. Opens project data (see project-data.js)
   into draggable, resizable "OS window" style panels.

   USAGE ON A PAGE:
   1. Link project-window.css and this file.
   2. Link project-data.js (defines window.PROJECTS array).
   3. Give each project trigger element:
        <div class="pw-trigger" data-project-id="creative-futures">...
   4. Call ProjectWindows.init() after DOM load (auto-runs on DOMContentLoaded).
   =================================================================== */

(function () {
  "use strict";

  const STACK_BASE_Z = 901;
  const CASCADE_OFFSET = 28;
  const MOBILE_BREAKPOINT = 720;

  let layer = null;
  let taskbar = null;
  let zCounter = STACK_BASE_Z;
  let openCount = 0;
  /** @type {Map<string, HTMLElement>} projectId -> window element (for single-instance behavior) */
  const openWindows = new Map();

  function ensureLayer() {
    if (layer) return layer;
    layer = document.createElement("div");
    layer.className = "pw-layer";
    document.body.appendChild(layer);

    taskbar = document.createElement("div");
    taskbar.className = "pw-taskbar";
    document.body.appendChild(taskbar);

    return layer;
  }

  /* ---------------- Lightbox (click a photo to expand it) ---------------- */

  let lightboxEl = null;
  let lightboxImg = null;
  let lightboxPrevFocus = null;

  function ensureLightbox() {
    if (lightboxEl) return lightboxEl;

    lightboxEl = document.createElement("div");
    lightboxEl.className = "pw-lightbox";
    lightboxEl.setAttribute("role", "dialog");
    lightboxEl.setAttribute("aria-modal", "true");
    lightboxEl.setAttribute("aria-label", "Expanded image");
    lightboxEl.innerHTML = `
      <button class="pw-lightbox-close" type="button" aria-label="Close">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M3 3l10 10M13 3 3 13"/>
        </svg>
      </button>
      <img class="pw-lightbox-img" alt="">
    `;
    document.body.appendChild(lightboxEl);

    lightboxImg = lightboxEl.querySelector(".pw-lightbox-img");

    // Click anywhere on the dimmed backdrop (not the image itself) closes it.
    lightboxEl.addEventListener("click", (e) => {
      if (e.target === lightboxEl) closeLightbox();
    });
    lightboxEl.querySelector(".pw-lightbox-close").addEventListener("click", closeLightbox);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightboxEl.classList.contains("pw-lightbox-open")) {
        closeLightbox();
      }
    });

    return lightboxEl;
  }

  function openLightbox(src, alt) {
    ensureLightbox();
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightboxPrevFocus = document.activeElement;
    lightboxEl.classList.add("pw-lightbox-open");
    document.body.classList.add("pw-lightbox-locked");
    lightboxEl.querySelector(".pw-lightbox-close").focus();
  }

  function closeLightbox() {
    if (!lightboxEl) return;
    lightboxEl.classList.remove("pw-lightbox-open");
    document.body.classList.remove("pw-lightbox-locked");
    // small delay so the fade-out transition finishes before clearing src
    setTimeout(() => {
      if (lightboxImg && !lightboxEl.classList.contains("pw-lightbox-open")) {
        lightboxImg.src = "";
      }
    }, 200);
    if (lightboxPrevFocus && typeof lightboxPrevFocus.focus === "function") {
      lightboxPrevFocus.focus();
    }
  }

  // Event delegation on the document — works for images inside any
  // window, including ones opened after this listener is attached, and
  // also for customHTML projects that include their own images with
  // the pw-lightbox-trigger class.
  document.addEventListener("click", (e) => {
    const img = e.target.closest(".pw-lightbox-trigger");
    if (!img) return;
    openLightbox(img.src, img.alt);
  });

  function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }

  function getProjectById(id) {
    const list = window.PROJECTS || [];
    return list.find((p) => p.id === id);
  }

  /* ---------------- Rendering project data into HTML ---------------- */

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  // Detects YouTube / Vimeo links and converts them to embed URLs.
  // Returns null if the URL doesn't match either, meaning it should be
  // treated as a direct video file (mp4/webm/mov) instead.
  function getVideoEmbedUrl(url) {
    if (!url) return null;

    const yt =
      url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
    if (yt) {
      return `https://www.youtube.com/embed/${yt[1]}`;
    }

    const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeo) {
      return `https://player.vimeo.com/video/${vimeo[1]}`;
    }

    return null;
  }

  function renderVideoBlock(block) {
    const src = block.src || "";
    const embedUrl = getVideoEmbedUrl(src);
    const caption = block.caption
      ? `<figcaption class="pw-video-caption">${escapeHtml(block.caption)}</figcaption>`
      : "";

    let media;
    if (embedUrl) {
      // YouTube / Vimeo: needs the 16:9 wrapper since iframes don't
      // respect aspect-ratio the way <video> does automatically.
      media = `
        <div class="pw-video-frame">
          <iframe
            src="${escapeHtml(embedUrl)}"
            title="${escapeHtml(block.label || "Project video")}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            loading="lazy"></iframe>
        </div>`;
    } else {
      // Direct video file
      media = `
        <video class="pw-video-native" controls preload="metadata"
          ${block.poster ? `poster="${escapeHtml(block.poster)}"` : ""}>
          <source src="${escapeHtml(src)}">
          Your browser doesn't support embedded video.
        </video>`;
    }

    return `
      <div class="pw-block pw-block-video">
        ${block.label ? `<p class="pw-block-label">${escapeHtml(block.label)}</p>` : ""}
        ${media}
        ${caption}
      </div>`;
  }

  function renderInfoStats(info) {
    if (!info) return "";

    const stats = [];

    if (info.timeline) {
      stats.push({ label: "Timeline", value: escapeHtml(info.timeline) });
    }
    if (info.role) {
      stats.push({ label: "Role", value: escapeHtml(info.role) });
    }
    if (info.team && info.team.length) {
      const teamHtml = info.team
        .map((member) => {
          if (typeof member === "string") {
            return `<span class="pw-stat-team-member">${escapeHtml(member)}</span>`;
          }
          const name = escapeHtml(member.name || "");
          const role = member.role
            ? `<span class="pw-stat-team-role">${escapeHtml(member.role)}</span>`
            : "";
          return `<span class="pw-stat-team-member">${name}${role}</span>`;
        })
        .join("");
      stats.push({
        label: info.team.length === 1 ? "Team member" : "Team",
        value: teamHtml,
        isTeam: true,
      });
    }
    if (info.disciplines && info.disciplines.length) {
      const discHtml = info.disciplines
        .map((d) => `<span class="pw-stat-chip">${escapeHtml(d)}</span>`)
        .join("");
      stats.push({ label: "Disciplines", value: discHtml, isChips: true });
    }

    if (!stats.length) return "";

    return `
      <div class="pw-info-stats">
        ${stats
          .map(
            (s) => `
          <div class="pw-stat ${s.isTeam ? "pw-stat-team" : ""} ${s.isChips ? "pw-stat-chips" : ""}">
            <p class="pw-stat-label">${escapeHtml(s.label)}</p>
            <div class="pw-stat-value">${s.value}</div>
          </div>`
          )
          .join("")}
      </div>`;
  }

  // Simple icon glyphs for common link kinds, looked up by lowercased
  // label so e.g. "GitHub" / "github" both get the same icon. Falls
  // back to a generic arrow for anything not in this list.
  function getLinkIconSvg(label) {
    const key = (label || "").toLowerCase().trim();
    if (key.includes("github")) {
      return `<svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>`;
    }
    if (key.includes("figma")) {
      return `<svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M5.5 16c1.38 0 2.5-1.12 2.5-2.5V11h-2.5C4.12 11 3 12.12 3 13.5S4.12 16 5.5 16ZM3 8c0-1.38 1.12-2.5 2.5-2.5H8v5H5.5C4.12 10.5 3 9.38 3 8ZM3 2.5C3 1.12 4.12 0 5.5 0h2.5v5H5.5C4.12 5 3 3.88 3 2.5ZM8 0h2.5C11.88 0 13 1.12 13 2.5S11.88 5 10.5 5H8V0ZM13 8c0 1.38-1.12 2.5-2.5 2.5S8 9.38 8 8s1.12-2.5 2.5-2.5S13 6.62 13 8Z"/></svg>`;
    }
    if (key.includes("live") || key.includes("demo") || key.includes("site") || key.includes("visit")) {
      return `<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="6.5"/><path d="M2 8h12M8 1.5c1.8 1.8 2.8 4 2.8 6.5S9.8 12.7 8 14.5c-1.8-1.8-2.8-4-2.8-6.5S6.2 3.3 8 1.5Z"/></svg>`;
    }
    // generic external-link arrow
    return `<svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 3h7v7M13 3 3 13"/></svg>`;
  }

  function renderLinkRow(links) {
    if (!links || !links.length) return "";

    const buttons = links
      .filter((l) => l && l.url)
      .map((l) => {
        const label = l.label || "Link";
        const url = l.url.trim();
        if (!isSafeUrl(url)) return "";
        return `
          <a class="pw-link-btn" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
            ${getLinkIconSvg(label)}
            <span>${escapeHtml(label)}</span>
          </a>`;
      })
      .join("");

    if (!buttons) return "";

    return `<div class="pw-link-row">${buttons}</div>`;
  }

  // Parses a text block's content for lightweight markup:
  //   a line starting with "## " becomes a subheading
  //   blank lines separate paragraphs (same as before)
  // Everything else renders as plain paragraphs, exactly as it did
  // when content was just escaped and dropped in with pre-wrap.
  // Only allow safe URL schemes through inline links — blocks
  // javascript:, data:, vbscript: etc. from sneaking in via [label](url).
  function isSafeUrl(url) {
    return /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(url.trim());
  }

  // Parses [label](url) markdown-style links within a line of text and
  // returns safe HTML — every text/url piece is escaped individually,
  // so raw HTML can never sneak in through either side of the syntax.
  function renderInlineLinks(text) {
    const linkPattern = /\[([^\]]+)\]\(([^)\s]+)\)/g;
    let result = "";
    let lastIndex = 0;
    let match;

    while ((match = linkPattern.exec(text)) !== null) {
      result += escapeHtml(text.slice(lastIndex, match.index));
      const label = escapeHtml(match[1]);
      const rawUrl = match[2];
      if (isSafeUrl(rawUrl)) {
        const url = escapeHtml(rawUrl);
        result += `<a href="${url}" class="pw-inline-link" target="_blank" rel="noopener noreferrer">${label}</a>`;
      } else {
        // Unsafe scheme — render as plain text instead of a link.
        result += label;
      }
      lastIndex = match.index + match[0].length;
    }
    result += escapeHtml(text.slice(lastIndex));
    return result;
  }

  function renderTextContent(content) {
    if (!content) return "";

    const lines = String(content).split("\n");
    const htmlParts = [];
    let paragraphLines = [];

    function flushParagraph() {
      if (!paragraphLines.length) return;
      const text = paragraphLines.join("\n").trim();
      if (text) {
        htmlParts.push(`<p class="pw-block-paragraph">${renderInlineLinks(text)}</p>`);
      }
      paragraphLines = [];
    }

    lines.forEach((line) => {
      const headingMatch = line.match(/^##\s+(.*)$/);
      if (headingMatch) {
        flushParagraph();
        htmlParts.push(`<h3 class="pw-subheading">${renderInlineLinks(headingMatch[1].trim())}</h3>`);
        return;
      }
      if (line.trim() === "") {
        flushParagraph();
        return;
      }
      paragraphLines.push(line);
    });
    flushParagraph();

    return htmlParts.join("");
  }

  function renderProjectBody(project) {
    const meta = (project.tags || [])
      .concat(project.date ? [] : [])
      .slice();

    const metaItems = [];
    if (project.date) metaItems.push(project.date);
    (project.tags || []).forEach((t) => metaItems.push(t));

    const metaHtml = metaItems.length
      ? `<div class="pw-meta">${metaItems
          .map((m) => `<span>${escapeHtml(m)}</span>`)
          .join("")}</div>`
      : "";

    const galleryHtml =
      project.gallery && project.gallery.length
        ? `<div class="pw-gallery">${project.gallery
            .map(
              (src) =>
                `<img src="${escapeHtml(src)}" alt="${escapeHtml(
                  project.title || ""
                )}" loading="lazy" class="pw-lightbox-trigger">`
            )
            .join("")}</div>`
        : "";

    const blocksHtml = (project.blocks || [])
      .map((block) => {
        if (block.type === "text") {
          return `
            <div class="pw-block">
              ${block.label ? `<p class="pw-block-label">${escapeHtml(block.label)}</p>` : ""}
              <div class="pw-block-text">${renderTextContent(block.content)}</div>
            </div>`;
        }
        if (block.type === "images") {
          const figs = (block.items || [])
            .map(
              (item) => `
              <figure>
                <img src="${escapeHtml(item.src)}" alt="${escapeHtml(
                item.caption || project.title || ""
              )}" loading="lazy" class="pw-lightbox-trigger">
                ${item.caption ? `<figcaption>${escapeHtml(item.caption)}</figcaption>` : ""}
              </figure>`
            )
            .join("");
          return `
            <div class="pw-block">
              ${block.label ? `<p class="pw-block-label">${escapeHtml(block.label)}</p>` : ""}
              <div class="pw-block-images">${figs}</div>
            </div>`;
        }
        if (block.type === "video") {
          return renderVideoBlock(block);
        }
        return "";
      })
      .join("");

    return `
      ${project.eyebrow ? `<p class="pw-eyebrow">${escapeHtml(project.eyebrow)}</p>` : ""}
      <h1 class="pw-h1">${escapeHtml(project.title || "Untitled project")}</h1>
      ${renderLinkRow(project.links)}
      ${metaHtml}
      ${renderInfoStats(project.info)}
      ${galleryHtml}
      ${blocksHtml}
    `;
  }

  /* ---------------- Window creation ---------------- */

  /* ---------------- Per-project overrides ---------------- */

  // Maps friendly theme keys -> the CSS variables they control.
  // Add more here if you want to expose additional knobs per project.
  const THEME_VAR_MAP = {
    accent: "--pw-accent",
    bg: "--pw-bg",
    bgSolid: "--pw-bg-solid",
    border: "--pw-border",
    text: "--pw-text",
    textDim: "--pw-text-dim",
    radius: "--pw-radius",
    titlebarBg: "--pw-titlebar-bg",
    fontFamily: "--pw-font-family",
  };

  function applyTheme(win, theme) {
    if (!theme) return;
    Object.keys(theme).forEach((key) => {
      const cssVar = THEME_VAR_MAP[key];
      if (cssVar) {
        win.style.setProperty(cssVar, theme[key]);
      }
    });
  }

  function applyWindowClass(win, windowClass) {
    if (!windowClass) return;
    windowClass
      .split(/\s+/)
      .filter(Boolean)
      .forEach((cls) => win.classList.add(cls));
  }

  function createWindowElement(project) {
    const win = document.createElement("div");
    win.className = "pw-window";
    win.setAttribute("role", "dialog");
    win.setAttribute("aria-label", project.title || "Project");
    win.dataset.projectId = project.id;

    applyTheme(win, project.theme);
    applyWindowClass(win, project.windowClass);

    // Level 3: full custom render. If present, skip the standard body
    // template entirely and use the project's own markup untouched.
    const bodyHtml =
      typeof project.customHTML === "string"
        ? project.customHTML
        : renderProjectBody(project);

    win.innerHTML = `
      <div class="pw-titlebar">
        <div class="pw-traffic">
          <button class="pw-dot pw-dot-close" aria-label="Close" title="Close">
            <svg viewBox="0 0 8 8"><path d="M1 1L7 7M7 1L1 7" stroke="black" stroke-width="1.4" stroke-linecap="round"/></svg>
          </button>
          <button class="pw-dot pw-dot-min" aria-label="Minimize" title="Minimize">
            <svg viewBox="0 0 8 8"><path d="M1 4H7" stroke="black" stroke-width="1.4" stroke-linecap="round"/></svg>
          </button>
          <button class="pw-dot pw-dot-max" aria-label="Maximize" title="Maximize">
            <svg viewBox="0 0 8 8"><path d="M2 2H6V6H2V2Z" stroke="black" stroke-width="1.2" fill="none"/></svg>
          </button>
        </div>
        <div class="pw-titlebar-label">${escapeHtml(project.title || "")}</div>
        <div class="pw-titlebar-spacer"></div>
      </div>
      <div class="pw-body">${bodyHtml}</div>
      <div class="pw-resize pw-resize-n"></div>
      <div class="pw-resize pw-resize-s"></div>
      <div class="pw-resize pw-resize-e"></div>
      <div class="pw-resize pw-resize-w"></div>
      <div class="pw-resize pw-resize-ne"></div>
      <div class="pw-resize pw-resize-nw"></div>
      <div class="pw-resize pw-resize-se"></div>
      <div class="pw-resize pw-resize-sw"></div>
    `;

    return win;
  }

  function focusWindow(win) {
    document
      .querySelectorAll(".pw-window.pw-active")
      .forEach((w) => w.classList.remove("pw-active"));
    win.classList.add("pw-active");
    zCounter += 1;
    win.style.zIndex = String(zCounter);
  }

  function placeWindow(win) {
    if (isMobile()) {
      win.style.left = "12px";
      win.style.top = "12px";
      return;
    }
    const cascade = (openCount % 6) * CASCADE_OFFSET;
    const w = win.offsetWidth || 720;
    const h = win.offsetHeight || 560;
    const x = Math.max(24, (window.innerWidth - w) / 2 + cascade - 60);
    const y = Math.max(24, (window.innerHeight - h) / 2 + cascade - 80);
    win.style.left = `${x}px`;
    win.style.top = `${y}px`;
  }

  function closeWindow(win, immediate) {
    const id = win.dataset.projectId;
    openWindows.delete(id);
    const remove = () => {
      win.removeEventListener("transitionend", remove);
      win.remove();
    };
    if (immediate) {
      remove();
      return;
    }
    win.classList.remove("pw-open");
    win.classList.add("pw-closing");
    win.addEventListener("transitionend", remove);
    // fallback in case transitionend doesn't fire
    setTimeout(remove, 260);
  }

  function minimizeWindow(win, project) {
    win.style.display = "none";
    win.dataset.minimized = "1";
    const item = document.createElement("button");
    item.className = "pw-taskbar-item";
    item.type = "button";
    item.innerHTML = `<span class="pw-dot pw-dot-min" style="cursor:default" aria-hidden="true"></span><span>${escapeHtml(
      project.title || "Untitled"
    )}</span>`;
    item.addEventListener("click", () => {
      win.style.display = "flex";
      delete win.dataset.minimized;
      item.remove();
      focusWindow(win);
    });
    ensureLayer();
    taskbar.appendChild(item);
    win._taskbarItem = item;
  }

  function toggleMaximize(win) {
    if (win.dataset.maximized === "1") {
      // restore
      const prev = win._restoreRect;
      if (prev) {
        win.style.left = prev.left;
        win.style.top = prev.top;
        win.style.width = prev.width;
        win.style.height = prev.height;
      }
      win.classList.remove("pw-maximized");
      delete win.dataset.maximized;
    } else {
      win._restoreRect = {
        left: win.style.left,
        top: win.style.top,
        width: win.style.width,
        height: win.style.height,
      };
      win.style.left = "0px";
      win.style.top = "0px";
      win.style.width = "100vw";
      win.style.height = "100vh";
      win.classList.add("pw-maximized");
      win.dataset.maximized = "1";
    }
  }

  /* ---------------- Dragging ---------------- */

  function enableDrag(win) {
    const titlebar = win.querySelector(".pw-titlebar");
    let startX, startY, startLeft, startTop, dragging = false;

    function onPointerDown(e) {
      if (e.target.closest(".pw-dot")) return; // don't drag when clicking traffic lights
      if (win.dataset.maximized === "1") return; // don't drag while maximized
      dragging = true;
      win.classList.add("pw-dragging");
      focusWindow(win);
      const point = e.touches ? e.touches[0] : e;
      startX = point.clientX;
      startY = point.clientY;
      const rect = win.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      document.addEventListener("mousemove", onPointerMove);
      document.addEventListener("mouseup", onPointerUp);
      document.addEventListener("touchmove", onPointerMove, { passive: false });
      document.addEventListener("touchend", onPointerUp);
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!dragging) return;
      const point = e.touches ? e.touches[0] : e;
      const dx = point.clientX - startX;
      const dy = point.clientY - startY;
      let newLeft = startLeft + dx;
      let newTop = startTop + dy;
      // keep titlebar reachable on screen
      newTop = Math.max(0, newTop);
      win.style.left = `${newLeft}px`;
      win.style.top = `${newTop}px`;
      if (e.cancelable) e.preventDefault();
    }

    function onPointerUp() {
      dragging = false;
      win.classList.remove("pw-dragging");
      document.removeEventListener("mousemove", onPointerMove);
      document.removeEventListener("mouseup", onPointerUp);
      document.removeEventListener("touchmove", onPointerMove);
      document.removeEventListener("touchend", onPointerUp);
    }

    titlebar.addEventListener("mousedown", onPointerDown);
    titlebar.addEventListener("touchstart", onPointerDown, { passive: false });
    titlebar.addEventListener("dblclick", (e) => {
      if (e.target.closest(".pw-dot")) return;
      toggleMaximize(win);
    });
  }

  /* ---------------- Resizing ---------------- */

  function enableResize(win) {
    const handles = win.querySelectorAll(".pw-resize");
    const minWidth = 320;
    const minHeight = 220;

    handles.forEach((handle) => {
      const dirs = Array.from(handle.classList)
        .find((c) => c.startsWith("pw-resize-"))
        .replace("pw-resize-", "");

      let startX, startY, startW, startH, startLeft, startTop, resizing = false;

      function onPointerDown(e) {
        if (win.dataset.maximized === "1") return;
        resizing = true;
        win.classList.add("pw-resizing");
        focusWindow(win);
        const point = e.touches ? e.touches[0] : e;
        startX = point.clientX;
        startY = point.clientY;
        const rect = win.getBoundingClientRect();
        startW = rect.width;
        startH = rect.height;
        startLeft = rect.left;
        startTop = rect.top;
        document.addEventListener("mousemove", onPointerMove);
        document.addEventListener("mouseup", onPointerUp);
        document.addEventListener("touchmove", onPointerMove, { passive: false });
        document.addEventListener("touchend", onPointerUp);
        e.preventDefault();
      }

      function onPointerMove(e) {
        if (!resizing) return;
        const point = e.touches ? e.touches[0] : e;
        const dx = point.clientX - startX;
        const dy = point.clientY - startY;

        let newW = startW;
        let newH = startH;
        let newLeft = startLeft;
        let newTop = startTop;

        if (dirs.includes("e")) newW = Math.max(minWidth, startW + dx);
        if (dirs.includes("s")) newH = Math.max(minHeight, startH + dy);
        if (dirs.includes("w")) {
          newW = Math.max(minWidth, startW - dx);
          newLeft = startLeft + (startW - newW);
        }
        if (dirs.includes("n")) {
          newH = Math.max(minHeight, startH - dy);
          newTop = startTop + (startH - newH);
        }

        win.style.width = `${newW}px`;
        win.style.height = `${newH}px`;
        win.style.left = `${newLeft}px`;
        win.style.top = `${newTop}px`;
        if (e.cancelable) e.preventDefault();
      }

      function onPointerUp() {
        resizing = false;
        win.classList.remove("pw-resizing");
        document.removeEventListener("mousemove", onPointerMove);
        document.removeEventListener("mouseup", onPointerUp);
        document.removeEventListener("touchmove", onPointerMove);
        document.removeEventListener("touchend", onPointerUp);
      }

      handle.addEventListener("mousedown", onPointerDown);
      handle.addEventListener("touchstart", onPointerDown, { passive: false });
    });
  }

  /* ---------------- Public API ---------------- */

  function openProject(idOrProject) {
    const project =
      typeof idOrProject === "string" ? getProjectById(idOrProject) : idOrProject;

    if (!project) {
      console.warn("[ProjectWindows] No project found for", idOrProject);
      return;
    }

    ensureLayer();

    // Single-instance: if already open, just focus/restore it
    if (openWindows.has(project.id)) {
      const existing = openWindows.get(project.id);
      if (existing.dataset.minimized === "1") {
        existing._taskbarItem?.click();
      } else {
        focusWindow(existing);
      }
      return existing;
    }

    const win = createWindowElement(project);
    layer.appendChild(win);
    openWindows.set(project.id, win);
    openCount += 1;

    placeWindow(win);
    focusWindow(win);
    enableDrag(win);
    enableResize(win);

    // wire close/min/max buttons
    win.querySelector(".pw-dot-close").addEventListener("click", () => closeWindow(win));
    win.querySelector(".pw-dot-min").addEventListener("click", () => minimizeWindow(win, project));
    win.querySelector(".pw-dot-max").addEventListener("click", () => toggleMaximize(win));

    win.addEventListener("mousedown", () => focusWindow(win));

    // Esc closes the topmost (active) window
    win._escHandler = function (e) {
      if (e.key === "Escape" && win.classList.contains("pw-active")) {
        closeWindow(win);
      }
    };
    document.addEventListener("keydown", win._escHandler);
    win.addEventListener("DOMNodeRemoved", () => {}); // no-op, kept for clarity

    // trigger open transition next frame
    requestAnimationFrame(() => win.classList.add("pw-open"));

    return win;
  }

  function init() {
    ensureLayer();
    document.querySelectorAll(".pw-trigger").forEach((trigger) => {
      if (trigger._pwBound) return;
      trigger._pwBound = true;
      trigger.setAttribute("tabindex", trigger.getAttribute("tabindex") || "0");
      trigger.setAttribute("role", trigger.getAttribute("role") || "button");
      const id = trigger.dataset.projectId;
      trigger.addEventListener("click", () => openProject(id));
      trigger.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openProject(id);
        }
      });
    });
  }

  window.ProjectWindows = { init, openProject, closeWindow, openLightbox, closeLightbox };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();