const keystone = require('keystone');
const transform = require('model-transform');

const Boat = new keystone.List('Boat');

Boat.add({
   name: { type: String, initial: true, required: true, index: true },
});

Boat.relationship({ ref: 'Mission', path: 'missions', refPath: 'boat' });

transform.toJSON(Boat);

Boat.register();
