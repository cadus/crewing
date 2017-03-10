const keystone = require('keystone');
const utils = require('keystone-utils');
const transform = require('model-transform');
const _ = require('lodash');
const questions = require('../shared/questions.json');

const Types = keystone.Field.Types;

const getToken = () => utils.randomString(64);

const Volunteer = new keystone.List('Volunteer', {
   defaultSort: '-createdAt',
   sortable: true,
});

const storage = new keystone.Storage({
   adapter: keystone.Storage.Adapters.FS,
   fs: {
      path: 'uploads',
      publicPath: '/uploads/',
   },
});

Volunteer.add(
   {
      name: { type: Types.Name, initial: true, required: true, index: true },
      email: { type: Types.Email, initial: true, required: true, index: true, unique: true },
      phone: { type: String, width: 'short' },
      photo: { type: Types.File, storage, collapse: true },
      address: { type: Types.Textarea, collapse: true },
      emergencyContacts: { type: String, width: 'short' },
      medication: { type: String },
      languages: { type: String },
      availabilities: { type: Types.List,
         fields: {
            from: { type: Types.Date, default: Date.now },
            till: { type: Types.Date, default: Date.now },
            confirmationTill: { type: Types.Date, default: Date.now, label: 'When do you need the assignment to be confirmed?' },
         },
      },
      notes: { type: Types.Textarea, collapse: true },
   },
   'Group & Qualification',
   {
      group: { type: Types.Select, options: 'captain, helper, journalist, medic, photographer, technician', default: 'helper' },
      paramedic: { type: Boolean, indent: true },
      doctor: { type: Boolean, indent: true },
      emergencydoctor: { type: Boolean, indent: true },
      lifeguard: { type: Boolean, indent: true },
      experienceOnSea: { type: Boolean, indent: true },
      boatDriverPermit: { type: Types.Select, options: 'Class 1, Class 2, Class 3' },
   },
   'Scans',
   {
      passport: { type: Types.File, storage },
      presscard: { type: Types.File, storage, dependsOn: { group: 'journalist' } },
      approbation: { type: Types.File, storage, dependsOn: { group: 'medic' } },
   }
);

_.each(questions, (content, name) => {
   const obj = {};
   _.each(content, (value, key) => {
      obj[key] = { type: String, note: value, label: _.capitalize(key.slice(2)) };
   });
   Volunteer.add(name, obj);
});

Volunteer.add('Permissions', {
   dataPrivacy: { type: Boolean, indent: true, initial: true, required: true, label: 'Accepted the data privacy conditions' },
   isVerified: { type: Boolean, indent: true, label: 'Has a verified email address' },
   token: { type: String },
});


Volunteer.schema.virtual('url').get(function () {
   return `/volunteer/${this.token}`;
});

Volunteer.relationship({ ref: 'Mission', path: 'missions', refPath: 'crew' });

Volunteer.schema.methods.wasActive = function () {
   this.lastActiveOn = new Date();
   return this;
};

Volunteer.schema.methods.verifyEmail = function () {
   if (this.isVerified) return;

   this.isVerified = true;
   this.save();
};

Volunteer.schema.methods.hasFile = function (filename) {
   return ['photo', 'passport', 'presscard', 'approbation']
      .some(name => this[name] && this[name].filename === filename);
};


Volunteer.schema.pre('save', function (next) {
   if (this.isNew) {
      this.token = getToken();
   }
   next();
});

transform.toJSON(Volunteer);

Volunteer.track = true;
Volunteer.defaultColumns = 'name, email, group';

Volunteer.register();
