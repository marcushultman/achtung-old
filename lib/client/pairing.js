const CLEAR = 0, PENDING = 1;
const TOP = 1, LEFT = 2, RIGHT = 3, BOTTOM = 4;

export class Pairing {

  constructor(broadcast_delegate) {
    this.broadcast = broadcast_delegate;
    this.view = document.getElementById('button_view');
    this.on_touch_event = e => this._on_touch_event(e);
    this.view.addEventListener('click', this.on_touch_event);

    this.reset();
  }

  _on_touch_event(e) {
    var x = e.x / e.target.offsetWidth;
    var y = e.y / e.target.offsetHeight;
    this.on_area_selected(x < y ?
      (1 - x < y ? BOTTOM : LEFT) :
      (1 - x < y ? RIGHT : TOP));
  }

  on_area_selected(area) {
    if (this.state.sender) {
      this.broadcast(CLEAR);
      this.new_neightbour(area, this.state.sender);
      this.state = {};
    } else if (!this.state.area) {
      this.broadcast(PENDING);
      this.state = { area };
    }
  }

  on_state_update(sender, flag) {
    if (flag) {
      this.state = { sender };
      return;
    } else if (this.state.area) {
      this.new_neightbour(this.state.area, sender);
    }
    this.state = {};
  }

  new_neightbour(area, sender) {
    this.neighbours[this.state.area] = sender;
    console.log(this.neighbours);
  }

  reset() {
    this.state = {};
    this.neighbours = {
      top: null,
      left: null,
      right: null,
      bottom: null,
    };
  }
}

export default Pairing;
