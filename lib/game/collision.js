// cubic bezier curve B(t)
const B = (P0, P1, P2, P3, t) => {
  const t_  = 1 - t, t_2 = t_ * t_, t2  = t * t;
  return P0.mul(t_*t_2).add(P1.mul(3*t_2*t)).add(P2.mul(3*t_*t2)).add(P3.mul(t*t2));
};
const dot = (a, b) => a.x * b.x + a.y * b.y;

export default class CollisionUtil {
  static bezier_dist2(P0, P1, P2, P3, P) {
    let d = Infinity;
    for (let t = 0; t < 1; t += .2) {
      d = Math.min(d, B(P0, P1, P2, P3, t).sub(P).len2());
    }
    return d;
  }
  static line_dist2(P0, P1, P) {
    let A = P1.sub(P0);
    let B = P.sub(P0);
    let d = dot(A, B) / A.len2();
    if (d < 0) {
      return P.sub(P0).len2();
    } else if (d > 1) {
      return P.sub(P1).len2();
    } else {
      return B.sub(A.mul(d)).len2();
    }
  }
}