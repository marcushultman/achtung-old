import Point from './point'

export class LocalWorm {
  constructor (peer_id) {
    this.peer_id = peer_id
    this.position = new Point(0, 0)
    this.direction = 0
    this.is_alive = true
  }
}

export default PlayerWorm
