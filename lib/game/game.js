import LocalWorm from './local_worm'
export class Game {

  constructor (start_time) {
    this.worms = [new LocalWorm(id_generator())]
    this.start_time = start_time
  }
}

export default Game
