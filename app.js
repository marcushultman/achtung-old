import clientController from './client/controller';

// Appliaction stack
const peer = new Peer({key: 'a9tqw8ex3zicz0k9', debug:2});
const connections = {};
var app = null;

peer.once('open', (id) => {
  app = new clientController(() => id,
                             connect,
                             send_message,
                             disconnect);
  peer.on('connection', on_connection);
  // event handlers
  function on_connection(connection) {
    const peer_id = connection.peer;
    connection.once('open', () => app.on_connection(peer_id));
    connection.on('data', (msg) => app.on_message(peer_id, msg));
  }
  function connect(peer_id) {
    return new Promise(function(resolve, reject) {
      const connection = peer.connect(peer_id);
      connection.once('open', () => {
        connections[peer_id] = connection;
        resolve();
      });
      peer.once('error', () => reject());
    });
  }
  function send_message(peer_id, msg) {
    if (connections[peer_id]) {
      connections[peer_id].send(msg);
    }
  }
  function disconnect() {
    const remote_peers = Object.keys(connections);
    remote_peers.forEach(id => connections[id].close());
  }
});

// Main
function init() {
  var peer_id = get_query_param('join');
  if (peer_id) {
    app.join(peer_id);
  }
}
// function join(peer_id) {
//   var connection = peer.connect(peer_id);
//   connection.once('open', on_join.bind(null, connection));
//   peer.once('error', on_join_error.bind(null, peer_id));
// }
// function on_join(connection) {
//   message_queue.emit('connection', connection);
// }
// function on_join_error(peer_id, err) {
//   if (err.type == 'peer-unavailable' &&  == peer_id) {
//     var id = err.toString().match(/ (\w+)$/)[1];
//     if (id == peer_id) {
//       // TODO: Could not connect to peer_id
//     }
//   } else {
//     me.peer.once('error', on_join_error.bind(null, session));
//   }
// }

// Helpers
function get_query_param(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
