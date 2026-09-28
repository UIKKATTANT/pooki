export async function loadQuestions(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error("Failed to load questions");
  const questions = await response.json();
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("Empty question list");
  }
  return questions;
}
