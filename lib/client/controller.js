import Lobby from './lobby'
import Pairing from './pairing'

const PEER_UPDATE = 0,
      PEER_PAIRING = 1,
      SESSION_START = 2,
      SESSION_MESSAGE = 3,
      SESSION_END = 4;

export class Controller {

  constructor (id,
               connect,
               send_message,
               disconnect,
               on_session_start,
               on_session_message,
               on_session_ended,
               log) {
    this.peer = {id};

    this.lobby = new Lobby();
    this.pairing = new Pairing(
      (flag, id) => this.pair(flag, id),
      () => this.start_session(),
      log);

    this.connect = connect;
    this.send_message = send_message;
    this.disconnect = disconnect;

    this.on_session_start = on_session_start;
    this.on_session_message = on_session_message;
    this.on_session_ended = on_session_ended;

    this.log = log;
  }

  get_peers() {
    return this.lobby.get_peers().concat(this.peer.id);
  }

  get_adjacent_peer(side) {
    return this.pairing.neighbours.get(side);
  }

  get_side_from_peer(peer) {
    for (let [side, id] of this.pairing.neighbours) {
      if (peer === id){
        return side;
      }
    }
  }

  pair(flag, id) {
    const message = this.create_message(PEER_PAIRING, flag);
    if (id) {
      return this.send_message(id, message);
    } else {
      const peers = this.lobby.get_peers();
      return peers.map(id => this.send_message(id, message));
    }
  }

  start_session() {
    // todo: use Date.now()
    var seed = 0;
    this.on_session_start(seed);
    const message = this.create_message(SESSION_START, seed);
    const peers = this.lobby.get_peers();
    return peers.map(id => this.send_message(id, message));
  }

  send_session_message(id, payload) {
    const message = this.create_message(SESSION_MESSAGE, payload);
    const peers = id !== 0 ? [id] : this.lobby.get_peers().concat(this.peer.id);
    return peers.map(id => this.send_message(id, message));
  }

  end_session() {
    this.on_session_ended();
    const message = this.create_message(SESSION_END);
    const peers = this.lobby.get_peers();
    return peers.map(id => this.send_message(id, message));
  }

  on_connection(peer, is_incoming) {
    const current_peers = this.lobby.get_peers();
    this.lobby.add_peer(peer);
    this.log(`${peer} joined...`);
    this.pairing.on_peer_joined(peer);

    if (is_incoming && current_peers.length) {
      const message = this.create_message(PEER_UPDATE, this.lobby.get_peers());
      return current_peers.map(id => this.send_message(id, message));
    }
  }

  on_message(peer, message) {
    switch (message.type) {
    case PEER_UPDATE:
      return this.on_peer_ids_update(message.payload);
    case PEER_PAIRING:
      return this.pairing.on_state_update(peer, message.payload);
    case SESSION_START:
      return this.on_session_start(message.payload);
    case SESSION_END:
      return this.on_session_ended();
    default:
    case SESSION_MESSAGE:
      this.on_session_message(peer, message);
    };
  }

  on_peer_ids_update(peer_ids) {
    const invalid = this.lobby.get_peers().concat(this.peer.id);
    const peer_filter = id => invalid.indexOf(id) < 0;
    return peer_ids.filter(peer_filter).map(id => this.connect(id));
  }

  on_connection_closed(peer) {
    this.lobby.remove_peer(peer);
    this.log(`${peer} left...`);
    this.pairing.on_peer_left(peer);
  }

  leave() {
    this.lobby.reset();
    this.pairing.reset();
    return this.disconnect();
  }

  create_message(type, payload) {
    return {type, payload};
  }

  to_string() {
    return `${this.peer.id} [${this.lobby.get_peers().join(',')}]`;
  }
}

export default Controller
