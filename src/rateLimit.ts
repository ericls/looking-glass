export default class RateLimiter {
  // single thread
  clientCounter: { [id: string]: number } = {};
  constructor(private window: number) {}
  incr = (id: string) => {
    if (!(id in this.clientCounter)) {
      this.clientCounter[id] = 1;
    } else {
      this.clientCounter[id] += 1;
    }
    setTimeout(() => {
      this.decr(id);
    }, this.window);
  };
  get = (id: string) => {
    return this.clientCounter[id] || 0;
  };
  private decr = (id: string) => {
    if (!(id in this.clientCounter)) return;
    this.clientCounter[id] -= 1;
    if (this.clientCounter[id] <= 0) {
      delete this.clientCounter[id];
    }
  };
}
