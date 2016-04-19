var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');
var __ = require('locale/client/dashboard.lang.json');

function getField(fieldName) {
  var res = null;
  config.fields.some((field) => {
    if (field.field === fieldName) {
      res = field;
      return true;
    }
    return false;
  });
  return res;
}

function pop(obj, parent, callback) {
  getField('subnet_name').value = obj.name;
  getField('gw_address').value = obj.gateway_ip;
  if (!obj.gateway_ip) {
    getField('enable_gw').checked = false;
    getField('gw_address').disabled = true;
  } else {
    getField('enable_gw').checked = true;
    getField('gw_address').disabled = false;
  }
  if (!obj.enable_dhcp) {
    getField('enable_dhcp').checked = false;
  } else {
    getField('enable_dhcp').checked = true;
  }

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      var data = {
        name: refs.subnet_name.state.value,
        enable_dhcp: refs.enable_dhcp.state.checked
      };
      if (!refs.enable_gw.state.checked) {
        data.gateway_ip = null;
      } else {
        data.gateway_ip = refs.gw_address.state.value;
      }
      request.updateSubnet(obj.id, data).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {
      switch (field) {
        case 'enable_gw':
          refs.gw_address.setState({
            disabled: !refs.enable_gw.state.checked
          });
          break;
        case 'gw_address':
          if (refs.enable_gw.state.checked) {
            refs.btn.setState({
              disabled: !status.value
            });
          } else {
            refs.btn.setState({
              disabled: false
            });
          }
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;