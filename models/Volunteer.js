const fs = require('fs');
const keystone = require('keystone');
const utils = require('keystone-utils');
const transform = require('model-transform');
const _ = require('lodash');
const questions = require('../shared/questions.json');
const groups = require('../shared/groups.json');

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
      registeredAt: { type: Types.Date, default: Date.now },
      name: { type: Types.Name, initial: true, required: true, index: true },
      email: { type: Types.Email, initial: true, required: true, index: true, unique: true },
      birth: { type: Types.Date },
      phone: { type: String, width: 'short' },
      photo: { type: Types.File, storage, collapse: true },
      address: { type: Types.Textarea, collapse: true },
      emergencyContacts: { type: String, width: 'short' },
      languages: { type: String },
      citizenship: { type: String },
      citizenship2: { type: String },
      availabilities: { type: Types.List, fields: {
         from: { type: Types.Date, default: Date.now },
         till: { type: Types.Date, default: Date.now },
         confirmationTill: { type: Types.Date, default: Date.now, label: 'When do you need the assignment to be confirmed?' },
      }},
      notes: { type: Types.Textarea, collapse: true },
   },
   'Group & Qualification',
   {
      group: { type: Types.Select, options: groups.join() },
      driversLicence: { type: Boolean, indent: true },
      truckDriversLicence: { type: Boolean, indent: true, dependsOn: { driversLicence: true } },
      internationalDriversLicence: { type: Boolean, indent: true, dependsOn: { driversLicence: true } },
      internationalTruckDriversLicence: { type: Boolean, indent: true, dependsOn: { driversLicence: true } },
      allowedVehicleWeight: { type: String, indent: true, dependsOn: { driversLicence: true } },
      emergencydoctor: { type: Boolean, indent: true },
      lifeguard: { type: Boolean, indent: true },
      experienceOnSea: { type: Boolean, indent: true },
      boatDriverPermit: { type: Types.Select, options: 'Class 1, Class 2, Class 3' },
      trainings: { type: String },
      workExperience: { type: Types.List, fields: {
         employer: { type: String, label: 'Name of employer' },
         role: { type: String, label: 'Title / role' },
         time: { type: String, label: 'Dates worked' },
         location: { type: String },
      }},
      aviation: { type: Boolean, indent: true },
      aviationSpecialization: { type: String, dependsOn: { aviation: true } },
      craftsman: { type: Boolean, indent: true },
      craftsmanSpecialization: { type: String, dependsOn: { craftsman: true } },
      doctor: { type: Boolean, indent: true },
      doctorSpecialization: { type: String, dependsOn: { doctor: true } },
      engineer: { type: Boolean, indent: true },
      engineerSpecialization: { type: String, dependsOn: { engineer: true } },
      firefighter: { type: Boolean, indent: true },
      firefighterSpecialization: { type: String, dependsOn: { firefighter: true } },
      labTechnician: { type: Boolean, indent: true },
      labTechnicianSpecialization: { type: String, dependsOn: { labTechnician: true } },
      logistician: { type: Boolean, indent: true },
      logisticianSpecialization: { type: String, dependsOn: { logistician: true } },
      mechanic: { type: Boolean, indent: true },
      mechanicSpecialization: { type: String, dependsOn: { mechanic: true } },
      media: { type: Boolean, indent: true },
      mediaSpecialization: { type: String, dependsOn: { media: true } },
      medical: { type: Boolean, indent: true },
      medicalSpecialization: { type: String, dependsOn: { medical: true } },
      midwife: { type: Boolean, indent: true },
      midwifeSpecialization: { type: String, dependsOn: { midwife: true } },
      nurse: { type: Boolean, indent: true },
      nurseSpecialization: { type: String, dependsOn: { nurse: true } },
      paramedic: { type: Boolean, indent: true },
      paramedicSpecialization: { type: String, dependsOn: { paramedic: true } },
      physiotherapist: { type: Boolean, indent: true },
      physiotherapistSpecialization: { type: String, dependsOn: { physiotherapist: true } },
      technician: { type: Boolean, indent: true },
      technicianSpecialization: { type: String, dependsOn: { technician: true } },
      translator: { type: Boolean, indent: true },
      translatorSpecialization: { type: String, dependsOn: { translator: true } },
      seafaring: { type: Boolean, indent: true },
      seafaringSpecialization: { type: String, dependsOn: { seafaring: true } },
      WASHExpert: { type: Boolean, indent: true },
      WASHExpertSpecialization: { type: String, dependsOn: { WASHExpert: true } },
      other: { type: Boolean, indent: true },
      otherSpecialization: { type: String, dependsOn: { other: true } },
   },
   'Scans',
   {
      cv: { type: Types.File, storage },
      cv_text: { type: Types.Textarea },
      passport: { type: Types.File, storage },
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

Volunteer.schema.post('init', function () {
   this._original = this.toObject();
});

Volunteer.schema.pre('save', function (next) {
   if (this.isNew) {
      this.token = getToken();
   }

   // if there's an earlier version of a file, delete it
   ['photo', 'passport', 'presscard', 'approbation'].forEach(field => {
      if (this.isModified(field) && this._original[field] && this._original[field].filename) {
         fs.unlinkSync(`uploads/${this._original[field].filename}`);
      }
   });

   next();
});

transform.toJSON(Volunteer);

Volunteer.track = true;
Volunteer.defaultColumns = 'name, email';

Volunteer.register();
