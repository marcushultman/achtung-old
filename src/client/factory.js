import Score from './score'
import Lobby from './lobby'
export class Factory {
  create_lobby (id) {
    return new Lobby(id)
  }
}

export default Factory
