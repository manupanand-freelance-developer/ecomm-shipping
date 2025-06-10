'use strict';

exports.config = {
  app_name: ['catalogue-service'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY || 'your_license_key_here',
  logging: {
    level: 'info', // or 'trace' for debug
  },
  allow_all_headers: true,
  attributes: {
    enabled: true
  }
};
