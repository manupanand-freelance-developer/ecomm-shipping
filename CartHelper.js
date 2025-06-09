const axios = require('axios');

class CartHelper {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async addToCart(id, data) {
    try {
      const response = await axios.post(this.baseUrl + id, data, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
      });

      if (response.status === 200) {
        return response.data;
      } else {
        console.warn(`Failed with code ${response.status}`);
        return '';
      }
    } catch (error) {
      console.warn('HTTP client exception', error.message);
      return '';
    }
  }
}

module.exports = CartHelper;
