const keystone = require('keystone');
const Email = require('keystone-email');
const mailConfig = require('../../config').mail;
const markdown = require('marked');

const Volunteer = keystone.list('Volunteer');

const isDevelopment = process.env.KEYSTONE_DEV === 'true';

exports.send = (req, res) => {
   const recipients = req.body.recipients.split(',');

   Volunteer.model
      .find({})
      .where('_id')
      .in(recipients)
      .exec((err, volunteers) => {
         if (err) return res.apiError(err.detail.errmsg);

         const promises = volunteers.map((volunteer) => {
            const subject = `cadus crewing | ${req.body.subject}`;
            const values = {
               content: req.body.content,
               volunteer: volunteer.name.first,
               host: `${req.protocol}://${req.get('host')}`,
               link: '/volunteer/',
            };

            return sendEmail(volunteer.email, subject, values);
         });

         Promise.all(promises)
            .then(() => res.apiResponse({ success: true }))
            .catch(() => res.apiError('couldn\'t send all emails'));
      });
};

function sendEmail(to, subject, data) {
   if (isDevelopment) {
      console.log('SEND MAIL "', subject, '"\nTO', to, '\n\n', markdown(data.content));
      return Promise.resolve();
   }

   data.markdown = markdown;

   const options = {
      to,
      subject,
      from: mailConfig.sender,
      nodemailerConfig: mailConfig.nodemailerConfig,
   };
   const template = 'templates/emails/blank.jade';

   return new Promise(resolve => new Email(template, { transport: 'nodemailer' })
      .send(data, options, resolve));
}
