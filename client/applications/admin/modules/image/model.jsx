require('./style/index.less');

//react components
var React = require('react');
var Main = require('../../components/main/index');

//detail components
var BasicProps = require('client/components/basic_props/index');
var deleteModal = require('client/components/modal_delete/index');

var request = require('./request');
var config = require('./config.json');
var moment = require('client/libs/moment');
var __ = require('locale/client/admin.lang.json');
var router = require('../../cores/router');
var getStatusIcon = require('../../utils/status_icon');

class Model extends React.Component {

  constructor(props) {
    super(props);

    moment.locale(HALO.configs.lang);

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
    var column = this.state.config.table.column;
    this.setTableFilter(column);
    this.tableColRender(column);
    this.initializeFilter(this.state.config.filter);
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
    } else if(this.props.style.display !== 'none' && nextProps.style.display === 'none') {
      this.clearState();
    }
  }

  setTableFilter(columns) {
    var filters = columns.filter((col) => col.key === 'type')[0].filter;
    var imageFilter = filters.filter((fil) => fil.key === 'image')[0],
      snapshotFilter = filters.filter((fil) => fil.key === 'snapshot')[0];

    imageFilter.filterBy = function(item) {
      return item.image_type === 'distribution' ? false : true;
    };
    snapshotFilter.filterBy = function(item) {
      return item.image_type === 'snapshot' ? false : true;
    };
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'size':
          column.render = (col, item, i) => {
            let size = item.size / 1024 / 1024;
            if (size >= 1024) {
              size = (Math.round(size / 1024) + ' GB');
            } else {
              size = Math.round(size) + ' MB';
            }

            return size;
          };
          break;
        case 'type':
          column.render = (col, item, i) => {
            return item.image_type === 'snapshot' ? __.snapshot_type : __.image;
          };
          break;
        default:
          break;
      }
    });
  }

  initializeFilter(filters, res) {
    var setOption = function(key, data) {
      filters.forEach((filter) => {
        filter.items.forEach((item) => {
          if (item.key === key) {
            item.data = data;
          }
        });
      });
    };

    var statusTypes = [{
      id: 'snapshot',
      name: __.snapshot_type
    }, {
      id: 'image',
      name: __.image
    }];
    setOption('type', statusTypes);
  }

//initialize table data
  onInitialize(params) {
    if (params[2]) {
      this.getSingle(params[2]);
    } else {
      this.getList();
    }
  }

//request: get single data by ID
  getSingle(id) {
    var table = this.state.config.table;

    request.getSingle(id).then((res) => {
      table.data = [res];
      this.updateTableData(table, res._url, true, () => {
        var pathList = router.getPathList();
        router.replaceState('/admin/' + pathList.slice(1).join('/'), null, null, true);
      });
    });
  }

//request: get list
  getList() {
    var table = this.state.config.table,
      pageLimit = table.limit;

    request.getList(pageLimit).then((res) => {
      table.data = res.images;
      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    });
  }

//request: get next list
  getNextList(url, refreshDetail) {
    request.getNextList(url).then((res) => {
      var table = this.state.config.table;
      if (res.images) {
        table.data = res.images;
      } else if (res.id) {
        table.data = [res];
      } else {
        table.data = [];
      }

      this.setPagination(table, res);
      this.updateTableData(table, res._url, refreshDetail);
    });
  }

//rerender: update table data
  updateTableData(table, currentUrl, refreshDetail, callback) {
    var newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      this.stores.urls.push(currentUrl.split('/v2/')[1]);

      var detail = this.refs.dashboard.refs.detail,
        params = this.props.params;
      if (detail && refreshDetail && params.length > 2) {
        detail.refresh();
      }

      callback && callback();
    });
  }

//set pagination
  setPagination(table, res) {
    var pagination = {},
      next = res.next ? res.next : null;

    if (next && next.rel === 'next') {
      pagination.nextUrl = next.href.split('/v2.1/')[1];
    }

    var history = this.stores.urls;

    if (history.length > 0) {
      pagination.prevUrl = history[history.length - 1];
    }
    table.pagination = pagination;

    return table;
  }

  getInitialListData() {
    this.getList();
  }

  getNextListData(url, refreshDetail) {
    this.getNextList(url, refreshDetail);
  }

//refresh: according to the given data rules
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

      this.getInitialListData();
    } else if (data.refreshList) {
      if (params[2]) {
        if (data.loadingDetail) {
          this.loadingDetail();
        }
      } else {
        if (data.loadingTable) {
          this.loadingTable();
        }
      }

      var history = this.stores.urls,
        url = history.pop();

      this.getNextListData(url, data.refreshDetail);
    }
  }

  loadingTable() {
    var _config = this.state.config;
    _config.table.loading = true;
    _config.table.data = [];

    this.setState({
      config: _config
    });
  }

  loadingDetail() {
    this.refs.dashboard.refs.detail.loading();
  }

  clearState() {
    this.stores = {
      urls: []
    };
    this.refs.dashboard.clearState();
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'filter':
        this.onFilterSearch(actionType, refs, data);
        break;
      case 'table':
        this.onClickTable(actionType, refs, data);
        break;
      case 'detail':
        this.onClickDetailTabs(actionType, refs, data);
        break;
      default:
        break;
    }
  }

  onClickTable(actionType, refs, data) {
    switch (actionType) {
      case 'check':
        this.onClickTableCheckbox(refs, data);
        break;
      case 'pagination':
        var url,
          history = this.stores.urls;

        if (data.direction === 'next') {
          url = data.url;
        } else {
          history.pop();
          if (history.length > 0) {
            url = history.pop();
          }
        }

        this.loadingTable();
        this.getNextListData(url);
        break;
      default:
        break;
    }
  }

  onClickBtnList(key, refs, data) {
    var {rows} = data;

    switch(key) {
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'image',
          data: rows,
          onDelete: function(_data, cb) {
            request.delete(rows[0].id).then((res) => {
              cb(true);
              this.refresh({
                refreshList: true,
                refreshDetail: true
              });
            });
          }
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

  onFilterSearch(actionType, refs, data) {
    if (actionType === 'search') {
      this.loadingTable();

      var idData = data.filter_id,
        typeData = data.filter_type;

      if (idData) {
        this.getSingle(idData.id);
      } else if (typeData){
        let requestData = {
          visibility: typeData.type === 'snapshot' ? 'private' : 'public'
        };
        let pageLimit = this.state.config.table.limit;

        request.filter(requestData, pageLimit).then((res) => {
          var table = this.state.config.table;
          table.data = res.images;
          this.updateTableData(table, res._url);
        });
      } else {
        var r = {};
        r.initialList = true;
        r.loadingTable = true;
        r.clearState = true;

        this.refresh(r);
      }
    }
  }

  onClickTableCheckbox(refs, data) {
    var {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });
  }

  btnListRender(rows, btns) {
    var sole = rows.length === 1 ? rows[0] : null;

    for(let key in btns) {
      switch (key) {
        case 'delete':
          btns[key].disabled = (sole && sole.image_type === 'snapshot') ? false : true;
          break;
        default:
          break;
      }
    }

    return btns;
  }

  onClickDetailTabs(tabKey, refs, data) {
    var {rows} = data;
    var detail = refs.detail;
    var contents = detail.state.contents;

    var isAvailableView = (_rows) => {
      if (_rows.length > 1) {
        contents[tabKey] = (
          <div className="no-data-desc">
            <p>{__.view_is_unavailable}</p>
          </div>
        );
        return false;
      } else {
        return true;
      }
    };

    switch(tabKey) {
      case 'description':
        if (isAvailableView(rows)) {
          var basicPropsItem = this.getBasicPropsItems(rows[0]);

          contents[tabKey] = (
            <div>
              <BasicProps
                title={__.basic + __.properties}
                defaultUnfold={true}
                tabKey={'description'}
                items={basicPropsItem}
                rawItem={rows[0]}
                onAction={this.onDetailAction.bind(this)}
                dashboard={this.refs.dashboard ? this.refs.dashboard : null} />
            </div>
          );
        }
        break;
      default:
        break;
    }

    detail.setState({
      contents: contents,
      loading: false
    });
  }

  getBasicPropsItems(item) {
    var size = item.size / 1024 / 1024;
    if (size >= 1024) {
      size = (Math.round(size / 1024) + ' GB');
    } else {
      size = Math.round(size) + ' MB';
    }

    var items = [{
      title: __.name,
      content: item.name
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.size,
      content: size
    }, {
      title: __.type,
      content: item.image_type === 'snapshot' ? __.snapshot_type : __.image
    }, {
      title: __.status,
      content: getStatusIcon(item.status)
    }, {
      title: __.created + __.time,
      content: item.created
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
    switch(actionType) {
      default:
        break;
    }
  }

  render() {
    return (
      <div className="halo-module-image" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          config={this.state.config}
          params={this.props.params}
        />
      </div>
    );
  }
}

module.exports = Model;