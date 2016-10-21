import Score from './score'
import LocalWorm from './local_worm'
import Point from './point'
import CollisionUtil from './collision'
import Color from './color'

const LEFT = 0,
      RIGHT = 1;
const ACTION_TURN = 0,
      ACTION_TRANSFER = 1,
      EVENT_TRANSFER = 2,
      EVENT_DEATH = 3,
      ACTION_RESTART = 4;

export default class Game {

  constructor(id,
              send_message,
              back_to_configure,
              get_players,
              get_adjacent_player,
              get_side_from_player) {
    this.my_id = id;

    this.send_message = send_message;
    this.back_to_configure = back_to_configure;

    this.get_players = get_players;
    this.get_adjacent_player = get_adjacent_player;
    this.get_side_from_player = get_side_from_player;

    var canvas = document.getElementById('canvas');
    this.ctx = canvas.getContext('2d');
    this.width = this.ctx.canvas.width  = window.innerWidth;
    this.height = this.ctx.canvas.height = window.innerHeight;
    this.ctx.lineWidth = 5;

    var left = document.getElementById('left');
    var right = document.getElementById('right');

    left.addEventListener('touchstart', () => this.touch_down(LEFT));
    left.addEventListener('touchend', () => this.touch_up(LEFT));
    right.addEventListener('touchstart', () => this.touch_down(RIGHT));
    right.addEventListener('touchend', () => this.touch_up(RIGHT));

    left.addEventListener('mousedown', e => !e.sourceCapabilities.
      firesTouchEvents && this.touch_down(LEFT));
    left.addEventListener('mouseup', e => !e.sourceCapabilities.
      firesTouchEvents && this.touch_up(LEFT));
    right.addEventListener('mousedown', e => !e.sourceCapabilities.
      firesTouchEvents && this.touch_down(RIGHT));
    right.addEventListener('mouseup', e => !e.sourceCapabilities.
      firesTouchEvents && this.touch_up(RIGHT));

    left.addEventListener('contextmenu', e => e.preventDefault());
    right.addEventListener('contextmenu', e => e.preventDefault());

    this.menu_view = document.getElementById('menu');
    this.replay_view = document.getElementById('replay');
    this.configure_view = document.getElementById('configure');
    this.score_view = document.getElementById('score');

    this.replay_view.addEventListener('click', () => {
      this.send_message(0, {type: ACTION_RESTART});
    });
    this.configure_view.addEventListener('click', () => {
      this.back_to_configure();
    });

    this.start_game();
  }

  requestFrame() {
    requestAnimationFrame(t => this.main_loop(t));
  }

  start_game() {
    this.menu_view.style.display = 'none';

    this.score = new Score();

    this.worms = new Map();
    this.worm_host = this.my_id;

    const color = Color.get(this.get_players().sort().indexOf(this.my_id));
    this.worms.set(this.my_id, new LocalWorm(this.width, this.height, color));

    this.score_view.style.color = color;
    this.score_view.innerHTML = 0;

    this.elapsed_time = 0;
    this.max_fps = 30;
    this.game_over = false;
    this.game_time = performance.now();
    this.requestFrame();
  }

  main_loop(game_time) {
    if (game_time < this.game_time + (1000 / this.max_fps)) {
      this.requestFrame();
      return;
    }
    this.elapsed_time = game_time - this.game_time;
    this.game_time = game_time;

    this.update();
    this.draw();
    if (!this.game_over) {
      this.requestFrame();
    }
  }

  on_game_over() {
    this.game_over = true;
    this.menu_view.style.display = 'block';
    console.info('GAME OVER FOR ALL', this);
  }

  on_message(id, message) {
    switch (message.type) {
      case ACTION_TURN:
        return this.worms.get(id).set_turning(message.value);
      case ACTION_TRANSFER:
        const origin = this.get_side_from_player(id);
        let x, y, d;
        if (message.target === this.get_side_from_player(id)){
          x = ((message.position.x + 1) % 1) * this.width;
          y = ((message.position.y + 1) % 1) * this.height;
        } else {
          x = message.position.x;
          x = x < .5 ? -x : 2 - x;
          x *= this.width;
          y = 1 - message.position.y;
          y *= this.height;
        }
        const new_position = new Point(
          message.position.x * this.width,
          message.position.y * this.height);

        if (this.worms.has(message.owner)) {
          this.worms.get(message.owner).reset(
            new_position, message.direction, message.turning);
        } else {
          const worm = new LocalWorm(
            this.width, this.height, message.color);
          worm.reset(new_position, message.direction, message.turning);
          this.worms.set(message.owner, worm);
        }
        this.send_message(message.owner, {type: EVENT_TRANSFER});
        return;
      case EVENT_TRANSFER:
        this.worm_host = id;
        return;
      case EVENT_DEATH:
        const players = this.get_players();
        players.filter(id => id !== message.player)
               .forEach(id => this.score.add(id, 1));
        this.score_view.innerHTML = this.score.get(this.my_id);
        if (this.is_game_over(players.length)) {
          this.on_game_over();
        }
        return;
      case ACTION_RESTART:
        this.start_game();
        return;
    }
  }

  is_game_over(n) {
    return this.score.sum() >= (n - 1) * n / 2;
  }

  // todo: move these two to separate class
  touch_down(key) {
    this.send_message(this.worm_host, {
      type: ACTION_TURN, value: key == RIGHT ? 1 : -1
    });
    return true;
  }
  touch_up(key) {
    this.send_message(this.worm_host, {
      type: ACTION_TURN, value: 0
    });
    return true;
  }

  // =====

  transfer(id, target, worm) {
    var new_id = this.get_adjacent_player(target);
    if (new_id) {
      const x = worm.position.x / this.width;
      const y = worm.position.y / this.height;
      this.send_message(new_id, {
        type: ACTION_TRANSFER,
        owner: id,
        target: target,
        color: worm.color,
        position: {x, y},
        direction: worm.direction,
        turning: worm.turning
      });
    } else {
      this.report_death(id, worm);
    }
  }

  report_death(player, worm) {
    worm.kill();
    this.send_message(0, {type: EVENT_DEATH, player})
  }

  // =====

  update() {
    for (let [id, worm] of this.worms) {
      const updated = worm.update(this.elapsed_time,
        target => this.transfer(id, target, worm));
      if (updated && this.check_collision(worm)) {
        this.report_death(id, worm);
      }
    }
  }

  check_collision(worm) {
    for (let [id, other] of this.worms) {
      let prev = other.tail[0];
      let end_seg = other === worm ? -2 : undefined;
      for (let point of other.tail.slice(1, end_seg)) {
        if (!point.is_start) {
          const d = point.cp1 ?
            CollisionUtil.bezier_dist2(prev.position, point.cp1, point.cp2, point.position, worm.position) :
            CollisionUtil.line_dist2(prev.position, point.position, worm.position);
          if (d < 25) {
            return true;
          }
        }
        prev = point;
      }
    }
    return false;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (let worm of this.worms.values()) {
      worm.draw(this.ctx);
    }
  }
}