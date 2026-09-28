export async function loadMemes(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error("Failed to load memes");
  return response.json();
}

export function selectMeme(questionId, memesByQuestion, displayed) {
  const pool = memesByQuestion[questionId] || memesByQuestion.default || [];
  if (pool.length === 0) {
    return {
      image: "",
      caption: "Oops... this meme escaped. 😭",
      reaction: "Let's try that one more time."
    };
  }

  displayed[questionId] ||= [];
  const shown = new Set(displayed[questionId]);
  const available = pool.filter((item) => !shown.has(item.image));
  const choice = (available.length ? available : pool)[Math.floor(Math.random() * (available.length ? available : pool).length)];

  if (available.length === 0) displayed[questionId] = [];
  displayed[questionId].push(choice.image);
  return choice;
}
