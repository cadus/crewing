const keystone = require('keystone');
const utils = require('keystone-utils');
const Email = require('keystone-email');
const mailConfig = require('../../config').mail;

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
      if (err) return res.apiError(err.detail.errmsg);
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
         if (err) return res.apiError(err.detail.errmsg);
         if (!volunteer) return res.apiError('not found');

         volunteer.verifyEmail();

         Mission.model
            .find({ 'crew.volunteer': volunteer })
            .select('name status start end crew area')
            .sort('-start')
            .populate('crew.volunteer', 'name group')
            .populate('area')
            .exec((err2, missions) => {
               if (err2) return res.apiError(err2.detail.errmsg);
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

      if (err) {
         const message = err.detail.code === 11000
            ? 'user already exists'
            : err.detail.errmsg || err.error;
         return res.apiError(message);
      }

      const callback = () => res.apiResponse({ success: true });

      new Email('templates/emails/volunteer-created.jade', { transport: 'nodemailer' })
         .send({
            name: volunteer.name.first,
            link: `/volunteer/${volunteer.token}`,
            host: `${req.protocol}://${req.get('host')}`,
         }, {
            from: mailConfig.sender,
            to: volunteer.email,
            subject: 'crewing account created',
            nodemailerConfig: mailConfig.nodemailerConfig,
         }, callback);
   });
};

/**
 * Update a Volunteers Data
 */
exports.update = (req, res) => {
   Volunteer.model
      .findOne({ token: req.token })
      .exec((err, volunteer) => {
         if (err) return res.apiError(err.detail.errmsg);
         if (!volunteer) return res.apiError('not found');

         volunteer.getUpdateHandler(req).process(req.body, (err2) => {
            if (err2) return res.apiError(err2.detail.errmsg);
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
         if (err) return res.apiError(err.detail.errmsg);
         if (!volunteer) return res.apiError('not found');

         volunteer.token = getToken();
         volunteer.save((err2) => {
            if (err2) return res.apiError(err2.detail.errmsg);

            const callback = () => res.apiResponse({ success: true });

            new Email('templates/emails/volunteer-token-changed.jade', { transport: 'nodemailer' })
               .send({
                  name: volunteer.name.first,
                  link: `/volunteer/${volunteer.token}`,
                  host: `${req.protocol}://${req.get('host')}`,
               }, {
                  from: mailConfig.sender,
                  to: volunteer.email,
                  subject: 'crewing account login link',
                  nodemailerConfig: mailConfig.nodemailerConfig,
               }, callback);
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
         if (err) return res.apiError(err.detail.errmsg);
         if (!volunteer) return res.apiError('not found');

         volunteer.remove((err2) => {
            if (err2) return res.apiError(err2.detail.errmsg);
            return res.apiResponse({ success: true });
         });
      });
};
