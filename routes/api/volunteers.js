const keystone = require('keystone');
const utils = require('keystone-utils');
const email = require('../email-helper');

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
         if (!volunteer) return res.apiNotFound();

         volunteer.verifyEmail();

         Mission.model
            .find({ 'crew.volunteer': volunteer })
            .select('name description status start end crew area commitmentMessage log')
            .sort('-start')
            .populate('crew.volunteer', 'name group')
            .populate('area')
            .exec((err2, mongoMissions) => {
               if (err2) return res.apiError(err2.detail.errmsg);
               const missions = filterCommitmentMessage(mongoMissions, volunteer);
               res.apiResponse({ volunteer, missions });
            });
      });
};

// only committed volunteers should see the commitment message
function filterCommitmentMessage(mongoMissions, volunteer) {
   const missions = mongoMissions.map(mission => mission.toJSON());
   const me = assignment => assignment.volunteer.id.toJSON() === volunteer.id;
   missions
      .filter(mission => mission.crew.find(me).status !== 'yes')
      .forEach((mission) => {
         delete mission.commitmentMessage;
         delete mission.log;
      });
   return missions;
}

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

      const sendEmail = email('volunteer-created.jade');
      const subject = 'crewing account created';
      const values = {
         name: volunteer.name.first,
         path: `/volunteer/${volunteer.token}`,
      };

      sendEmail(volunteer.email, subject, values)
         .then(() => res.apiResponse({ success: true }));
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
         if (!volunteer) return res.apiNotFound();

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
         if (!volunteer) return res.apiNotFound();

         volunteer.token = getToken();
         volunteer.save((err2) => {
            if (err2) return res.apiError(err2.detail.errmsg);

            const sendEmail = email('volunteer-token-changed.jade');
            const subject = 'crewing account login link';
            const values = {
               name: volunteer.name.first,
               path: `/volunteer/${volunteer.token}`,
            };

            sendEmail(volunteer.email, subject, values)
               .then(() => res.apiResponse({ success: true }));
         });
      });
};

/**
 * Change the Status of a Volunteer
 */
exports.changeMissionStatus = (req, res) => {
   const token = req.token;
   const missionID = req.params.id;
   const newStatus = req.query.status;
   const allowedStatus = ['pending', 'yes', 'no'];

   if (!allowedStatus.includes(newStatus)) {
      return res.apiNotAllowed();
   }

   Mission.model
      .findById(missionID)
      .populate('crew.volunteer', 'token name email')
      .exec((err, mission) => {
         if (err) return res.apiError(err.detail.errmsg);
         if (!mission) return res.apiNotFound();

         const match = mission.crew.find(a => a.volunteer.token === token);

         if (match) {
            match.status = newStatus;
            mission.save((err2) => {
               if (err2) return res.apiError(err2.detail.errmsg);

               if (newStatus === 'yes') {

                  const sendEmail = email('volunteer-commitment-message.jade');
                  const volunteer = match.volunteer;
                  const subject = 'welcome on board';
                  const values = {
                     name: volunteer.name.first,
                     content: mission.commitmentMessage.md,
                  };

                  sendEmail(volunteer.email, subject, values)
                     .then(() => res.apiResponse({
                        success: true,
                        commitmentMessage: mission.commitmentMessage,
                        log: mission.log,
                     }));
               }
               else res.apiResponse({ success: true });
            });
         }
         else res.apiNotFound();
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
         if (!volunteer) return res.apiNotFound();

         volunteer.remove((err2) => {
            if (err2) return res.apiError(err2.detail.errmsg);
            return res.apiResponse({ success: true });
         });
      });
};

/**
 * List all Volunteers
 */
exports.resendToken = (req, res) => {
   Volunteer.model.find({ isVerified: false }, (err, volunteers) => {
      if (err) return res.apiError(err.detail.errmsg);

      res.header('Content-Type', 'text/html; charset=utf-8');
      res.write('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head><body><h1>Sent to</h1><ul>');

      const sleep = s => new Promise(resolve => setTimeout(resolve, s * 1000));
      const sendEmail = email('volunteer-created.jade');
      const subject = 'crewing account created';

      const sendToVolunteer = (volunteer) => {
         const values = {
            name: volunteer.name.first,
            path: `/volunteer/${volunteer.token}`,
         };
         return sendEmail(volunteer.email, subject, values)
            .then(() => res.write(`<li>${volunteer.email}</li>`))
            .catch(err2 => res.write(`<li>Error for ${volunteer.email}: ${err2.toString()}</li>`));
      };

      let chain = Promise.resolve();
      volunteers.forEach((volunteer) => {
         chain = chain
            .then(() => sendToVolunteer(volunteer))
            .then(() => res.flush())
            .then(() => sleep(5));
      });

      chain.then(() => res.end('<h1>Done</h1>'));
   });
};
