require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');
const BasicProps = require('client/components/basic_props/index');
const deleteModal = require('client/components/modal_delete/index');
const {Button} = require('uskin');

const createEncryption = require('./pop/create_encryption');
const createType = require('./pop/create');
const editSpecs = require('./pop/edit_specs');
const associateQos = require('./pop/associate_qos');
const disassociateQos = require('./pop/disassociate_qos');

const config = require('./config.json');

const request = require('./request');
const getStatusIcon = require('../../utils/status_icon');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      config: config
    };

    ['onInitialize', 'onAction'].forEach((m) => {
      this[m] = this[m].bind(this);
    });

    this.stores = {
      urls: []
    };
  }

  componentWillMount() {
    this.tableColRender(this.state.config.table.column);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      this.loadingTable();
      this.onInitialize(nextProps.params);
    }
  }

  tableColRender() {
    let columns = this.state.config.table.column;

    columns.map((column) => {
      switch (column.key) {
        case 'associate_qos_spec':
          column.render = (col, item, i) => {
            return (
              item._qos_specs ?
                <a data-type="router" href={'/admin/qos-spec/' + item._qos_specs.id}>
                  {item._qos_specs ? item._qos_specs.name : '(' + item._qos_specs.id.substr(0, 8) + ')'}
                </a>
              : null
            );
          };
          break;
        case 'is_public':
          column.render = (col, item, i) => {
            return item.is_public ? __.true : __.false;
          };
          break;
        default:
          break;
      }
    });
  }

  onInitialize(params) {
    if (params[2]) {
      this.getSingle(params[2]);
    } else {
      this.getList();
    }
  }

  getList() {
    this.clearState();

    let table = this.state.config.table;

    request.getList().then((res) => {
      table.data = res.volume_types;
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table, res._url);
    });
  }

  getInitializeListData() {
    this.getList();
  }

  getSingle(volumeTypeID) {
    this.clearState();

    let table = this.state.config.table;

    request.getSingle(volumeTypeID).then((res) => {
      table.data = [res.volume_type];
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table, res._url);
    });
  }

  getNextListData(url, refreshDetail) {
    let table = this.state.config.table;

    request.getNextList(url).then((res) => {
      if (res.volume_types) {
        table.data = res.volume_types;
      } else if (res.volume_type) {
        table.data = [res.volume_type];
      } else {
        table.data = [];
      }
      this.updateTableData(table, res._url, refreshDetail);
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table, res._url);
    });
  }

  updateTableData(table, currentUrl, refreshDetail) {
    let newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      this.stores.urls.push(currentUrl);

      let dashboard = this.refs.dashboard,
        detail = dashboard.refs.detail,
        params = this.props.params;

      if (detail && refreshDetail && params.length > 2) {
        detail.refresh();
      }
    });
  }

  setPaginationData(table, res) {
    let pagination = {},
      next = res.links.next ? res.links.next : null;

    if (next) {
      pagination.nextUrl = next;
    }

    let history = this.stores.urls;

    if (history.length > 0) {
      pagination.prevUrl = history[history.length - 1];
    }
    table.pagination = pagination;

    return table;
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'table':
        this.onClickTable(actionType, refs, data);
        break;
      case 'detail':
        this.onClickDetailTabs(actionType, refs, data);
        break;
      case 'search':
        this.onClickSearch(actionType, refs, data);
        break;
      default:
        break;
    }
  }

  onClickSearch(actionType, refs, data) {
    if (actionType === 'click') {
      this.loadingTable();
      if (data.text) {
        this.getSingle(data.text);
      } else {
        this.getList();
      }
    }
  }

  onClickBtnList(key, refs, data) {
    let rows = data.rows;
    let that = this;

    let refresh = () => {
      that.refresh({
        refreshList: true,
        refreshDetail: true
      });
    };

    switch (key) {
      case 'create':
        createType(null, null, (res) => {
          refresh();
        });
        break;
      case 'create_encryption':
        createEncryption({ volumeType: rows[0] }, null, (res) => {
          refresh();
        });
        break;
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'volume-type',
          data: rows,
          onDelete: function(_data, cb) {
            let ids = rows.map((ele) => ele.id);

            request.deleteTypes(ids).then((res) => {
              refresh();
              cb(true);
            });
          }
        });
        break;
      case 'edit_extra_specs':
        editSpecs(rows[0], null, (res) => {
          refresh();
        });
        break;
      case 'associate_qos_spec_btn':
        associateQos(rows[0], null, (res) => {
          this.refresh({
            refreshList: true,
            refreshDetail: true,
            loadingTable: true,
            loadingDetail: true
          });
        });
        break;
      case 'disassociate_qos_spec_btn':
        disassociateQos(rows[0], null, (res) => {
          this.refresh({
            refreshList: true,
            refreshDetail: true,
            loadingTable: true,
            loadingDetail: true
          });
        });
        break;
      case 'edit_type':
        createType(rows[0], null, (res) => {
          refresh();
        });
        break;
      case 'refresh':
        this.refresh({
          refreshList: true,
          refreshDetail: true,
          loadingTable: true,
          loadingDetail: true
        });
        break;
      default:
        break;
    }
  }

  onClickTableCheckbox(refs, data) {
    let {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });
  }

  btnListRender(rows, btns) {
    let len = rows.length;
    let isSingle = (len === 1);
    btns.create_encryption.disabled = !isSingle;
    btns.delete.disabled = !(len > 0);
    btns.edit_extra_specs.disabled = !isSingle;
    btns.edit_type.disabled = !isSingle;
    btns.associate_qos_spec_btn.disabled = !(isSingle && rows[0] && rows[0]._qos_specs === undefined);
    btns.disassociate_qos_spec_btn.disabled = !(isSingle && rows[0] && rows[0]._qos_specs !== undefined);
    return btns;
  }

  onClickTable(actionType, refs, data) {
    switch (actionType) {
      case 'check':
        this.onClickTableCheckbox(refs, data);
        break;
      case 'pagination':
        let url,
          history = this.stores.urls;

        if (data.direction === 'prev'){
          history.pop();
          if (history.length > 0) {
            url = history.pop();
          }
        } else if (data.direction === 'next') {
          url = data.url;
        } else {
          url = this.stores.urls[0];
          this.clearState();
        }

        this.loadingTable();
        this.getNextListData(url);
        break;
      default:
        break;
    }
  }

  onClickDetailTabs(tabKey, refs, data, server) {
    let {rows} = data;
    let detail = refs.detail;
    let contents = detail.state.contents;

    switch(tabKey) {
      case 'description':
        if (rows.length === 1) {

          detail.loading();

          const item = rows[0];

          request.getEncryption(item.id).then((encryption) => {
            contents[tabKey] = (
              <div className="halo-volume-type-detail-description">
                <BasicProps
                  title={__.basic + __.properties}
                  defaultUnfold={true}
                  tabKey={'description'}
                  items={this.getBasicPropsItems(item, server)}
                  rawItem={item}
                  onAction={this.onDetailAction.bind(this)}
                  dashboard={this.refs.dashboard} />
                {
                  encryption.encryption_id ?
                    <BasicProps
                      title={__.encryption + __.information}
                      defaultUnfold={true}
                      tabKey={'description'}
                      items={this.getEncryptionInfo(encryption)}
                      rawItem={item}
                      onAction={this.onDetailAction.bind(this)}
                      dashboard={this.refs.dashboard} />
                  : null
                }
                {
                  encryption.encryption_id ?
                    <div className="actions">
                      <Button value={__.edit + __.encryption} onClick={this.onDetailAction.bind(this, 'description', 'edit_encryption', {
                        encryption,
                        volumeType: item
                      })} />
                      <Button value={__.delete + __.encryption} type="delete" onClick={this.onDetailAction.bind(this, 'description', 'delete_encryption', {
                        encryption,
                        volumeType: item
                      })} />
                    </div>
                  : null
                }
              </div>
            );

            detail.setState({
              contents: contents,
              loading: false
            });
          });
        }
        break;
      default:
        break;
    }

  }

  getBasicPropsItems(item, server) {
    let specs = item.extra_specs;
    let specsKeys = Object.keys(specs);

    let items = [{
      title: __.name,
      content: item.name || '(' + item.id.substr(0, 8) + ')'
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.is_public,
      content: item.is_public ? __.true : __.false
    }, {
      title: __.description,
      content: item.description || '-'
    }, {
      title: __.volume_type_extra_specs,
      content: (
        <div>
          { specsKeys.length > 0 ?
              specsKeys.map((key, index) => <div key={index}>{key + ' = ' + specs[key]}</div>)
            : '-'
          }
        </div>
      )
    }, {
      title: __.associate_qos_spec,
      content: item._qos_specs ? item._qos_specs.name : '-'
    }];

    return items;
  }

  getEncryptionInfo(item) {
    let items = [{
      title: __.encryption + __.id,
      content: item.encryption_id
    }, {
      title: __.provider,
      content: item.provider || '-'
    }, {
      title: __.control_location,
      content: item.control_location || '-'
    }, {
      title: __.cipher,
      content: item.cipher || '-'
    }, {
      title: __.key_size,
      content: item.key_size || '-'
    }];

    return items;
  }

  onDetailAction(tabKey, actionType, data) {
    switch(tabKey) {
      case 'description':
        this.onDescriptionAction(actionType, data);
        break;
      default:
        break;
    }
  }

  onDescriptionAction(actionType, data) {
    const that = this;
    let {encryption, volumeType} = data;

    switch(actionType) {
      case 'edit_encryption':
        createEncryption(data, null, () => {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'edit_name':
        // let {rawItem, newName} = data;
        // request.editVolumeName(rawItem, newName).then((res) => {
        //   this.refresh({
        //     refreshList: true,
        //     refreshDetail: true
        //   });
        // });
        break;
      case 'delete_encryption':
        let items = [Object.assign({}, encryption, {
          id: encryption.encryption_id
        })];

        deleteModal({
          __: __,
          action: 'delete',
          type: 'encryption',
          data: items,
          onDelete: function(_data, cb) {
            request.deleteEncryption(volumeType.id, encryption.encryption_id).then((res) => {
              that.refresh({
                refreshList: true,
                refreshDetail: true
              });
              cb(true);
            });
          }
        });
        break;
      default:
        break;
    }
  }

  refresh(data, params) {
    if (!data) {
      data = {};
    }
    if (!params) {
      params = this.props.params;
    }

    if (data.initialList) {
      if (data.loadingTable) {
        this.loadingTable();
      }
      if (data.clearState) {
        this.clearState();
      }

      this.getInitializeListData();
    } else if (data.refreshList) {
      if (params[2]) {
        if (data.loadingDetail) {
          this.loadingDetail();
          this.refs.dashboard.setRefreshBtnDisabled(true);
        }
      } else {
        if (data.loadingTable) {
          this.loadingTable();
        }
      }

      let history = this.stores.urls,
        url = history.pop();

      this.getNextListData(url, data.refreshDetail);
    }
  }

  loadingTable() {
    let _config = this.state.config;
    _config.table.loading = true;

    this.setState({
      config: _config
    });
  }

  loadingDetail() {
    this.refs.dashboard.refs.detail.loading();
  }

  clearUrls() {
    this.stores.urls = [];
  }

  clearState() {
    this.clearUrls();

    let dashboard = this.refs.dashboard;
    if (dashboard) {
      dashboard.clearState();
    }
  }

  render() {
    return (
      <div className="halo-module-volume-type" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          __={__}
          config={this.state.config}
          params={this.props.params}
          getStatusIcon={getStatusIcon}
        />
      </div>
    );
  }

}

module.exports = Model;
