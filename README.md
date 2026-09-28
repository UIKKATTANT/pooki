# pooki

A mobile-first pixel-art interactive love story built with plain HTML/CSS/JS.

## Architecture (before implementation)

### Component hierarchy
- `index.html` defines story screens: landing → intro → questions → meme reaction → songs → final question → hug → ending (+ hidden secret screen).
- `js/app.js` is the top-level orchestrator for transitions and event wiring.
- `js/questionEngine.js` handles reusable question logic.
- `js/musicPlayer.js` handles one shared HTML5 audio instance, controls, and lyric sync.
- `js/lyrics.js` isolates lyric-index and rendering logic.
- `js/state.js` centralizes runtime state/localStorage.
- `js/config.js` centralizes personalization and data file locations.

### YES/NO state machine
- `showQuestion(currentQuestion)` renders question card.
- On **YES**: show yes reaction → mark completed → move to `next` question (or songs when no next).
- On **NO**: increment `noCounts[questionId]` → select non-repeated meme where possible → show reaction screen → retry button returns to same question.
- Final question repeats the same NO-retry pattern and only advances on YES.

### Data model
- `data/questions.json`: list of reusable question objects with `id`, `question`, `yesMessage`, `noMessages`, `retryText`, `next`.
- `data/memes.json`: meme sets per question + default fallback memes.
- `data/songs.json`: exactly 3 songs with title/artist/audio/art/lyrics.
- `state`: `currentQuestion`, `noCounts`, `completedQuestions`, `displayedMemes`, `currentSong`, `isPlaying`, `secretUnlocked`.

## Structure

```
.
├── index.html
├── css/
│   ├── style.css
│   ├── animations.css
│   └── responsive.css
├── js/
│   ├── app.js
│   ├── config.js
│   ├── state.js
│   ├── questions.js
│   ├── questionEngine.js
│   ├── memes.js
│   ├── musicPlayer.js
│   ├── lyrics.js
│   └── animations.js
├── data/
│   ├── questions.json
│   ├── memes.json
│   └── songs.json
└── assets/
    ├── images/
    ├── music/
    └── fonts/
```

## Notes
- Phase 1 foundation (landing, intro, theme, structure) is implemented and the remaining phases are already scaffolded in reusable modules.
- Replace placeholder assets in `assets/images/memes` and `assets/music/song*/` with your own content.
- Lyric lines are placeholders; only use lyrics you have permission to use.
