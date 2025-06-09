class Calculator {
  constructor(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  static fromCity(city) {
    return new Calculator(city.latitude, city.longitude);
  }

  getDistance(targetLatitude, targetLongitude) {
    const earthRadius = 6371e3; // meters

    const toRadians = (deg) => (deg * Math.PI) / 180;

    const latitudeR = toRadians(this.latitude);
    const targetLatitudeR = toRadians(targetLatitude);
    const diffLatR = toRadians(targetLatitude - this.latitude);
    const diffLongR = toRadians(targetLongitude - this.longitude);

    const a =
      Math.sin(diffLatR / 2) ** 2 +
      Math.cos(latitudeR) * Math.cos(targetLatitudeR) * Math.sin(diffLongR / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round((earthRadius * c) / 1000); // distance in km (rounded)
  }
}

module.exports = Calculator;
