import Peer from './peer'
export class Controller {

  constructor (id_generator) {
    this.peer = new Peer(id_generator())
  }
}

export default Controller
