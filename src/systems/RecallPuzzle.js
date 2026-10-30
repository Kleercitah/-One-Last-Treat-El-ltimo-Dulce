// A deterministic sequence; an incorrect answer never erases earlier progress.
export class RecallPuzzle {
  constructor(questions) { this.questions = questions; this.index = 0; }
  get current() { return this.questions[this.index] ?? null; }
  get complete() { return this.index === this.questions.length; }
  answer(id) {
    if (!this.current || this.current.answer !== id) return false;
    this.index++;
    return true;
  }
}
