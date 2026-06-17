/* ============================================================================
 * watch.js — watch page: HLS player + server switching + sidebar.
 * Uses hls.js for browsers without native HLS, native playback on Safari/iOS.
 * ==========================================================================*/
(function () {
  const { CHANNELS, MATCHES } = window.SITE_DATA;

  const params = new URLSearchParams(location.search);

  // Auto-pick the live match when none/“live” is requested, so opening the
  // player with no channel lands you straight on whatever is live now.
  const liveMatch = MATCHES.find((m) => m.status === "live");
  const wantsAutoLive = !params.get("ch") || params.get("ch") === "live";

  const chId = wantsAutoLive
    ? (liveMatch ? liveMatch.channelId : CHANNELS[0].id)
    : params.get("ch");
  const matchId = params.get("match") || (wantsAutoLive && liveMatch ? liveMatch.id : null);

  const channel = CHANNELS.find((c) => c.id === chId) || CHANNELS[0];
  const match = MATCHES.find((m) => m.id === matchId);

  const shell = document.getElementById("player-shell");
  const video = document.getElementById("video");
  const overlay = document.getElementById("overlay");
  const isEmbed = !!channel.embed;
  let hls = null;
  let started = false;

  /* ---------------------------------------------- Player core */
  function loadStream(url) {
    if (hls) { hls.destroy(); hls = null; }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url; // native HLS (Safari / iOS)
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ lowLatencyMode: true });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url; // last-resort fallback
    }
  }

  function play() {
    started = true;
    overlay.classList.add("hidden");
    video.play().catch(() => {/* user gesture may still be required */});
  }

  /* ---------------------------------------------- Embed (iframe) mode */
  function embedUrl(serverIndex) {
    const u = new URL(channel.embed.url);
    if (channel.embed.param != null) u.searchParams.set(channel.embed.param, serverIndex);
    return u.toString();
  }

  function loadEmbed(serverIndex) {
    shell.innerHTML =
      `<iframe class="embed-frame" src="${embedUrl(serverIndex)}" ` +
      `allow="autoplay; encrypted-media; fullscreen" allowfullscreen ` +
      `referrerpolicy="no-referrer" scrolling="no"></iframe>`;
  }

  /* ---------------------------------------------- Head info */
  function fillInfo() {
    const live = MATCHES.some((m) => m.channelId === channel.id && m.status === "live");
    document.getElementById("ch-name").textContent = channel.name;
    document.getElementById("ch-status").innerHTML = live
      ? `<span class="status-pill status-live">مباشر الآن</span>`
      : `<span class="status-pill status-upcoming">جاهزة للبث</span>`;
    document.title = `${channel.name} — مشاهدة مباشرة | كورة لايف`;

    const sub = document.getElementById("now-sub");
    sub.textContent = match
      ? `${match.home} ضد ${match.away} · ${match.league}`
      : `بث مباشر بجودة ${channel.quality}`;

    document.getElementById("info-quality").textContent = channel.quality;
    document.getElementById("info-group").textContent = channel.group;
    document.getElementById("info-commentator").textContent = match ? match.commentator : "—";
    document.getElementById("info-league").textContent = match ? match.league : "—";

    document.getElementById("overlay-title").textContent = channel.name;
    document.getElementById("overlay-sub").textContent = match
      ? `${match.home} ضد ${match.away}`
      : `اضغط للتشغيل · جودة ${channel.quality}`;
  }

  /* ---------------------------------------------- Servers (quality mirrors) */
  function renderServers() {
    const row = document.getElementById("servers");

    if (isEmbed) {
      const n = channel.embed.servers || 1;
      row.innerHTML = Array.from({ length: n }, (_, i) =>
        `<button class="server-btn ${i === 0 ? "active" : ""}" data-srv="${i}">سيرفر ${i + 1}</button>`
      ).join("");
      row.querySelectorAll(".server-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          row.querySelectorAll(".server-btn").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          loadEmbed(Number(btn.dataset.srv));
        });
      });
      return;
    }

    const servers = [
      { label: "سيرفر 1 · HD", url: channel.stream },
      { label: "سيرفر 2 · SD", url: channel.stream },
      { label: "سيرفر 3 · احتياطي", url: channel.stream },
    ];
    row.innerHTML = servers
      .map((s, i) => `<button class="server-btn ${i === 0 ? "active" : ""}" data-url="${s.url}">${s.label}</button>`)
      .join("");
    row.querySelectorAll(".server-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        row.querySelectorAll(".server-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        loadStream(btn.dataset.url);
        if (started) video.play().catch(() => {});
      });
    });
  }

  /* ---------------------------------------------- Sidebar */
  function renderSidebar() {
    const panel = document.getElementById("side-channels");
    panel.innerHTML = CHANNELS.map((c) => {
      const live = MATCHES.some((m) => m.channelId === c.id && m.status === "live");
      return `
        <a class="side-channel ${c.id === channel.id ? "active" : ""}" href="watch.html?ch=${c.id}">
          <div class="mini-logo">📡</div>
          <div class="meta">
            <div class="n">${c.name} ${live ? "🔴" : ""}</div>
            <div class="q">${c.quality} · ${c.group}</div>
          </div>
        </a>`;
    }).join("");
  }

  function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const links = document.querySelector(".nav-links");
    if (toggle && links) toggle.addEventListener("click", () => links.classList.toggle("open"));
  }

  document.addEventListener("DOMContentLoaded", () => {
    fillInfo();
    renderServers();
    renderSidebar();
    initNav();
    if (isEmbed) {
      loadEmbed(0); // iframe handles its own playback controls
    } else {
      loadStream(channel.stream);
      overlay.addEventListener("click", play);
    }
  });
})();
