# كورة لايف · Koora Live

A clean, **ad-free** sports-streaming website inspired by sites like
`vip.worldkoora.com` — a live match schedule, a channel grid, and a watch page
with a real HLS video player. Arabic-first (RTL), fully responsive, dark theme.

> **No ads. No pop-ups. No trackers.** The whole point of this build.

## Features

- 🟣 **Home page** — today's matches (live / upcoming / ended filters) + channel grid
- 📺 **Watch page** — working HLS player (`hls.js`), server/quality switcher, sidebar of other channels
- 📱 **Responsive** — works on mobile, tablet, desktop with a collapsible nav
- ⚡ **Zero build step** — plain HTML/CSS/JS, just open or serve the folder
- 🧩 **Data-driven** — all channels & matches live in one file (`assets/js/data.js`)

## Run locally

It's a static site — any web server works:

```bash
# Python
python3 -m http.server 8000
# then open http://localhost:8000
```

Or just open `index.html` in a browser (the player works best over http://).

## Project structure

```
index.html          # home: matches + channels
watch.html          # player page
assets/
  css/styles.css    # all styles (theme, RTL, responsive)
  js/data.js        # ← EDIT THIS: channels + matches
  js/app.js         # home page rendering & filters
  js/watch.js       # player, server switching, sidebar
```

## Adding your own channels & matches

Everything is in **`assets/js/data.js`**. Add a channel:

```js
{ id: "my-channel", name: "My Channel", group: "Sports",
  quality: "1080p", stream: "https://example.com/your-licensed-stream.m3u8", badge: "HD" }
```

…and matches reference a channel by its `channelId`.

## ⚠️ Important: streams & legality

The bundled `stream` URLs are **free public demo HLS feeds** (Mux / Apple test
streams) — they are placeholders so the player works out of the box. This
project is a **front-end template**; it does **not** include or redistribute any
copyrighted broadcast.

To run real channels you must supply your own **legally licensed** stream URLs
(e.g. content you own the rights to, or an authorized provider). Rebroadcasting
beIN Sports or other paid channels without a license is illegal in most
countries — please use this responsibly.
