const keystone = require('keystone');
const transform = require('model-transform');

const Types = keystone.Field.Types;

const Mission = new keystone.List('Mission');

Mission.add({
   name: { type: String, initial: true, required: true, index: true },
   status: { type: Types.Select, options: 'open, on hold, confirmed, cancelled', default: 'open' },
   description: { type: Types.Markdown },
   commitmentMessage: { type: Types.Markdown },
   start: { type: Types.Date, default: Date.now },
   end: { type: Types.Date, default: Date.now },
   crew: { type: Types.List, fields: {
      volunteer: { type: Types.Relationship, ref: 'Volunteer' },
      status: { type: Types.Select, options: 'none, pending, yes, no', default: 'none' },
      comment: { type: String },
   }},
   headOfMission: { type: Types.Relationship, ref: 'Volunteer' },
   project: { type: Types.Relationship, ref: 'Project' },
   area: { type: Types.Relationship, ref: 'Area' },
   log: { type: Types.List, fields: {
      createdAt: { type: Types.Datetime, default: Date.now },
      subject: { type: String },
      content: { type: Types.Markdown },
   }},
   createdAt: { type: Types.Datetime, default: Date.now },
   updatedAt: { type: Types.Datetime, default: Date.now },
});

transform.toJSON(Mission);

Mission.track = true;
Mission.defaultSort = '-start';
Mission.defaultColumns = 'name, status, start, end';

Mission.register();
