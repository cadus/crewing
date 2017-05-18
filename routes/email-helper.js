const Email = require('keystone-email');
const config = require('../config');
const markdown = require('marked');

const isDevelopment = process.env.KEYSTONE_DEV === 'true';
const defaultTemplate = 'blank.jade';

module.exports = (template = defaultTemplate) => (recipient, subject, data) => {
   if (isDevelopment) {
      console.log('SEND MAIL "', subject, '"\nTO', recipient, '\n\n', markdown(data.content));
      return Promise.resolve();
   }

   data.markdown = markdown;

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
