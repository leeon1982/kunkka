const storage = require('client/applications/approval/cores/storage');
const fetch = require('client/applications/approval/cores/fetch');
const RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['volume', 'instance', 'snapshot'], forced).then(function(data) {
      data.volume.forEach((v) => {
        v.snapshots = [];
        data.snapshot.forEach((s) => {
          if (s.volume_id === v.id) {
            v.snapshots.push(s);
          }
        });

        if (v.attachments.length > 0) {
          let serverId = v.attachments[0].server_id;
          data.instance.some((ele) => {
            if (ele.id === serverId) {
              v.server = ele;
              return true;
            }
            return false;
          });
          if (!v.server) {
            v.server = {
              id: serverId,
              status: 'SOFT_DELETED'
            };
          }
        }
      });
      return data.volume;
    });
  },
  getInstances: function() {
    return storage.getList(['instance']).then(function(data) {
      return data.instance;
    });
  },
  getOverview: function() {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/overview'
    });
  },
  getVolumeTypes: function() {
    return fetch.get({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/types'
    });
  },
  getVolumePrice: function(type, size) {
    let url = '/proxy/gringotts/v2/products/price' +
      '?purchase.bill_method=hour' +
      '&purchase.purchases[0].product_name=' + type +
      '&purchase.purchases[0].service=block_storage' +
      '&purchase.purchases[0].region_id=RegionOne' +
      '&purchase.purchases[0].quantity=' + size;

    return fetch.get({
      url: url
    });
  },
  getPrices: function() {
    return fetch.get({
      url: '/proxy/gringotts/v2/products'
    });
  },
  createApplication: function(_data) {
    return fetch.post({
      url: '/api/apply',
      data: _data
    });
  },
  attachInstance: function(_data) {
    let data = {};
    data.volumeAttachment = {};
    data.volumeAttachment.volumeId = _data.volumeId;

    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + _data.serverId + '/os-volume_attachments',
      data: data
    });
  },
  detachInstance: function(data) {
    return fetch.delete({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + data.serverId + '/os-volume_attachments/' + data.attachmentId
    });
  },
  extendVolumeSize: function(item, _data) {
    let data = {};
    data['os-extend'] = _data;

    return fetch.post({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/volumes/' + item.id + '/action',
      data: data
    });
  },
  setReadOnly: function(item) {
    let data = {};
    data['os-update_readonly_flag'] = {};
    data['os-update_readonly_flag'].readonly = true;

    return fetch.post({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/volumes/' + item.id + '/action',
      data: data
    });
  },
  setReadWrite: function(item) {
    let data = {};
    data['os-update_readonly_flag'] = {};
    data['os-update_readonly_flag'].readonly = false;

    return fetch.post({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/volumes/' + item.id + '/action',
      data: data
    });
  },
  editVolumeName: function(item, newName) {
    let data = {};
    data.volume = {};
    data.volume.name = newName;

    return fetch.put({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/volumes/' + item.id,
      data: data
    });
  },
  deleteVolumes: function(items) {
    let deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/cinder/v2/' + HALO.user.projectId + '/volumes/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  deleteSnapshot: function(item) {
    return fetch.delete({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/snapshots/' + item.id
    });
  },
  updateOwner: function(volumeId, data) {
    return fetch.post({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/volumes/' + volumeId + '/metadata',
      data: data
    });
  },
  updateUsage: function(volumeId, data) {
    return fetch.post({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/volumes/' + volumeId + '/metadata',
      data: data
    });
  },
  getAlarmList(id) {
    let alarm = [], rule = '';
    return fetch.get({
      url: '/proxy/aodh/v2/alarms'
    }).then(function(data) {
      data && data.forEach(a => {
        rule = a.gnocchi_resources_threshold_rule;
        if (rule.resource_type === 'volume' && rule.resource_id === id) {
          a.timestamp = a.timestamp.split('.')[0] + 'Z';
          alarm.push(a);
        }
      });
      return alarm;
    });
  },
  getMeasures: function(ids, granularity, start) {
    let deferredList = [];
    ids.forEach((id) => {
      deferredList.push(fetch.get({
        url: '/proxy/gnocchi/v1/metric/' + id + '/measures?granularity=' + granularity + '&start=' + start
      }));
    });
    return RSVP.all(deferredList);
  },
  getNetworkResourceId: function(id, granularity) {
    let url = '/proxy/gnocchi/v1/search/resource/instance_disk',
      data = {
        '=': {
          original_resource_id: id
        }
      };
    return fetch.post({
      url: url,
      data: data
    });
  }
};
