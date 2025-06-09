const express = require('express');
const { City, Code, Op, sequelize } = require('./models');
const Ship = require('./Ship');
const Calculator = require('./Calculator');
const CartHelper = require('./CartHelper');
const pino = require('pino');
const pinoHttp = require('pino-http');
require('dotenv').config();

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // prettyPrint: process.env.NODE_ENV !== 'production',
});

const app = express();

app.use(pinoHttp({ logger }));

app.use(express.json());

const DATA_CENTERS = [
  "asia-northeast2",
  "asia-south1",
  "europe-west3",
  "us-east1",
  "us-west1"
];

// Middleware to tag request with datacenter, like Java interceptor
app.use((req, res, next) => {
  const datacenter = DATA_CENTERS[Math.floor(Math.random() * DATA_CENTERS.length)];
  req.log.info(`Request tagged with datacenter: ${datacenter}`);
  next();
});

const CART_URL = `http://${process.env.CART_ENDPOINT || 'cart'}/shipping/`;

// Memory allocation endpoints (to mimic Java memory test endpoints)
const bytesGlobal = [];

app.get('/memory', (req, res) => {
  try {
    const bytes = Buffer.alloc(25 * 1024 * 1024, 8);
    bytesGlobal.push(bytes);
    req.log.info(`Allocated 25MB buffer, total allocations: ${bytesGlobal.length}`);
    return res.json({ allocations: bytesGlobal.length });
  } catch (error) {
    req.log.error(error, 'Error allocating memory buffer');
    return res.status(500).send('Internal Server Error');
  }
});

app.get('/free', (req, res) => {
  try {
    bytesGlobal.length = 0;
    req.log.info('Cleared all allocated memory buffers');
    return res.json({ allocations: bytesGlobal.length });
  } catch (error) {
    req.log.error(error, 'Error clearing memory buffers');
    return res.status(500).send('Internal Server Error');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  try {
    req.log.info('Health check requested');
    return res.send('OK');
  } catch (error) {
    req.log.error(error, 'Error during health check');
    return res.status(500).send('Internal Server Error');
  }
});

// Count total cities (like Java /count)
app.get('/count', async (req, res) => {
  try {
    const count = await City.count();
    req.log.info(`City count retrieved: ${count}`);
    return res.json({ count });
  } catch (error) {
    req.log.error(error, 'Error counting cities');
    return res.status(500).json({ error: 'Error counting cities' });
  }
});
// Get all codes sorted by name
app.get('/codes', async (req, res) => {
  try {
    const codes = await Code.findAll({ order: [['name', 'ASC']] });
    req.log.info(`Fetched ${codes.length} codes`);
    return res.json(codes);
  } catch (error) {
    req.log.error(error, 'Error fetching codes');
    return res.status(500).send('Error fetching codes');
  }
});

// Get cities by country code
app.get('/cities/:code', async (req, res) => {
  const code = req.params.code;
  if (!code || code.length !== 2) {
    return res.status(400).json({ error: 'Invalid country code' });
  }
  try {
    const cities = await City.findAll({ where: { code } });
    req.log.info(`Fetched ${cities.length} cities for code: ${code}`);
    return res.json(cities);
  } catch (error) {
    req.log.error(error, `Error fetching cities for code: ${code}`);
    return res.status(500).json({ error: 'Error fetching cities' });
  }
});
// Match cities by code and city name prefix (min 3 chars)
app.get('/match/:code/:text', async (req, res) => {
  const { code, text } = req.params;
  if (text.length < 3) {
    req.log.warn(`Match request with too short text: '${text}'`);
    return res.status(400).send('Text too short');
  }
  try {
    const cities = await City.findAll({
      where: {
        code,
        city: { [Op.like]: `${text}%` }
      },
      limit: 10,
    });
    req.log.info(`Matched ${cities.length} cities for code: ${code} and text: '${text}'`);
    return res.json(cities);
  } catch (error) {
    req.log.error(error, `Error matching cities for code: ${code} and text: '${text}'`);
    return res.status(500).send('Error matching cities');
  }
});

// Calculate shipping cost and distance
app.get('/calc/:id', async (req, res) => {
  const homeLatitude = 51.164896;
  const homeLongitude = 7.068792;
  try {
    const city = await City.findByPk(req.params.id);
    if (!city) {
      req.log.warn(`City not found with id: ${req.params.id}`);
      return res.status(404).send('City not found');
    }
    const calc = Calculator.fromCity(city);
    const distance = calc.getDistance(homeLatitude, homeLongitude);
    const cost = Math.round(distance * 5) / 100.0;
    const ship = new Ship(distance, cost);
    req.log.info(`Calculated shipping: ${ship.toString()} for city id: ${req.params.id}`);
    return res.json(ship);
  } catch (error) {
    req.log.error(error, `Error calculating shipping for city id: ${req.params.id}`);
    return res.status(500).send('Error calculating shipping');
  }
});

// Confirm shipping by posting to cart service
app.post('/confirm/:id', async (req, res) => {
  const helper = new CartHelper(CART_URL);
  try {
    const cart = await helper.addToCart(req.params.id, req.body);
    if (!cart) {
      req.log.warn(`Cart not found for id: ${req.params.id}`);
      return res.status(404).send('Cart not found');
    }
    req.log.info(`Shipping confirmed for cart id: ${req.params.id}`);
    return res.json(cart);
  } catch (error) {
    req.log.error(error, `Error confirming shipping for cart id: ${req.params.id}`);
    return res.status(500).send('Error confirming shipping');
  }
});

// Example: global error handler middleware (add near end of middleware chain)
app.use((err, req, res, next) => {
  req.log.error(err, 'Unhandled error');
  res.status(500).json({ error: 'Internal Server Error' });
});
// Start server and connect to DB (retry logic similar to Java)
const PORT = process.env.PORT || 8080;
const startServer = async () => {
  try {
    logger.info(`Trying to connect to database at host: ${process.env.DB_HOST}`);
    await sequelize.authenticate();
    logger.info('Database connected successfully');
    app.listen(PORT, () => {
      logger.info(`Shipping service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(error, 'Unable to connect to database');
    process.exit(1); // Exit with error, as DB connection failed
  }
};

startServer();
