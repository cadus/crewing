require('dotenv').config();

const keystone = require('keystone');
const config = require('./config');

keystone.init(config.options);
keystone.import('models');
keystone.set('locals', config.locals);
keystone.set('routes', require('./routes'));
keystone.set('nav', config.nav);
keystone.start();
