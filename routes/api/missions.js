const keystone = require('keystone');
const Email = require('keystone-email');
const mailConfig = require('../../config').mail;

const Volunteer = keystone.list('Volunteer');
const Mission = keystone.list('Mission');

/**
 * List all Missions
 */
exports.all = (req, res) => {
   Mission.model
      .find({})
      .sort('-start')
      .populate('crew', 'name')
      .populate('area')
      .exec((err, missions) => {
         if (err) return res.apiError(err.detail.errmsg);
         res.apiResponse({ missions });
      });
};

/**
 * Get Mission by ID
 */
exports.one = (req, res) => {
   Mission.model
      .findById(req.params.id, (err, mission) => {
         if (err) return res.apiError(err.detail.errmsg);
         if (!mission) return res.apiError('not found');
         res.apiResponse({ mission });
      });
};

/**
 * Create a Mission
 */
exports.create = (req, res) => {
   const mission = new Mission.model();

   mission.getUpdateHandler(req).process(req.body, (err) => {
      if (err) return res.apiError(err.detail.errmsg);
      res.apiResponse({ success: true });
   });
};

/**
 * Update a Missions Data
 */
exports.update = (req, res) => {
   const newData = req.body;

   Mission.model
      .findById(req.params.id, (err, mission) => {
         if (err) return res.apiError(err.detail.errmsg);
         if (!mission) return res.apiError('not found');

         const data = {};

         if (newData.crew) {
            const oldCrewIDs = mission.crew.map(a => a.volunteer.toString());
            const newCrewIDs = newData.crew.map(a => a.volunteer);

            data.removed = oldCrewIDs.filter(id => !newCrewIDs.includes(id));
            data.added = newCrewIDs.filter(id => !oldCrewIDs.includes(id));

            if (newData.start || newData.end) {
               data.unchanged = oldCrewIDs.filter(id => newCrewIDs.includes(id));
               newData.crew
                  .filter(assignment => assignment.status === 'yes')
                  .forEach(assignment => assignment.status = 'pending');
            }
         }

         mission.getUpdateHandler(req).process(newData, (err2) => {
            if (err2) return res.apiError(err2.detail.errmsg);

            if (data.removed || data.added || data.unchanged) {
               Volunteer.model
                  .find({})
                  .where('_id')
                  .in([].concat(data.added, data.removed, data.unchanged))
                  .exec((err3, volunteers) => {
                     const promises = volunteers.map((volunteer) => {
                        const values = {
                           volunteer: volunteer.name.first,
                           mission: mission.name,
                           start: new Date(mission.start).toDateString(),
                           end: new Date(mission.end).toDateString(),
                           host: `${req.protocol}://${req.get('host')}`,
                           link: '/volunteer/',
                        };

                        if (data.added.includes(volunteer.id)) {
                           values.reason = 'You\'ve been added to a mission';
                        }
                        else if (data.removed.includes(volunteer.id)) {
                           values.reason = 'You\'ve been removed from a mission';
                        }
                        else { // unchanged
                           values.reason = 'The date of a mission changed';
                        }

                        const subject = `cadus crewing | ${values.reason}`;

                        return sendEmail(volunteer.email, subject, values);
                     });

                     Promise.all(promises)
                        .then(() => res.apiResponse({ mission }))
                        .catch(() => res.apiError('saved data but couldn\'t send all emails'));
                  });
            }
            else {
               res.apiResponse({ mission });
            }
         });
      });
};

function sendEmail(to, subject, data) {
   const options = {
      to,
      subject,
      from: mailConfig.sender,
      nodemailerConfig: mailConfig.nodemailerConfig,
   };
   const template = 'templates/emails/volunteer-mission-changed.jade';

   return new Promise(resolve => new Email(template, { transport: 'nodemailer' })
      .send(data, options, resolve));
}
