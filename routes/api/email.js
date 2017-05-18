const keystone = require('keystone');
const sendEmail = require('../email-helper')('blank.jade');

const Volunteer = keystone.list('Volunteer');

exports.send = (req, res) => {
   const recipients = req.body.recipients.split(',');

   Volunteer.model
      .find({})
      .where('_id')
      .in(recipients)
      .exec((err, volunteers) => {
         if (err) return res.apiError(err.detail.errmsg);

         const promises = volunteers.map((volunteer) => {
            const values = {
               name: volunteer.name.first,
               content: req.body.content,
               link: '/volunteer/',
               host: `${req.protocol}://${req.get('host')}`,
            };

            return sendEmail(volunteer.email, req.body.subject, values);
         });

         Promise.all(promises)
            .then(() => res.apiResponse({ success: true }))
            .catch(() => res.apiError('couldn\'t send all emails'));
      });
};
