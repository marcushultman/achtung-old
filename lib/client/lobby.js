import Score from './score'
import PlayerWorm from './player_worm'
export class Lobby {
  constructor () {
    this.peer_ids = []
    this.total_score = new Score()
    this.score = new Score()
    this.player_worm = new PlayerWorm()
  }

  get_peers() {
    return this.peer_ids.slice();
  }
  add_peer(peer) {
    return this.peer_ids.push(peer);
  }
  remove_peer(peer) {
    const index = this.peer_ids.indexOf(peer);
    if (index >= 0) {
      this.peer_ids.splice(index, 1);
    }
  }
  reset() {
    this.peer_ids.splice(0, this.peer_ids.length);
  }
}

export default Lobby
