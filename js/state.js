export const initialState = () => ({
  currentQuestion: "q1",
  noCounts: {},
  completedQuestions: [],
  displayedMemes: {},
  currentSong: 0,
  isPlaying: false,
  secretUnlocked: localStorage.getItem("secretUnlocked") === "1",
  secretClicks: 0,
  progressSaved: false
});

export let state = initialState();

export function resetState() {
  state = initialState();
  localStorage.removeItem("progress");
}

export function setProgress(value) {
  localStorage.setItem("progress", JSON.stringify(value));
}

export function getProgress() {
  const raw = localStorage.getItem("progress");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
