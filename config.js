const name = 'cadus crewing';

exports.options = {
   'name': name,
   'brand': name,
   'less': 'public',
   'static': 'public',
   'favicon': 'public/favicon.ico',
   'views': 'templates/views',
   'view engine': 'jade',
   'user model': 'User',
   'auto update': true,
   'session': true,
   'auth': true,
};

exports.locals = {
   title: name,
   env: process.NODE_ENV,
};

exports.nav = {
   crewing: ['volunteers', 'missions', 'boats'],
   users: ['users'],
};
