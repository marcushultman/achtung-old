const CLEAR = 0, PENDING = 1, BREAK = 2;
const TOP = 1, LEFT = 2, RIGHT = 3, BOTTOM = 4;
const DIRECTION = {top: TOP, left: LEFT, right: RIGHT, bottom: BOTTOM};
const GREEN = 'rgba(0,255,0,0.2)',
      YELLOW = 'rgba(255,255,0,0.2)',
      TRANSPARENT = 'transparent';

export default class Pairing {

  constructor(send_message,
              start_game,
              log) {
    this.send_message = send_message;
    this.start_game = start_game;

    this.views = {};
    this.update();

    this.log = log;
  }

  reset() {
    this.neighbours = null;
    this.update();
  }

  update() {
    this.state = {};
    this.neighbours = this.neighbours || new Map();

    this.views[TOP] = document.getElementById('top');
    this.views[LEFT] = document.getElementById('left');
    this.views[RIGHT] = document.getElementById('right');
    this.views[BOTTOM] = document.getElementById('bottom');
    for (const [area, peer] of this.neighbours) {
      this.views[area].style.backgroundColor = peer ? GREEN : TRANSPARENT;
    }
    this.views[TOP].addEventListener('click', e => this.on_touch_event(e, 1));
    this.views[BOTTOM].addEventListener('click', e => this.on_touch_event(e, -1));
    var start = document.getElementById('start');
    start.addEventListener('click', e => this.start_game());
    // {
    //   if (this.neighbours.size > 0) {
    //     this.start_game();
    //   } else {
    //     this.log('Play alone? Don\'t be pathetic..');
    //   }
    // });
  }

  on_touch_event(e, mirror) {
    const x = 2 * e.x / e.target.offsetWidth - 1;
    const y = 1 - e.y / e.target.offsetHeight;
    const f = x => mirror * Math.abs(x);
    const SIDE = x < 0 ? LEFT : RIGHT;
    this.on_area_selected(y < 0 ?
      (y < f(x) ? BOTTOM : SIDE) :
      (y > f(x) ? TOP : SIDE));
  }

  on_area_selected(area) {
    if (this.state.sender && this.new_neighbour(area, this.state.sender)) {
      this.send_message(CLEAR);
      this.state = {};

      this.views[area].style.backgroundColor = GREEN;
    } else if (this.state.area === area) {
      this.send_message(CLEAR);
      this.state = {};

      this.views[area].style.backgroundColor = TRANSPARENT;
    } else if (!this.neighbours.has(area)) {
      if (this.state.area) {
        this.views[this.state.area].style.backgroundColor = TRANSPARENT;
      }
      this.send_message(PENDING);
      this.state = { area };

      this.views[this.state.area].style.backgroundColor = YELLOW;
    } else {
      this.send_message(BREAK, this.neighbours.get(area));
      this.neighbours.delete(area);

      this.views[area].style.backgroundColor = TRANSPARENT;
    }
  }

  on_state_update(sender, flag) {
    if (flag === BREAK) {
      let area;
      if ((area = this.has_neighbour(sender))) {
        this.neighbours.delete(area);
        this.views[area].style.backgroundColor = TRANSPARENT;
      }
    } else if (flag === PENDING) {
      if (this.has_neighbour(sender)) {
        this.log(sender +' awaits another partner...');
      } else if (sender !== this.state.sender){
        this.state = { sender };
        this.log(sender +' wants a partner!');
      }
    } else if (this.state.area) {
      this.new_neighbour(this.state.area, sender);
      this.views[this.state.area].style.backgroundColor = GREEN;
      this.state = {};
    }
  }

  on_peer_joined(peer) {
    if (this.state.area) {
      this.send_message(PENDING);
    }
  }
  on_peer_left(peer) {
    for (let [area, neighbour] of this.neighbours.entries()) {
      if (neighbour === peer) {
        this.neighbours.delete(area);
        this.views[area].style.backgroundColor = TRANSPARENT;
        break;
      }
    }
  }

  new_neighbour(area, sender) {
    const add = !this.neighbours.has(area) && !this.has_neighbour(sender)
    if (add) { this.neighbours.set(area, sender); }
    return add;
  }
  has_neighbour(id) {
    for (const [area, neighbour] of this.neighbours) {
      if (neighbour === id) { return area; }
    }
    return null;
  }
}