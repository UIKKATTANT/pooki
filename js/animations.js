export function switchScreen(currentId, nextId) {
  const current = document.getElementById(currentId);
  const next = document.getElementById(nextId);
  if (!next) return;
  if (current) current.classList.remove("active");
  next.classList.add("active");
}

export async function playHugAnimation() {
  const charA = document.getElementById("char-a");
  const charB = document.getElementById("char-b");
  if (!charA || !charB) return;
  charA.classList.add("walk-right");
  charB.classList.add("walk-left");
  await new Promise((resolve) => setTimeout(resolve, 2100));
  charA.textContent = "🫂";
  charB.textContent = "✨";
  charA.classList.add("hug-pulse");
}
