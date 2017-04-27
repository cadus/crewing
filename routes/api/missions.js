const keystone = require('keystone');
// const utils = require('keystone-utils');
// const Email = require('keystone-email');
// const mailConfig = require('../../config').mail;

// const Mission = keystone.list('Mission');
const Mission = keystone.list('Mission');

/**
 * List all Missions
 */
exports.all = (req, res) => {
   Mission.model
      .find({})
      .sort('-start')
      .populate('crew', 'name')
      .populate('area')
      .exec((err, missions) => {
         if (err) return res.apiError(err.detail.errmsg);
         res.apiResponse({ missions });
      });
};

/**
 * Get Mission by ID
 */
exports.one = (req, res) => {
   Mission.model
      .findById(req.params.id, (err, mission) => {
         if (err) return res.apiError(err.detail.errmsg);
         if (!mission) return res.apiError('not found');
         res.apiResponse({ mission });
      });
};

/**
 * Create a Mission
 */
exports.create = (req, res) => {
   const mission = new Mission.model();

   mission.getUpdateHandler(req).process(req.body, (err) => {
      if (err) return res.apiError(err.detail.errmsg);
      res.apiResponse({ success: true });
   });
};

/**
 * Update a Missions Data
 */
exports.update = (req, res) => {
   Mission.model
      .findById(req.params.id, (err, mission) => {
         if (err) return res.apiError(err.detail.errmsg);
         if (!mission) return res.apiError('not found');

         mission.getUpdateHandler(req).process(req.body, (err2) => {
            if (err2) return res.apiError(err2.detail.errmsg);
            res.apiResponse({ mission });
         });
      });
};
