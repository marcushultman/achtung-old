export default class Score {
  constructor () {
    this.reset();
  }

  add(id, points) {
    this.result[id] = (this.result[id] || 0) + points;
  }

  get(id) {
    return this.result[id] || 0;
  }

  sum() {
    return Object.keys(this.result).reduce(
      (total, id) => total + this.result[id], 0);
  }

  reset() {
    this.result = {}
  }
}