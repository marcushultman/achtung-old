export default class Random {
  constructor() {
    this.reset(0);
  }

  reset(seed) {
    this.seed = seed;
  }

  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  range(min, max) {
    min = min || 0;
    max = max || 1;
    return min + this.next() * (max - min);
  }

  color(n) {
    const x = this.range(0, n);
    const r = Math.floor(x) % 4;
    switch (r) {
    case 0:
      return '#FF0000';
    case 1:
      return 'cyan';
    case 2:
      return 'lime';
    case 3:
      return 'yellow';
    default:
      return 'white';
    }
  }
}