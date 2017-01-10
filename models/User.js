const keystone = require('keystone');
const transform = require('model-transform');

const Types = keystone.Field.Types;

const User = new keystone.List('User');

User.add({
   name: { type: Types.Name, required: true, index: true },
   email: { type: Types.Email, initial: true, required: true, index: true, unique: true },
   password: { type: Types.Password, initial: true, required: true },
   canAccessKeystone: { type: Boolean, initial: true },
});

transform.toJSON(User);

User.track = true;
User.defaultColumns = 'name, email';

User.register();
