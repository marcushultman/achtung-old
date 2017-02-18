import Client from './client/controller';
import Network from './network/socketio';
import Game from './game/game';
import Score from './game/score';

// Application stack
let network = null,
    app = null,
    game = null;
    //total_score = new Score();

const _app = {
  on_open: (id, is_incoming) => {
    app.on_connection(id, is_incoming);
  },
  on_closed: (id) => {
    app.on_connection_closed(id);
  },
  on_message: (id, message) => {
    app.on_message(id, message);
  },
  send_session_message: (id, payload) => {
    app.send_session_message(id, payload);
  },
  end_session: () => {
    app.end_session();
  },
  get_peers: () => {
    return app.get_peers();
  },
  get_adjacent_peer: (side) => {
    return app.get_adjacent_peer(side);
  },
  get_side_from_peer: (id) => {
    return app.get_side_from_peer(id);
  }
};
const _network = {
  connect: (id) => {
    network.connect(id);
  },
  send_message: (id, message) => {
    network.send_message(id, message);
  },
  disconnect: () => {
    network.disconnect();
  }
};
const _game = {
  on_start: (rng_seed) => {
    load_view('game.html').then(() => {
      game = new Game(app.peer.id,
        _app.send_session_message,
        _app.end_session,
        _app.get_peers,
        _app.get_adjacent_peer,
        _app.get_side_from_peer);
    });
  },
  on_message: (id, message) => {
    game.on_message(id, message.payload);
  },
  on_ended: () => {
    load_view('configure.html').then(() => {
      app.pairing.update();
    });
  }
};

network = new Network(
  id => initialize(id),
  _app.on_open,
  _app.on_closed,
  _app.on_message);

// todo: move to view module
function load_view(source) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open('GET', source);
    req.onload = (e) => {
      const target = document.getElementById("view");
      target.innerHTML = req.responseText;
      resolve();
    };
    req.onerror = e => reject(e);
    req.send(null);
  });
}

// todo: move into app
const app_view = load_view('configure.html');

function initialize(id) {
  // load configure then launch
  app_view.then(() => {
    // launch app
    app = new Client(id,
      _network.connect,
      _network.send_message,
      _network.disconnect,
      _game.on_start,
      _game.on_message,
      _game.on_ended,
      log);
    const peer_id = get_query_param('game');
    if (peer_id) {
      app.connect(peer_id);
    }
    window.history.pushState(null, null, '?game=' + id);
  });
}

// dev: keyboard support
document.addEventListener('keydown', (e) => {
  if (!e.repeat) {
    if (e.keyCode === 39) {
      game.touch_down(1);
    } else if (e.keyCode === 37) {
      game.touch_down(0);
    }
  }
});
document.addEventListener('keyup', (e) => {
  if (e.keyCode === 39 || e.keyCode === 37) {
    game.touch_up();
  }
});

// dev: log
function log(msg) {
  var item = document.createElement('li');
  item.innerHTML = msg;
  document.getElementById('log').appendChild(item);
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