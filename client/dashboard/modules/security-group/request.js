var request = require('client/dashboard/cores/request');

module.exports = {
  getList: function(cb) {
    return request.get({
      url: '/api/v1/' + HALO.user.projectId + '/security'
    }).then(function(data) {
      cb(data);
    });
  }

};
