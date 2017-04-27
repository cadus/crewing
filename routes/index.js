const babelify = require('babelify');
const browserify = require('browserify-middleware');
const express = require('express');
const path = require('path');
const keystone = require('keystone');
const cookieParser = require('cookie-parser');

const importRoutes = keystone.importer(__dirname);
const api = importRoutes('./api');
const Volunteer = keystone.list('Volunteer');

const commonPackages = ['react', 'react-dom', 'elemental', 'whatwg-fetch'];

// Setup Route Bindings
exports = module.exports = (app) => {
   app.enable('trust proxy');
   app.use(cookieParser());

   app.get('/', (req, res) => res.render('react', { page: 'signup' }));
   app.get('/missions', (req, res) => res.render('react', { page: 'missions' }));
   app.get('/volunteer', (req, res) => res.render('react', { page: 'volunteer' }));

   app.get('/volunteer/:token', api.volunteers.setToken);

   app.get('/api/missions', keystone.middleware.api, isAdmin, api.missions.all);
   app.post('/api/missions', keystone.middleware.api, api.missions.create);
   app.get('/api/missions/:id', keystone.middleware.api, hasToken, api.missions.one);
   app.put('/api/missions/:id', keystone.middleware.api, hasToken, api.missions.update);

   app.get('/api/volunteers', keystone.middleware.api, isAdmin, api.volunteers.all);
   app.get('/api/volunteer', keystone.middleware.api, hasToken, api.volunteers.one);
   app.put('/api/volunteer', keystone.middleware.api, hasToken, api.volunteers.update);
   app.post('/api/volunteer', keystone.middleware.api, api.volunteers.create);
   app.post('/api/volunteer/token', keystone.middleware.api, api.volunteers.changeToken);

   // Uploaded images should not be publicly accessible
   app.use('/uploads', isAdminOrOwner, express.static('uploads', { redirect: false }));

   // Bundle common packages
   app.get('/js/packages.js', browserify(commonPackages, { cache: true, precompile: true }));

   // Serve script bundles
   app.use('/js', browserify('./client/pages', {
      external: commonPackages,
      transform: [babelify.configure({ presets: ['es2015', 'react', 'stage-3'] })],
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

function isAdminOrOwner(req, res, next) {
   const token = req.signedCookies.volunteer;
   const filename = path.basename(req.url);
   const nope = () => res.sendStatus(403); // forbidden

   if (req.user) return next();
   if (!token) return nope();

   Volunteer.model
      .findOne({ token })
      .exec((err, volunteer) => {
         if (err || !volunteer) return nope();
         if (volunteer.hasFile(filename)) return next();
         nope();
      });
}
