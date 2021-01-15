import React from "react";
import { Button, Form, Select } from "antd";
import Web3 from 'web3'
import { connect } from "react-redux";

const { Option, OptGroup } = Select

const NETWORKS = {
  1: 'Ethereum Main Network',
  2: 'Morden Test network',
  3: 'Ropsten Test Network',
  4: 'Rinkeby Test Network',
  5: 'Goerli Test Network',
  42: 'Kovan Test Network',
  648529: 'LACChain Main Network',
  648530: 'DAVID19 Test Network',
  648539: 'LACChain Test Network',
}

class MetaMaskLogin extends React.Component {

  state = {
    accounts: [],
    network: 0
  }

  componentDidMount() {
    this.getMetamask();
  }

  onFinish = values => {
    const { dispatch } = this.props;
    const { network } = this.state;
    dispatch({ type: 'user/LOGIN', payload: {...values, network} });
  }

  getMetamask = async() => {
    if( window.ethereum ) {
      window.web3 = new Web3( window.ethereum );
      await window.ethereum.enable();
    } else if( window.web3 ) {
      window.web3 = new Web3( window.web3.currentProvider );
    } else {
      console.log( 'Non-Ethereum browser detected. You should consider trying MetaMask!' );
    }
    try {
      const networkId = await window.web3.eth.net.getId()
      const accounts = await window.web3.eth.getAccounts();
      this.setState( { accounts, network: networkId } );
    } catch( e ) {
      this.setState( { accounts: [], network: 0 } );
    }
  }

  render() {
    const { accounts, network } = this.state;
    const { user } = this.props;
    return (
      <Form
        layout="vertical"
        hideRequiredMark
        onFinish={this.onFinish}
        className="mb-4"
        initialValues={{ account: accounts[0] }}
      >
        <Form.Item
          name="account"
          rules={[{ required: true, message: 'Please select an address account' }]}
        >
          <Select size="large" placeholder="Select Account">
            <OptGroup label={NETWORKS[network]}>
              {accounts.map( account => (
                <Option key={account} value={account}>
                  <div className="demo-option-label-item">
                    <span role="img" aria-label={account}>
                      <img src={`/resources/images/chains/${network >= 648529 ? 'lacchain' : 'eth'}.png`} alt="LACCHAIN" width="30" />
                    </span>
                    {account}
                  </div>
                </Option>
              ) )
              }
            </OptGroup>
          </Select>
        </Form.Item>
        <Button
          type="primary"
          size="large"
          className="text-center w-100"
          htmlType="submit"
          loading={user.loading}
        >
          <strong>Log in</strong>
        </Button>
      </Form>
    );
  }
}

const mapStateToProps = ({ user, dispatch }) => ({
  dispatch,
  user
})

export default connect( mapStateToProps )( MetaMaskLogin );
