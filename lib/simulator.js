import clientController from './client/controller'

const connect = (sender, id) => new Promise(_connect.bind(null, sender, id));
const send_msg = (sender, id, msg) => new Promise(_send_msg.bind(null, sender, id, msg));
const disconnect = (sender) => new Promise(_disconnect.bind(null, sender));

const _connect = (sender, id, resolve, reject) => {
  console.log(`${sender} -> ${id}: Connecting...`);
  setTimeout(() => {
    console.log(`${sender} -> ${id}: Connected!`);
    // Simulated as running on both machines
    resolve(Promise.all([
      Promise.all(peers[sender].on_connection(id) || []),
      Promise.all(peers[id].on_connection(sender, true) || [])]));
  }, 1000);
};
const _send_msg = (sender, id, msg, resolve, reject) => {
  console.log(`${sender} -> ${id}: Sending (${msg.type}, ${msg.payload})...`);
  setTimeout(() => {
    console.log(`${sender} -> ${id}: Sent!`);
    // Simulated as running on another machine
    resolve(Promise.all(peers[id].on_message(sender, msg) || []));
  }, 250);
};
const _disconnect = (sender, resolve, reject) => {
  setTimeout(() => {
    console.log(`${sender}: Disconnected!`);
    // Simulated as running on the other machines
    const remote_peers = Object.keys(peers);
    remote_peers.splice(remote_peers.indexOf(sender), 1);
    resolve(Promise.all(remote_peers.map(
      id => peers[id].on_connection_closed(sender))));
  }, 500);
};

const A = new clientController(() => 'A',
  connect.bind(null, 'A'),
  send_msg.bind(null, 'A'),
  disconnect.bind(null, 'A'),
  console.log.bind(null, 'LOG[A]:'));
const B = new clientController(() => 'B',
  connect.bind(null, 'B'),
  send_msg.bind(null, 'B'),
  disconnect.bind(null, 'B'),
  console.log.bind(null, 'LOG[B]:'));
const C = new clientController(() => 'C',
  connect.bind(null, 'C'),
  send_msg.bind(null, 'C'),
  disconnect.bind(null, 'C'),
  console.log.bind(null, 'LOG[C]:'));

const peers = {A,B,C};

function log_step(step) {
  console.log(`Step ${step}:`, A.to_string(), B.to_string(), C.to_string());
}

// Simulate
Promise.resolve()
.then(() => {
  log_step(1);
  return A.connect(B.peer.id);
})
.then(() => {
  log_step(2);
  return C.connect(A.peer.id);
})
.then(() => {
  log_step(3);
  return B.leave();
})
.then(() => {
  log_step(4);
  return B.connect(C.peer.id);
})
.then(() => {
  log_step(5);
})