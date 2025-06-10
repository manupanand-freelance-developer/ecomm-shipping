class Ship {
  constructor(distance = 0, cost = 0.0) {
    this.distance = distance;
    this.cost = cost;
  }

  toString() {
    return `Distance: ${this.distance} Cost: ${this.cost}`;
  }
}

module.exports = Ship;
