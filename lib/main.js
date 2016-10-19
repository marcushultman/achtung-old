import clientController from './client/controller';
import networkController from './network/controller';

// Appliaction stack
const peer = new Peer({key: 'a9tqw8ex3zicz0k9', debug:2});
const connections = {};
var app = null;
var network = new networkController(
  (id) => initialize(id),
  (id, is_incoming) => app.on_connection(id, is_incoming),
  (id) => app.on_connection_closed(id),
  (id, message) => app.on_message(id, message));

function initialize(id) {
  // view
  const link_view = document.getElementById('id');
  const ping_view = document.getElementById('ping');
  const log_view = document.getElementById('log');
  // log function
  function log(msg) {
    var item = document.createElement('li');
    item.innerHTML = msg;
    log_view.appendChild(item);
  }
  link_view.innerHTML = link_view.href = 'http://localhost:8080?game=' + id;
  ping_view.addEventListener('click', () => {
    app.lobby.peer_ids.forEach(peer => {
      network.send_message(peer, { type: 1337, payload: 'ping from ' + id });
    });
    log(`sending ping (${app.lobby.peer_ids.join(', ')})`);
  });

  // launch app
  app = new clientController(() => id,
    id => network.connect(id),
    (id, message) => network.send_message(id, message),
    () => network.disconnect(),
    log);
  // main
  var peer_id = get_query_param('game');
  if (peer_id) {
    network.connect(peer_id);
  }
}

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
