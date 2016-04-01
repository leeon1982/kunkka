'use strict';

var novaRemote = require('config')('remote').nova;
var Base = require('openstack_server/drivers/base.js');
var driverFlavor = new Base('flavor');

driverFlavor.listFlavors = function (projectId, token, region, callback, query) {
  return driverFlavor.getMethod(
    novaRemote[region] + '/v2.1/' + projectId + '/flavors/detail',
    token,
    callback,
    query
  );
};
driverFlavor.showFlavorDetails = function (projectId, flavorId, token, region, callback) {
  return driverFlavor.getMethod(
    novaRemote[region] + '/v2.1/' + projectId + '/flavors/' + flavorId,
    token,
    callback
  );
};
module.exports = driverFlavor;
