const keystone = require('keystone');
const transform = require('model-transform');

const Types = keystone.Field.Types;
const Area = new keystone.List('Area');

Area.add({
   name: { type: String, initial: true, required: true, index: true },
   location: { type: Types.Location },
});

Area.relationship({ ref: 'Mission', path: 'missions', refPath: 'area' });

transform.toJSON(Area);

Area.register();
