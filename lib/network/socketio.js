const URL = 'http://localhost:5000';

export default class Controller {

  constructor (on_initialized,
               on_open,
               on_closed,
               on_message) {
    this.socket = io(URL);
    this.connections = {};

    this.socket.once('connect', () => {
      this.id = this.socket.id;
      this.socket.on('connection', c => this.setup_connection(Connection.use(this.socket, c), true));
      on_initialized(this.id);
    });
    this.on_open = on_open;
    this.on_closed = on_closed;
    this.on_message = on_message;
  }

  connect(id) {
    console.log('connect')
    this.setup_connection(Connection.connect(this.socket, id));
  }

  setup_connection(connection, is_incoming) {
    connection.once('open', () => {
      const id = connection.peer;
      this.connections[id] = connection;
      console.log('once open')
      this.on_open(id, is_incoming);
    });
    connection.once('close', () => {
      const id = connection.peer;
      this.on_closed(id);
      delete this.connections[id];
    });
    connection.on('data', message => {
      this.on_message(connection.peer, JSON.parse(message))
    });
  }

  disconnect() {
    Object.values(this.connections).forEach(
      connection => connection.close());
    this.connections = {};
  }

  send_message(id, message) {
    console.log('send_message', this.connections);
    if (id in this.connections) {
      this.connections[id].send(JSON.stringify(message));
    } else if (id === this.id) {
      this.on_message(id, message);
    }
  }
}

class Connection {
  static use(socket, peer) {
    const connection = new Connection(socket, peer);
    connection._emit('peer_use');
    return connection;
  }
  static connect(socket, peer) {
    const connection = new Connection(socket, peer);
    connection._emit('peer_connect');
    return connection;
  }
  constructor (socket, peer) {
    this.socket = socket;
    this.peer = peer;
  }
  _emit(event) {
    this.socket.emit(event, this.peer);
  }
  send(message) {
    console.log('peer_data', this.peer, message);
    this.socket.emit('peer_data', this.peer, message);
  }
  close() {
    this.socket.emit('peer_disconnect', this.peer);
  }
  on(eventName, listener) {
    console.log('register on', this.peer + eventName);
    return this.socket.on(this.peer + eventName, listener);
  }
  once(eventName, listener) {
    console.log('register once', this.peer + eventName);
    return this.socket.once(this.peer + eventName, listener);
  }
}
