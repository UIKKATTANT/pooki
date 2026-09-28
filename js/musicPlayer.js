import { getActiveLyricIndex, renderLyrics } from "./lyrics.js";

export class MusicPlayer {
  constructor(elements, songs) {
    this.audio = new Audio();
    this.elements = elements;
    this.songs = songs;
    this.index = 0;
    this.boundUpdate = () => this.updateUI();
    this.boundEnded = () => this.next();
    this.boundError = () => this.showFallback("Audio unavailable for this track.");
  }

  init() {
    this.audio.addEventListener("timeupdate", this.boundUpdate);
    this.audio.addEventListener("ended", this.boundEnded);
    this.audio.addEventListener("error", this.boundError);
    const savedVolume = Number(localStorage.getItem("preferredVolume"));
    if (!Number.isNaN(savedVolume) && savedVolume >= 0 && savedVolume <= 1) {
      this.audio.volume = savedVolume;
      this.elements.volume.value = String(savedVolume);
    }
    this.load(0);
  }

  destroy() {
    this.audio.pause();
    this.audio.removeEventListener("timeupdate", this.boundUpdate);
    this.audio.removeEventListener("ended", this.boundEnded);
    this.audio.removeEventListener("error", this.boundError);
  }

  load(index) {
    const bounded = (index + this.songs.length) % this.songs.length;
    this.index = bounded;
    const song = this.songs[bounded];

    this.audio.src = song.audio || "";
    this.elements.title.textContent = song.title;
    this.elements.artist.textContent = song.artist;
    this.elements.art.src = song.art;
    this.elements.art.alt = `Pixel art inspired by ${song.title}`;
    this.elements.play.textContent = "▶";

    this.renderSongPills();
    this.updateUI();
  }

  async togglePlay() {
    if (!this.audio.src) {
      this.showFallback("Audio file missing for this song.");
      return;
    }
    if (this.audio.paused) {
      try {
        await this.audio.play();
        this.elements.play.textContent = "⏸";
      } catch {
        this.showFallback("Press play after interacting with the page.");
      }
    } else {
      this.audio.pause();
      this.elements.play.textContent = "▶";
    }
  }

  next() {
    this.load(this.index + 1);
    void this.togglePlay();
  }

  previous() {
    this.load(this.index - 1);
    void this.togglePlay();
  }

  seek(percent) {
    if (this.audio.duration) {
      this.audio.currentTime = (percent / 100) * this.audio.duration;
      this.updateUI();
    }
  }

  setVolume(value) {
    this.audio.volume = value;
    localStorage.setItem("preferredVolume", String(value));
  }

  formatTime(time) {
    if (!Number.isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = String(Math.floor(time % 60)).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  updateUI() {
    const song = this.songs[this.index];
    const current = this.audio.currentTime || 0;
    const duration = this.audio.duration || 0;
    this.elements.progress.value = duration ? String((current / duration) * 100) : "0";
    this.elements.time.textContent = `${this.formatTime(current)} / ${this.formatTime(duration)}`;

    const lyricIndex = getActiveLyricIndex(song.lyrics, current);
    renderLyrics(this.elements.lyrics, song.lyrics, lyricIndex);
  }

  renderSongPills() {
    this.elements.songPills.innerHTML = "";
    this.songs.forEach((song, index) => {
      const btn = document.createElement("button");
      btn.className = `pixel-btn song-pill ${index === this.index ? "active" : ""}`;
      btn.type = "button";
      btn.textContent = `${index + 1}`;
      btn.setAttribute("aria-label", `Select ${song.title}`);
      btn.addEventListener("click", () => this.load(index));
      this.elements.songPills.appendChild(btn);
    });
  }

  showFallback(message) {
    this.elements.lyrics.innerHTML = `<p class=\"lyric-line active\">${message}</p>`;
  }
}
