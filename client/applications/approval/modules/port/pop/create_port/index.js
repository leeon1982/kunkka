const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const getErrorMessage = require('client/applications/approval/utils/error_message');
const createSecurityGroup = require('client/applications/approval/modules/security-group/pop/create_security_group/index');


function pop(obj, parent, callback) {
  if (obj) {
    config.title[0] = 'add_';
  } else {
    config.title[0] = 'apply_';
  }

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      let subnetGroup = [];
      request.getSubnetSGList().then((data) => {
        let subnets = data.subnet.filter((sub) => sub.network['router:external'] === false);
        if (subnets.length > 0) {
          subnets.forEach((subnet) => {
            let hasGroup = subnetGroup.some((group) => {
              if (group.id === subnet.network_id) {
                group.data.push(subnet);
                return true;
              }
              return false;
            });
            if (!hasGroup) {
              subnetGroup.push({
                id: subnet.network_id,
                name: subnet.network.name,
                port_security_enabled: subnet.network.port_security_enabled,
                shared: subnet.network.shared,
                data: [subnet]
              });
            }
          });

          let selectedSubnet = subnetGroup.length > 0 ? subnetGroup[0].data[0] : null;
          if(obj) {
            selectedSubnet = subnets.find(ele => ele.id === obj.id);
            let currentGroup = subnetGroup.find(ele => ele.id === obj.network.id);
            currentGroup.data = [{name: selectedSubnet.name, id: selectedSubnet.id}];
            subnetGroup = [currentGroup];
          }

          refs.subnet.setState({
            data: subnetGroup,
            value: selectedSubnet ? selectedSubnet.id : null
          });

          refs.security_group.setState({
            hide: selectedSubnet ? !selectedSubnet.network.port_security_enabled : false
          });
        }

        let sgs = data.securitygroup;
        if (sgs.length > 0) {
          let securitygroups = [],
            defaultSecurity;
          sgs.forEach((item) => {
            if (item.name === 'default') {
              defaultSecurity = item;
              defaultSecurity.selected = true;
            } else {
              securitygroups.push(item);
            }
          });
          securitygroups.unshift(defaultSecurity);

          refs.security_group.setState({
            data: securitygroups
          });
        }

        if (subnets.length > 0 && sgs.length > 0) {
          refs.btn.setState({
            disabled: false
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      let data = {};
      data.detail = {};
      let port = data.detail;

      port.create = [];
      let configCreate = port.create;
      // let port = {};

      port = {
        _type: 'Port',
        _identity: 'port',
        name: refs.name.state.value,
        network: '',
        security_groups: [],
        fixed_ips: [{
          subnet_id: refs.subnet.state.value
        }]
      };

      let subnet = refs.subnet.state;

      subnet.data.some((ele) => {
        return ele.data.some((s) => {
          if (s.id === subnet.value) {
            port.network = ele.id;
            port.port_security_enabled = ele.port_security_enabled;
            return true;
          }
          return false;
        });
      });

      if (port.port_security_enabled) {
        refs.security_group.state.data.forEach(function(ele) {
          ele.selected && port.security_groups.push(ele.id);
        });
      }

      if (refs.address_ip.state.value !== '') {
        port.fixed_ips[0].ip_address = '';
        port.fixed_ips[0].ip_address = refs.address_ip.state.value;
      }

      configCreate.push(port);
      data.description = refs.apply_description.state.value;

      request.createApplication(data).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch(function(error) {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {
      switch (field) {
        case 'subnet':
          if (!refs.subnet.state.clicked) {
            let portSecurityEnabled = true;
            status.data.some((group) => {
              return group.data.some((s) => {
                if (s.id === status.value) {
                  portSecurityEnabled = group.port_security_enabled;
                  return true;
                }
                return false;
              });
            });
            refs.security_group.setState({
              hide: !portSecurityEnabled
            });
          }
          break;
        case 'security_group':
          if (refs.security_group.state.clicked) {
            createSecurityGroup(refs.modal, () => {
              request.getSecuritygroupList().then((data) => {
                let s = data.securitygroup;
                refs.security_group.setState({
                  data: s,
                  value: s[0].id,
                  clicked: false
                });
                refs.btn.setState({
                  disabled: false
                });
              });
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
