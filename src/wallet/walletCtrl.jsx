import React, { Component } from 'react';

import { getPriceRounded } from '../utils';
import withWallet from './walletHOC';
import WalletUIeasy from './walletUIeasy';
import WalletUIpro from './walletUIpro';
import ToggleSwitch from '../components/toggleSwitch';

class WalletController extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expertMode: false,
      methodStates: {},
    };
  }

  loadInfo = () => {
    const { methods, account } = this.props;
    const basic = [
      'balanceOf',
      'decimals',
      'name',
      'symbol',
      'owner',
    ];

    methods.forEach((method) => {
      if (basic.includes(method.name)) {
        this.useMethod(method, method.name === 'balanceOf' ? { account } : {});
      }
    });
  }

  handleToggle = (toggleState) => {
    this.setState({ expertMode: toggleState });
  }

  openLink = ({ hash }) => {
    const { contract, netCfg } = this.props;
    if (hash) {
      window.open(`${netCfg.params.blockExplorerUrls[0]}/tx/${hash}`, '_blank');
    } else if (contract && contract._address) {
      window.open(`${netCfg.params.blockExplorerUrls[0]}/address/${contract._address}`, '_blank');
    }
  }

  useMethod = (method, fields = {}) => {
    const { useMethod } = this.props;
    this.setState((prevState) => ({
      methodStates: {
        ...prevState.methodStates,
        [method.name]: { ...(prevState.methodStates[method.name] || {}), waiting: true },
      },
    }));

    useMethod({
      method,
      args: Object.values(fields),
      callback: (res) => this.scMethodHandler(method.name, res),
    });
  }

  scMethodHandler = (name, ans) => {
    this.setState((prevState) => ({
      methodStates: {
        ...prevState.methodStates,
        [name]: { ...prevState.methodStates[name], ...ans, waiting: false },
      },
    }));
  }

  render() {
    const {
      onConnect,
      onNewNetwork,
      contractConnected,
      pending,
      methods,
      walletConnected,
      error,
      msg,
      account,
      balance,
      contract,
      chainId,
      netCfg,
      onDisconnect,
      isLoadingEvts,
      events,
      loadEvents,
    } = this.props;
    const { methodStates, expertMode } = this.state;

    let content = null;
    if (!walletConnected) {
      content = (
        <div>
          <div className="row text-center m-3">
            <h3>Please connect your wallet</h3>
          </div>
          <div className="row text-center">
            <div className="col">
              <button type="button" className="btn btn-secondary" onClick={pending ? null : onConnect}>Connect</button>
            </div>
          </div>
        </div>
      );
    } else if (!contractConnected) {
      content = (
        <div>
          <div className="row text-center m-3">
            <h3>{`Switch to this app network (${netCfg.params.chainName})`}</h3>
          </div>
          <div className="row">
            <button type="button" className="btn btn-dark" onClick={pending ? null : onNewNetwork}>Switch</button>
          </div>
        </div>
      );
    } else {
      content = expertMode ? (
        <WalletUIpro
          chainId={chainId}
          balance={balance}
          account={account}
          methods={methods}
          data={methodStates}
          contractAddress={contract && contract._address}
          netParams={netCfg.params}
          errorMsg={error}
          useMethod={this.useMethod}
          openLink={this.openLink}
          loadEvents={loadEvents}
          getPriceRounded={getPriceRounded}
        />
      ) : (
        <WalletUIeasy
          chainId={chainId}
          balance={balance}
          account={account}
          methods={methods}
          data={methodStates}
          netParams={netCfg.params}
          errorMsg={error}
          useMethod={this.useMethod}
          openLink={this.openLink}
          loadBasicInfo={this.loadInfo}
          isLoadingEvts={isLoadingEvts}
          loadEvents={loadEvents}
          events={events}
          pending={pending}
          getPriceRounded={getPriceRounded}
        />
      );
    }

    return (
      <div className="container">
        <div className="row text-center m-3">
          <div className="row">
            <div className="col-2" />
            <div className="col col-md-8">
              <h1 className="text-main">ERC20 simple Dapp UI</h1>
            </div>
            <div className="col col-md-2" style={{ margin: 'auto' }}>
              <ToggleSwitch id="wallet-ctrl-mode" onChange={this.handleToggle} labels={{ on: 'Expert mode', off: 'Noob mode' }} />
            </div>
          </div>
        </div>
        <div>
          <div>
            {content}
          </div>
          {msg ? (
            <div className="row">
              <h5>{msg}</h5>
            </div>
          ) : null}
        </div>
        {walletConnected && contractConnected ? (
          <div className="row text-center">
            <div className="col-12">
              <button className="btn btn-disconnect mt-3 mb-4" type="button" onClick={onDisconnect}>Disconnect wallet</button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

export default withWallet(WalletController);
