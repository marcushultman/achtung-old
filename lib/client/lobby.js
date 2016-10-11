import Score from './score'
import PlayerWorm from './player_worm'
export class Lobby {
  constructor (id) {
    this.peer_ids = []
    this.total_score = new Score()
    this.score = new Score()
    this.player_worm = new PlayerWorm()
  }
}

export default Lobby
