import Game from './game'
export class Controller {

  constructor (start_time) {
    this.game = new Game(start_time)
  }
}

export default Controller
