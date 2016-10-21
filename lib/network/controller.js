const API_KEY = 'a9tqw8ex3zicz0k9';

export default class Controller {

  constructor (on_initialized,
               on_open,
               on_closed,
               on_message) {
    this.peer = new Peer({key: API_KEY});
    this.connections = {};

    this.peer.once('open', id => {
      this.id = id;
      this.peer.on('connection', c => this.setup_connection(c, true));
      on_initialized(id);
    });
    this.on_open = on_open;
    this.on_closed = on_closed;
    this.on_message = on_message;
  }

  connect(id) {
    this.setup_connection(this.peer.connect(id));
  }

  setup_connection(connection, is_incoming) {
    connection.once('open', () => {
      const id = connection.peer;
      this.connections[id] = connection;
      this.on_open(id, is_incoming);
    });
    connection.once('close', () => {
      const id = connection.peer;
      this.on_closed(id);
      delete this.connections[id];
    });
    connection.on('data', message => {
      this.on_message(connection.peer, message)
    });
  }

  disconnect() {
    Object.values(this.connections).forEach(
      connection => connection.close());
    this.connections = {};
  }

  send_message(id, message) {
    if (id in this.connections) {
      this.connections[id].send(message);
    } else if (id === this.id) {
      this.on_message(id, message);
    }
  }
}