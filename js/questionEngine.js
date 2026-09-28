import { selectMeme } from "./memes.js";

export class QuestionEngine {
  constructor({ questions, memesByQuestion, elements, state, onAllDone }) {
    this.questions = questions;
    this.questionById = new Map(questions.map((q) => [q.id, q]));
    this.memesByQuestion = memesByQuestion;
    this.elements = elements;
    this.state = state;
    this.onAllDone = onAllDone;
  }

  showQuestion(id) {
    const question = this.questionById.get(id);
    if (!question) {
      this.elements.questionTitle.textContent = "Oops... lost question ID 😭";
      this.elements.questionNumber.textContent = "QUESTION ??";
      return;
    }
    this.state.currentQuestion = id;
    this.elements.questionNumber.textContent = `QUESTION ${String(this.questions.findIndex((q) => q.id === id) + 1).padStart(2, "0")}`;
    this.elements.questionTitle.textContent = question.question;
  }

  handleYes() {
    const question = this.questionById.get(this.state.currentQuestion);
    if (!question) return;

    this.elements.questionTitle.textContent = question.yesMessage;
    this.elements.questionPanel.classList.add("heart-burst");
    setTimeout(() => {
      this.elements.questionPanel.classList.remove("heart-burst");
      this.state.completedQuestions.push(question.id);
      if (!question.next) {
        this.onAllDone();
        return;
      }
      this.showQuestion(question.next);
    }, 900);
  }

  handleNo() {
    const question = this.questionById.get(this.state.currentQuestion);
    if (!question) return null;

    this.state.noCounts[question.id] = (this.state.noCounts[question.id] || 0) + 1;
    const messageIndex = Math.min(this.state.noCounts[question.id] - 1, question.noMessages.length - 1);
    const playfulMessage = question.noMessages[messageIndex] || "Hmm... let's retry that 😌";

    const meme = selectMeme(question.id, this.memesByQuestion, this.state.displayedMemes);
    return {
      title: meme.reaction || playfulMessage,
      caption: `${playfulMessage} ${meme.caption || "Try again, pookie 😭"}`,
      image: meme.image,
      retryText: question.retryText || "Try again 😌"
    };
  }
}
