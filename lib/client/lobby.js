export default class Lobby {

  constructor () {
    this.peers = [];
  }

  get_peers() {
    return this.peers.slice();
  }

  add_peer(peer) {
    return this.peers.push(peer);
  }

  remove_peer(peer) {
    const index = this.peers.indexOf(peer);
    if (index >= 0) {
      this.peers.splice(index, 1);
    }
  }

  reset() {
    this.peers.splice(0, this.peers.length);
  }
}