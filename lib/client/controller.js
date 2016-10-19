import Peer from './peer'
import Lobby from './lobby'
import Pairing from './pairing'

const PEER_UPDATE = 0, PEER_PAIRING = 1;

export class Controller {

  constructor (id_generator,
               connect_delegate,
               send_message_delegate,
               disconnect_delegate,
               log_delegate) {
    this.peer = new Peer(id_generator());
    this.lobby = new Lobby();

    this.pairing = new Pairing(flag => this.pair(flag));

    this.connect = connect_delegate;
    this.send_message = send_message_delegate;
    this.disconnect = disconnect_delegate;

    this.log = log_delegate;
  }

  pair(flag) {
    const current_peers = this.lobby.get_peers();
    const message = this.create_message(PEER_PAIRING, flag);
    return current_peers.map(id => this.send_message(id, message));
  }

  on_connection(peer, is_incoming) {
    const current_peers = this.lobby.get_peers();
    this.lobby.add_peer(peer);
    this.log(`${peer} joined...`);
    if (is_incoming && current_peers.length) {
      const message = this.create_message(PEER_UPDATE);
      return current_peers.map(id => this.send_message(id, message));
    }
  }

  on_message(peer, message) {
    switch (message.type) {
    case PEER_UPDATE:
      return this.on_peer_ids_update(message.payload);
    case PEER_PAIRING:
      return this.pairing.on_state_update(peer, message.payload);
    default:
      this.log(message.payload);
    };
  }

  on_peer_ids_update(peer_ids) {
    const invalid = this.lobby.peer_ids.concat(this.peer.id);
    const peer_filter = id => invalid.indexOf(id) < 0;
    return peer_ids.filter(peer_filter).map(id => this.connect(id));
  }

  on_connection_closed(peer) {
    this.lobby.remove_peer(peer);
    this.log(`${peer} left...`);
  }

  leave() {
    this.lobby.reset();
    return this.disconnect();
  }

  create_message(type, payload) {
    const message = {type};
    switch (type) {
    case PEER_UPDATE:
      message.payload = this.lobby.peer_ids;
      break;
    case PEER_PAIRING:
      message.payload = payload;
      break;
    }
    return message;
  }

  to_string() {
    return `${this.peer.id} [${this.lobby.peer_ids.join(',')}]`;
  }
}

export default Controller
