const keystone = require('keystone');
const utils = require('keystone-utils');
const Email = require('keystone-email');

const Volunteer = keystone.list('Volunteer');
const Mission = keystone.list('Mission');

const getToken = () => utils.randomString(64);

const setCookie = (res, token) => {
   const maxAge = 1000 * 60 * 60 * 24 * 30; // 30 days
   res.cookie('volunteer', token, { maxAge, httpOnly: true, signed: true });
};

/**
 * Set Token as Cookie and redirect
 */
exports.setToken = (req, res) => {
   setCookie(res, req.params.token);
   res.redirect('/volunteer');
};

/**
 * List all Volunteers
 */
exports.all = (req, res) => {
   Volunteer.model.find((err, volunteers) => {
      if (err) return res.apiError('database error', err);
      res.apiResponse({ volunteers });
   });
};

/**
 * Get Volunteer by ID
 */
exports.one = (req, res) => {
   Volunteer.model
      .findOne({ token: req.token })
      .exec((err, volunteer) => {
         if (err) return res.apiError('database error', err);
         if (!volunteer) return res.apiError('not found');

         Mission.model
            .find({ crew: volunteer })
            .select('name status start end')
            .sort('-start')
            .exec((err2, missions) => {
               if (err2) return res.apiError('database error', err);
               res.apiResponse({ volunteer, missions });
            });
      });
};

/**
 * Create a Volunteer
 */
exports.create = (req, res) => {
   const volunteer = new Volunteer.model();

   volunteer.getUpdateHandler(req).process(req.body, (err) => {
      if (err) return res.apiError('error', err);

      new Email('templates/emails/volunteer-created.jade', { transport: 'mailgun' })
         .send({
            name: volunteer.name.first,
            link: `/volunteer/${volunteer.token}`,
            host: `${req.protocol}://${req.get('host')}`,
         }, {
            from: { name: 'cadus', email: 'crewing@cadus.org' },
            to: volunteer.email,
            subject: 'crewing account created',
         }, () => res.apiResponse({ success: true }));
   });
};

/**
 * Update a Volunteers Data
 */
exports.update = (req, res) => {
   Volunteer.model
      .findOne({ token: req.token })
      .exec((err, volunteer) => {
         if (err) return res.apiError('database error', err);
         if (!volunteer) return res.apiError('not found');

         volunteer.getUpdateHandler(req).process(req.body, (err2) => {
            if (err2) return res.apiError('update error', err2);
            res.apiResponse({ volunteer });
         });
      });
};

/**
 * Update a Volunteers Token
 */
exports.changeToken = (req, res) => {
   Volunteer.model
      .findOne({ email: req.body.email })
      .exec((err, volunteer) => {
         if (err) return res.apiError('database error', err);
         if (!volunteer) return res.apiError('not found');

         volunteer.token = getToken();
         volunteer.save((err2) => {
            if (err2) return res.apiError('update error', err2);

            new Email('templates/emails/volunteer-token-changed.jade', { transport: 'mailgun' })
               .send({
                  name: volunteer.name.first,
                  link: `/volunteer/${volunteer.token}`,
                  host: `${req.protocol}://${req.get('host')}`,
               }, {
                  from: { name: 'cadus', email: 'crewing@cadus.org' },
                  to: volunteer.email,
                  subject: 'crewing account login link',
               }, () => res.apiResponse({ success: true }));
         });
      });
};

/**
 * Delete Volunteer by ID
 */
exports.remove = (req, res) => {
   Volunteer.model
      .findOne({ token: req.token })
      .exec((err, volunteer) => {
         if (err) return res.apiError('database error', err);
         if (!volunteer) return res.apiError('not found');

         volunteer.remove((err2) => {
            if (err2) return res.apiError('database error', err2);
            return res.apiResponse({ success: true });
         });
      });
};
