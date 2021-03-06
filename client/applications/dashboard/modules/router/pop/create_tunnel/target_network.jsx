require('./style/index.less');

const React = require('react');
const {Button} = require('client/uskin/index');

const ShortTip = require('client/components/modal_common/subs/short_tip/index');

class TargetNetwork extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value ? props.value : '',
      networkIps: props.data ? props.data : [],
      error: false
    };

    this.onChange = this.onChange.bind(this);
    this.addRow = this.addRow.bind(this);
  }

  onChange(e) {
    this.setState({
      value: e.target.value
    });
  }

  addRow(e) {
    this.setState({
      networkIps: this.state.networkIps.concat(this.state.value),
      value: ''
    });
  }

  deleteRow(index) {
    this.setState({
      networkIps: this.state.networkIps.slice(0, index).concat(this.state.networkIps.slice(index + 1))
    });
  }

  render() {
    let props = this.props,
      state = this.state;

    return (
      <div className="halo-pop-com-target modal-row">
        <div>
          {
            props.required && <strong>*</strong>
          }
          {__[props.field]}
        </div>
        <div className="modal-input">
          {
            state.networkIps.map((ip, index) => {
              return (
                <div key={index} className="row">
                  <span>{ip}</span>
                  <i className="glyphicon icon-delete" onClick={this.deleteRow.bind(this, index)}/>
                </div>);
            })
          }
          <input className={this.state.error ? 'error' : ''} onChange={this.onChange} value={this.state.value} />
          <Button value={__.save} onClick={this.addRow}/>
          {
            props.tip_info && <ShortTip label={__[props.tip_info]} />
          }
        </div>
      </div>
    );
  }
}

function popTarget(config) {
  return <TargetNetwork ref="network" {...config} />;
}

module.exports = popTarget;
