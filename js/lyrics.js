export function getActiveLyricIndex(lyrics, currentTime) {
  if (!Array.isArray(lyrics) || lyrics.length === 0) return -1;
  for (let i = lyrics.length - 1; i >= 0; i -= 1) {
    if (currentTime >= lyrics[i].time) return i;
  }
  return 0;
}

export function renderLyrics(container, lyrics, activeIndex) {
  container.innerHTML = "";
  if (!Array.isArray(lyrics) || lyrics.length === 0) {
    container.innerHTML = "<p class=\"lyric-line active\">Lyrics unavailable yet 💗</p>";
    return;
  }
  lyrics.forEach((line, index) => {
    const p = document.createElement("p");
    p.className = `lyric-line ${index === activeIndex ? "active" : ""}`;
    p.textContent = line.text;
    container.appendChild(p);
    if (index === activeIndex) {
      p.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  });
}
