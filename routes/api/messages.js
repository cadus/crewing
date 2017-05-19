const keystone = require('keystone');
const marked = require('marked');
const sendEmail = require('../email-helper')('blank.jade');

const Volunteer = keystone.list('Volunteer');
const Mission = keystone.list('Mission');

exports.log = (req, res, next) => {
   const missionID = req.params.mission;
   const subject = req.body.subject;
   const md = req.body.content;
   const content = { md, html: marked(md) };

   Mission.model
      .findById(missionID)
      .exec((err, mission) => {
         if (err) return res.apiError(err.detail.errmsg);
         if (!mission) return res.apiError('not found');

         mission.log.push({ subject, content });
         mission.save((err2) => {
            if (err2) return res.apiError(err2.detail.errmsg);
            if (next) next();
            else res.apiResponse({ success: true });
         });
      });
};

exports.send = (req, res) => {
   const recipients = req.body.recipients.split(',');
   const { subject, content } = req.body;

   Volunteer.model
      .find({})
      .where('_id')
      .in(recipients)
      .exec((err, volunteers) => {
         if (err) return res.apiError(err.detail.errmsg);

         const promises = volunteers.map(({ name, email }) =>
            sendEmail(email, subject, { name: name.first, content }));

         Promise.all(promises)
            .then(() => res.apiResponse({ success: true }))
            .catch(() => res.apiError('couldn\'t send all emails'));
      });
};
