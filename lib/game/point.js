export default class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y !== undefined ? y : x;
  }
  add(p) {
    return new Point(this.x + p.x, this.y + p.y);
  }
  sub(p) {
    return new Point(this.x - p.x, this.y - p.y);
  }
  mul(v) {
    return new Point(this.x * v, this.y * v);
  }
  div(v) {
    return new Point(this.x / v, this.y / v);
  }
  len2() {
    return Math.abs(this.x*this.x+this.y*this.y);
  }
}