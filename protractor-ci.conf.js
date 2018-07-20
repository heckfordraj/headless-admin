const config = require('./protractor.conf').config;

config.capabilities = {
  browserName: 'chrome',
  chromeOptions: {
    args: ['--no-sandbox', '--headless', '--disable-gpu',]
  }
};

exports.config = config;
