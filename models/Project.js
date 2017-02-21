const keystone = require('keystone');
const transform = require('model-transform');

const Project = new keystone.List('Project');

Project.add({
   name: { type: String, initial: true, required: true, index: true },
});

Project.relationship({ ref: 'Mission', path: 'missions', refPath: 'Project' });

transform.toJSON(Project);

Project.register();
