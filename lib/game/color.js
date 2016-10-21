export default class Color {
  static get(n) {
    switch(n % 4) {
      case 0:
        return 'red';
      case 1:
        return 'cyan';
      case 2:
        return 'lime';
      case 3:
        return 'yellow';
    }
  }
}