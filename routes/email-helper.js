const Email = require('keystone-email');
const config = require('../config');
const markdown = require('marked');

const isDevelopment = process.env.KEYSTONE_DEV === 'true';
const defaultTemplate = 'blank.jade';

module.exports = (template = defaultTemplate) => (recipient, subject, data) => {
   if (isDevelopment) {
      console.log('SEND MAIL "', subject, '"\nTO', recipient, '\n\n', data);
      return Promise.resolve();
   }

   data.markdown = markdown;
   data.host = config.options.url;
   data.link = data.host + (data.path || '/volunteer/');

   const templatePath = `templates/emails/${template}`;
   const options = {
      to: recipient,
      subject: `${config.options.name} | ${subject}`,
      from: config.mail.sender,
      nodemailerConfig: config.mail.nodemailerConfig,
   };

   return new Promise(resolve => new Email(templatePath, { transport: 'nodemailer' })
      .send(data, options, resolve));
};
