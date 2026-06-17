/* ============================================================================
 * app.js — renders the home page (matches + channels) and handles UI.
 * ==========================================================================*/
(function () {
  const { CHANNELS, MATCHES } = window.SITE_DATA;

  const statusLabel = { live: "مباشر الآن", upcoming: "لم تبدأ", ended: "انتهت" };

  /* -------------------------------------------------- Featured live (auto) */
  // Automatically finds the match(es) currently live and surfaces them at the
  // top of the page. "Live" is derived from the schedule data (status === "live").
  function renderFeaturedLive() {
    const wrap = document.getElementById("featured-live");
    if (!wrap) return;
    const live = MATCHES.filter((m) => m.status === "live");
    if (!live.length) {
      wrap.innerHTML = `
        <div class="live-empty">
          <span class="live-empty-dot"></span>
          لا توجد مباريات مباشرة الآن — تابع المباريات القادمة بالأسفل.
        </div>`;
      return;
    }
    wrap.innerHTML = `
      <div class="featured-head"><span class="rec-dot"></span> مباشر الآن</div>
      <div class="featured-grid">
        ${live.map((m) => `
          <a class="featured-card" href="watch.html?ch=${m.channelId}&match=${m.id}">
            <div class="featured-league">${m.league} · ${m.minute}</div>
            <div class="featured-teams">
              <span>${m.home}</span>
              <b class="featured-score">${m.score}</b>
              <span>${m.away}</span>
            </div>
            <div class="featured-foot">📺 ${m.channel} · ▶ شاهد الآن</div>
          </a>`).join("")}
      </div>`;
  }

  /* -------------------------------------------------- Matches rendering */
  function matchCard(m) {
    const liveBtn = m.status === "ended"
      ? `<span class="watch-link" style="background:var(--surface-2);color:var(--muted)">انتهت</span>`
      : `<a class="watch-link" href="watch.html?ch=${m.channelId}&match=${m.id}">▶ مشاهدة</a>`;
    const minute = m.status === "live" ? ` · ${m.minute}` : "";
    return `
      <article class="match-card" data-status="${m.status}">
        <div class="match-top">
          <span class="league-tag">${m.league}</span>
          <span class="status-pill status-${m.status}">${statusLabel[m.status]}${minute}</span>
        </div>
        <div class="teams">
          <div class="team">
            <div class="crest">${m.homeAbbr}</div>
            <div class="tname">${m.home}</div>
          </div>
          <div class="score">${m.score}<small>${m.time}</small></div>
          <div class="team">
            <div class="crest">${m.awayAbbr}</div>
            <div class="tname">${m.away}</div>
          </div>
        </div>
        <div class="match-foot">
          <span class="match-meta">📺 <b>${m.channel}</b> · 🎙️ ${m.commentator}</span>
          ${liveBtn}
        </div>
      </article>`;
  }

  function renderMatches(filter) {
    const grid = document.getElementById("matches-grid");
    if (!grid) return;
    const list = filter && filter !== "all"
      ? MATCHES.filter((m) => m.status === filter)
      : MATCHES;
    grid.innerHTML = list.length
      ? list.map(matchCard).join("")
      : `<p style="color:var(--muted)">لا توجد مباريات في هذا التصنيف.</p>`;
    const count = document.getElementById("matches-count");
    if (count) count.textContent = `${list.length} مباراة`;
  }

  /* -------------------------------------------------- Channels rendering */
  function channelCard(c) {
    const isLive = MATCHES.some((m) => m.channelId === c.id && m.status === "live");
    return `
      <a class="channel-card" href="watch.html?ch=${c.id}">
        ${isLive ? `<span class="live-dot">● مباشر</span>` : ""}
        ${c.badge ? `<span class="badge">${c.badge}</span>` : ""}
        <div class="logo-box">📡</div>
        <div class="cname">${c.name}</div>
        <div class="cmeta">${c.quality} · ${c.group}</div>
      </a>`;
  }

  function renderChannels() {
    const grid = document.getElementById("channels-grid");
    if (!grid) return;
    grid.innerHTML = CHANNELS.map(channelCard).join("");
    const count = document.getElementById("channels-count");
    if (count) count.textContent = `${CHANNELS.length} قناة`;
  }

  /* -------------------------------------------------- Filters */
  function initFilters() {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderMatches(btn.dataset.filter);
      });
    });
  }

  /* -------------------------------------------------- Mobile nav */
  function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const links = document.querySelector(".nav-links");
    if (toggle && links) toggle.addEventListener("click", () => links.classList.toggle("open"));
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderFeaturedLive();
    renderMatches("all");
    renderChannels();
    initFilters();
    initNav();
  });
})();
