const babelify = require('babelify');
const browserify = require('browserify-middleware');
const express = require('express');
const keystone = require('keystone');
const cookieParser = require('cookie-parser');

const importRoutes = keystone.importer(__dirname);
const api = importRoutes('./api');

const commonPackages = ['react', 'react-dom', 'elemental', 'whatwg-fetch'];

// Setup Route Bindings
exports = module.exports = (app) => {
   app.use(cookieParser());

   app.get('/', (req, res) => res.render('react', { page: 'signup' }));
   app.get('/volunteer', (req, res) => res.render('react', { page: 'volunteer' }));

   app.get('/volunteer/:token', api.volunteers.setToken);

   app.get('/api/volunteers', keystone.middleware.api, isAdmin, api.volunteers.all);
   app.get('/api/volunteer', keystone.middleware.api, hasToken, api.volunteers.one);
   app.put('/api/volunteer', keystone.middleware.api, hasToken, api.volunteers.update);
   app.post('/api/volunteer', keystone.middleware.api, api.volunteers.create);
   app.post('/api/volunteer/token', keystone.middleware.api, api.volunteers.changeToken);

   // Uploaded images should not be publicly accessible
   app.use('/uploads', hasTokenOrIsAdmin, express.static('uploads'));

   // Bundle common packages
   app.get('/js/packages.js', browserify(commonPackages, { cache: true, precompile: true }));

   // Serve script bundles
   app.use('/js', browserify('./client/pages', {
      external: commonPackages,
      transform: [babelify.configure({ presets: ['es2015', 'react'] })],
   }));

   app.disable('x-powered-by');
};


// Helper Functions

function hasToken(req, res, next) {
   const token = req.signedCookies.volunteer;
   if (!token) return res.apiError('no token');
   req.token = token;
   next();
}

function isAdmin(req, res, next) {
   if (!req.user) return res.apiError('insufficient rights');
   next();
}

function hasTokenOrIsAdmin(req, res, next) {
   if (!req.user && !req.signedCookies.volunteer) { // TODO should only allow owner not all (alleged) volunteers
      return res.sendStatus(403); // forbidden
   }
   next();
}
