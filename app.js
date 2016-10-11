import EventEmitter from 'events';

// Appliaction stack
const peer = new Peer({key: 'a9tqw8ex3zicz0k9', debug:2});
const message_queue = new EventEmitter();

var app = null;

peer.once('open', (id) => {
  app = new clientController(() => id);
  // queued up events
  message_queue.on('connection' new_connection);
  message_queue.on('error' on_error);
  // peer events
  peer.on('connection', new_connection);
  peer.on('error', on_error);
  // event handlers
  function new_connection(connection) {
    connection.once('open', () => {
      // TODO: new peer connection message
      app.on_message({});
    });
    connection.on('data', (data) => {
      // TODO: preprocess data message
      app.on_message(data);
    });
  }
  function on_error(err) {
    // TODO: process error
    // app...
  }
});

// Main
function init() {
  var peer_id = get_query_param('join');
  if (peer_id) {
    join(peer_id);
  }
}
function join(peer_id) {
  var connection = peer.connect(peer_id);
  connection.once('open', on_join.bind(null, connection));
  peer.once('error', on_join_error.bind(null, peer_id));
}
function on_join(connection) {
  message_queue.emit('connection', connection);
}
function on_join_error(peer_id, err) {
  if (err.type == 'peer-unavailable' &&  == peer_id) {
    var id = err.toString().match(/ (\w+)$/)[1];
    if (id == peer_id) {
      // TODO: Could not connect to peer_id
    }
  } else {
    me.peer.once('error', on_join_error.bind(null, session));
  }
}

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
