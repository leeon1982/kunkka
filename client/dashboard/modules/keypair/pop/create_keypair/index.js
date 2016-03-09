var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');

function pop(callback, parent) {
  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
    },
    onConfirm: function(refs, cb) {
      callback();
      cb(true);
    },
    onAction: function(filed, state, refs) {
      switch (filed) {
        case 'create':
          refs.public_key.setState({
            hide: state.value === 'create_keypair'
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
