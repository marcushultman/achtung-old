import clientController from './client/controller';
import networkController from './network/controller';

// Appliaction stack
const peer = new Peer({key: 'a9tqw8ex3zicz0k9', debug:2});
const connections = {};
var app = null;

peer.once('open', (id) => {
  // view
  const link_view = document.getElementById('id');
  const ping_view = document.getElementById('ping');
  const log_view = document.getElementById('log');
  function log(msg) {
    var item = document.createElement('li');
    item.innerHTML = msg;
    log_view.appendChild(item);
  }
  link_view.innerHTML = link_view.href = 'http://localhost:8080?game=' + id;
  ping_view.addEventListener('click', () => {
    app.lobby.peer_ids.forEach(peer => {
      send_message(peer, { type: 1337, payload: 'ping from ' + id });
    });
    log(`sending ping (${app.lobby.peer_ids.join(', ')})`);
  });
  // network
  function setup_connection(conn, peer_id, broadcast) {
    conn.once('open', () => on_connection_open(conn, peer_id, broadcast));
    conn.once('close', () => on_connection_closed(peer_id));
    conn.on('data', msg => app.on_message(peer_id, msg));
  }
  function on_connection_open(conn, peer_id, broadcast) {
    connections[peer_id] = conn;
    app.on_connection(peer_id, broadcast);
  }
  function on_connection_closed(peer_id) {
    app.on_connection_closed(peer_id);
    delete connections[peer_id];
  }
  peer.on('connection', conn =>
    setup_connection(conn, conn.peer, true));
  // delegates
  var connect = (peer_id) =>
    setup_connection(peer.connect(peer_id), peer_id);
  var send_message = (peer_id, msg) =>
    connections[peer_id] && connections[peer_id].send(msg);
  var disconnect = () =>
    Object.keys(connections).forEach(id => connections[id].close());
  // launch app
  app = new clientController(() => id, connect, send_message, disconnect, log);
  // main
  var peer_id = get_query_param('game');
  if (peer_id) {
    app.connect(peer_id);
  }
});

// helpers
function get_query_param(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
