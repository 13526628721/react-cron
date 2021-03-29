import React from 'react'
import ReactDOM from 'react-dom';
import ReactCron from './cron/index';
import { Button, Modal } from 'antd';
require('./app.css')
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      i18n: "zh",
      cronShow: false,
      cronTxt: "* * * * * ? *"
    }
  }
  onToggleLang = () => {
    let i18n = this.state.i18n;
    this.setState({
      i18n: i18n == "en" ? "zh" : "en"
    })
  }

  onShowCron = () => {
    this.setState({
      cronShow: true
    })
  }

  renderCron = () => {
    let { i18n, cronTxt } = this.state;
    let targetCron = ""
    let modalEle = <Modal
      visible={true} maskClosable={false} closable={false} width={'680px'}
      onOk={() => { this.setState({ cronTxt: targetCron, cronShow: false }) }}
      onCancel={() => { this.setState({ cronShow: false }) }}
    >
      <ReactCron
        i18n={i18n}
        presetCRONExp={cronTxt}
        onCRONExpChanged={(val) => targetCron = val}
      />
    </Modal>
    return modalEle
  }

  render() {
    let { i18n, cronShow, cronTxt } = this.state;
    let cronModal = null;
    if (cronShow) {
      cronModal = this.renderCron()
    }
    return (
      <div className="cron-content">
        <p className="cron-title">CRON表达式生成</p>
        <p className="cron-text">{cronTxt}</p>
        <p>
          <Button type="link" onClick={this.onShowCron}>编辑</Button>
          <Button type="link" onClick={this.onToggleLang}>{i18n}</Button>
        </p>
        {cronModal}
      </div>
    )
  }
}
export default App;


ReactDOM.render(
  <App />,
  document.getElementById('root')
)
