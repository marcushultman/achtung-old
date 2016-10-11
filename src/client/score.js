export class Score {
  constructor () {
    this.result = {}
  }

  add_points (id, points) {
    this.result[id] = (this.result[id] || 0) + points
  }
}

export default Score
