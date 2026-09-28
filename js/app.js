import { CONFIG } from "./config.js";
import { state, resetState, setProgress, getProgress } from "./state.js";
import { loadQuestions } from "./questions.js";
import { loadMemes } from "./memes.js";
import { QuestionEngine } from "./questionEngine.js";
import { MusicPlayer } from "./musicPlayer.js";
import { switchScreen, playHugAnimation } from "./animations.js";

const els = {
  landingNickname: document.getElementById("landing-nickname"),
  introName: document.getElementById("intro-name"),
  signature: document.getElementById("signature"),
  enterBtn: document.getElementById("enter-btn"),
  letsGoBtn: document.getElementById("lets-go-btn"),
  yesBtn: document.getElementById("yes-btn"),
  noBtn: document.getElementById("no-btn"),
  retryBtn: document.getElementById("retry-btn"),
  memeImage: document.getElementById("meme-image"),
  reactionTitle: document.getElementById("reaction-title"),
  reactionCaption: document.getElementById("reaction-caption"),
  questionTitle: document.getElementById("question-title"),
  questionNumber: document.getElementById("question-number"),
  questionPanel: document.querySelector(".question-panel"),
  progress: document.getElementById("progress"),
  volume: document.getElementById("volume"),
  songTitle: document.getElementById("song-title"),
  songArtist: document.getElementById("song-artist"),
  songArt: document.getElementById("song-art"),
  timeDisplay: document.getElementById("time-display"),
  playBtn: document.getElementById("play-btn"),
  prevBtn: document.getElementById("prev-btn"),
  nextBtn: document.getElementById("next-btn"),
  lyrics: document.getElementById("lyrics"),
  songPills: document.getElementById("song-pills"),
  toFinalQuestionBtn: document.getElementById("to-final-question-btn"),
  finalYesBtn: document.getElementById("final-yes-btn"),
  finalNoBtn: document.getElementById("final-no-btn"),
  hugMessage: document.getElementById("hug-message"),
  replayBtn: document.getElementById("replay-btn"),
  secretHeart: document.getElementById("secret-heart"),
  secretCloseBtn: document.getElementById("secret-close-btn")
};

els.landingNickname.textContent = CONFIG.nickname;
els.introName.textContent = CONFIG.name;
els.signature.textContent = `— ${CONFIG.signatureName} —`;
document.documentElement.style.setProperty("--primary", CONFIG.theme.primary);
document.documentElement.style.setProperty("--secondary", CONFIG.theme.secondary);

let questionEngine;
let musicPlayer;
let lastStoryScreen = "landing-screen";

function saveStoryProgress(screenId) {
  setProgress({ screenId, currentQuestion: state.currentQuestion });
}

function show(screenId) {
  const current = document.querySelector(".screen.active");
  switchScreen(current?.id, screenId);
  if (screenId !== "secret-screen") {
    lastStoryScreen = screenId;
    saveStoryProgress(screenId);
  }
}

function wireSecretInteraction() {
  const openSecret = () => {
    state.secretUnlocked = true;
    localStorage.setItem("secretUnlocked", "1");
    show("secret-screen");
  };

  const interact = () => {
    state.secretClicks += 1;
    if (state.secretClicks >= 5) openSecret();
  };

  els.secretHeart.addEventListener("click", interact);
  els.secretHeart.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      interact();
    }
  });

  els.secretCloseBtn.addEventListener("click", () => show(lastStoryScreen));
  if (state.secretUnlocked) {
    els.secretHeart.style.opacity = "0.6";
  }
}

async function initMusic() {
  const songsResponse = await fetch(CONFIG.songsFile);
  if (!songsResponse.ok) throw new Error("Failed to load songs");
  const songs = await songsResponse.json();

  if (!Array.isArray(songs) || songs.length !== 3) {
    throw new Error("Songs list must contain exactly 3 songs");
  }

  musicPlayer = new MusicPlayer({
    progress: els.progress,
    volume: els.volume,
    title: els.songTitle,
    artist: els.songArtist,
    art: els.songArt,
    time: els.timeDisplay,
    play: els.playBtn,
    lyrics: els.lyrics,
    songPills: els.songPills
  }, songs);

  musicPlayer.init();

  els.playBtn.addEventListener("click", () => void musicPlayer.togglePlay());
  els.prevBtn.addEventListener("click", () => musicPlayer.previous());
  els.nextBtn.addEventListener("click", () => musicPlayer.next());
  els.progress.addEventListener("input", () => musicPlayer.seek(Number(els.progress.value)));
  els.volume.addEventListener("input", () => musicPlayer.setVolume(Number(els.volume.value)));
}

function setupQuestionFlow(questions, memesByQuestion) {
  questionEngine = new QuestionEngine({
    questions,
    memesByQuestion,
    elements: {
      questionTitle: els.questionTitle,
      questionNumber: els.questionNumber,
      questionPanel: els.questionPanel
    },
    state,
    onAllDone: () => show("songs-screen")
  });

  questionEngine.showQuestion(state.currentQuestion);

  els.yesBtn.addEventListener("click", () => questionEngine.handleYes());
  els.noBtn.addEventListener("click", () => {
    const memeCard = questionEngine.handleNo();
    if (!memeCard) return;
    els.memeImage.src = memeCard.image || "";
    els.memeImage.alt = memeCard.image ? "Meme reaction" : "Missing meme placeholder";
    els.reactionTitle.textContent = memeCard.title;
    els.reactionCaption.textContent = memeCard.caption;
    els.retryBtn.textContent = memeCard.retryText;
    els.questionPanel.classList.add("shake");
    setTimeout(() => els.questionPanel.classList.remove("shake"), 320);
    show("reaction-screen");
  });

  els.retryBtn.addEventListener("click", () => {
    questionEngine.showQuestion(state.currentQuestion);
    show("question-screen");
  });
}

function setupFinalFlow() {
  els.toFinalQuestionBtn.addEventListener("click", () => show("final-question-screen"));

  let finalNoCount = 0;
  const finalNoResponses = [
    "Hmm... interesting choice 🤨",
    "Are you absolutely sure? 😭",
    "Girl... we're having this conversation again.",
    "I think your finger slipped 😌"
  ];

  els.finalNoBtn.addEventListener("click", () => {
    finalNoCount += 1;
    const idx = Math.min(finalNoCount - 1, finalNoResponses.length - 1);
    els.reactionTitle.textContent = "Final retry required 💗";
    els.reactionCaption.textContent = finalNoResponses[idx];
    els.memeImage.src = "./assets/images/memes/final-placeholder.png";
    els.memeImage.alt = "Playful final meme placeholder";
    els.retryBtn.textContent = "One more time 🫶";
    show("reaction-screen");
  });

  els.finalYesBtn.addEventListener("click", async () => {
    show("hug-screen");
    await playHugAnimation();
    els.hugMessage.textContent = "Virtual hug delivered successfully. 🫂";
    setTimeout(() => show("end-screen"), 2200);
  });

  els.replayBtn.addEventListener("click", () => {
    resetState();
    if (musicPlayer) {
      musicPlayer.destroy();
      musicPlayer = null;
    }
    window.location.reload();
  });
}

async function bootstrap() {
  try {
    const [questions, memesByQuestion] = await Promise.all([
      loadQuestions(CONFIG.questionsFile),
      loadMemes(CONFIG.memesFile)
    ]);

    setupQuestionFlow(questions, memesByQuestion);
    await initMusic();
    setupFinalFlow();
    wireSecretInteraction();

    const progress = getProgress();
    if (progress?.screenId && document.getElementById(progress.screenId)) {
      show(progress.screenId);
      if (progress.currentQuestion) {
        questionEngine.showQuestion(progress.currentQuestion);
      }
    }
  } catch (error) {
    const panel = document.querySelector("#landing-screen .panel");
    if (panel) {
      panel.innerHTML = "<h1>Oops 😭</h1><p>Something sweet broke while loading. Please check data files.</p>";
    }
    // eslint-disable-next-line no-console
    console.error(error);
  }
}

els.enterBtn.addEventListener("click", () => show("intro-screen"));
els.letsGoBtn.addEventListener("click", () => show("question-screen"));
bootstrap();
