const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');

const getErrorMessage = require('client/applications/admin/utils/error_message');

function pop(parent, callback) {
  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
    },
    onConfirm: function(refs, cb) {
      let floatingIP = refs.floating_ip.state.value,
        projectId = refs.target_project_id.state.value,
        networkID = '';
      request.getExternalNetwork(projectId).then((res) => {
        networkID = res.networks[0].id;
      }).then(() => {
        let data = {
          'floatingip': {
            'floating_network_id': networkID,
            'tenant_id': projectId,
            'floating_ip_address': floatingIP
          }
        };
        if(HALO.settings.enable_floatingip_bandwidth) {
          data.floatingip.rate_limit = 1024;
        }
        request.allocateFloatingIP(data).then(() => {
          callback && callback();
          cb(true);
        }).catch((error) => {
          cb(false, getErrorMessage(error));
        });
      }).catch((err) => {
        cb(false, getErrorMessage(err));
      });
    },
    onAction: function(field, state, refs) {
      switch(field) {
        case 'floating_ip':
        case 'target_project_id':
          refs.btn.setState({
            disabled: !(refs.floating_ip.state.value && refs.target_project_id.state.value)
          });
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
