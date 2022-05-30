import React, { Component } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';

function withWallet(WrappedComponent) {
  return class WalletProvider extends Component {
    constructor(props) {
      super(props);
      const { netCfg } = this.props;

      this.state = {
        walletConnected: false,
        contractConnected: false,
        chainId: netCfg.chainId,
        contract: null,
        account: '',
        error: '',
        msg: '',
        web3: null,
        pending: false,
        events: [],
        contractSpec: null,
        loadingEvents: false,
        lastBlockEvent: null,
        eventHistory: {},
      };
    }

    async componentDidMount() {
      const provider = await detectEthereumProvider();

      if (provider) {
        if (provider !== window.ethereum) {
          this.setState({ error: 'Do you have multiple wallets installed?' });
        }
        this.connectWallet(); // Initialize your app
      } else {
        this.setState({ error: 'Please install MetaMask!' });
      }
    }

    resetStates = () => {
      const { netCfg } = this.props;

      this.setState({
        walletConnected: false,
        contractConnected: false,
        chainId: netCfg.chainId,
        contract: null,
        account: '',
        error: '',
        msg: '',
        web3: null,
        pending: false,
        events: [],
        contractSpec: null,
        isLoadingEvts: false,
        lastBlockEvent: null,
        eventHistory: {},
      });
    }

    connectWallet = async () => {
      this.setState({ pending: true });

      await window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then(this.handleAccountsChanged)
        .catch((err) => {
          if (err.code === 4001) { // EIP-1193 userRejectedRequest
            console.info('Please connect to MetaMask.');
          } else {
            console.error(err);
          }
        });

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      this.handleNetworkChanged(chainId);

      // event's handlers
      window.ethereum.on('chainChanged', this.handleNetworkChanged);
      window.ethereum.on('accountsChanged', this.handleAccountsChanged);
      window.ethereum.on('disconnect', (error) => {
        console.warn('WARNING: Disconnected', error);
        this.setState({ walletConnected: false });
      });
      window.ethereum.on('connect', (info) => {
        console.info('INFO: Connected', info);
        this.setState({ walletConnected: true });
      });

      this.setState({ pending: false });
      // await this.connectContract(chainId);
    }

    connectContract = async (chainId) => {
      const { config } = this.props;
      const { account, web3, contract } = this.state;
      const prov = process.env.LOCAL_NODE || Web3.givenProvider;
      const provider = web3 || new Web3(prov);

      const netId = Web3.utils.hexToNumber(chainId);
      if (!config.networks[netId]) {
        console.warn('WARNING: Network not configured for chainId', netId);
        this.setState({
          contractConnected: false,
          web3: provider,
        });
        return;
      }

      const sc = contract || new provider.eth.Contract(
        config.abi,
        config.networks[netId].address,
      );

      const balance = await provider.eth.getBalance(account);

      this.setState({
        contract: sc,
        web3: provider,
        contractConnected: true,
        balance: provider.utils.fromWei(balance),
      });
    }

    handleAccountsChanged = async (accounts) => {
      const { account, web3 } = this.state;
      if (accounts.length === 0) {
        this.resetStates();
      } else if (accounts[0] !== account) {
        const balance = web3 ? await web3.eth.getBalance(accounts[0]) : '?';
        this.setState({
          accounts,
          account: accounts[0],
          balance: web3 ? Web3.utils.fromWei(balance) : balance,
          walletConnected: true,
        });
      }
    }

    handleNetworkChanged = async (chainId) => {
      const { netCfg } = this.props;
      const { contractConnected } = this.state;

      this.setState({
        contractConnected: chainId === netCfg.chainId,
        chainId,
        walletConnected: true,
        pending: false,
      }, () => {
        if (chainId === netCfg.chainId && !contractConnected) {
          this.connectContract(chainId);
        }
      });
    }

    proposeNewChain = async () => {
      const { netCfg } = this.props;
      this.setState({ pending: true });
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: netCfg.chainId }],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [netCfg.params],
            });
          } catch (addError) {
            console.error('ERROR: (addError)', addError);
          }
        }
        console.error('ERROR: (switchError)', switchError);
      }
    }

    useMethod = async ({ method, args = [], callback = () => {} }) => {
      const { contract, account } = this.state;
      if (!contract) return;

      const fct = method.constant ? 'call' : 'send';
      try {
        await contract.methods[method.name](...args)[fct]({
          from: account,
        })
          .then((...res) => callback({ results: res, error: false }));
      } catch (err) {
        console.error(`ERROR: ${fct} contract`, err);
        callback({ error: err });
      }
    }

    getEvents = async (limit = 30, chucks = 999) => {
      const { netCfg, config } = this.props;
      const {
        contract, web3, lastBlockEvent, account, eventHistory, events,
      } = this.state;

      const { transactionHash } = config.networks[Web3.utils.hexToNumber(netCfg.chainId)];
      if (contract) {
        this.setState({ isLoadingEvts: true });
        const nb = await web3.eth.getBlockNumber();
        const deployBlock = await web3.eth.getTransaction(transactionHash);

        let fail = null;
        const getEvts = async (from, to) => {
          let ret = false;
          try {
            ret = await contract.getPastEvents('allEvents', { fromBlock: from || 0, toBlock: to || 'latest' });
          } catch (err) {
            console.error('ERROR: getting allEvents', err && err.details ? err.details : err);
            fail = to;
          }
          return ret;
        };

        let loaded = lastBlockEvent === nb;
        let from = lastBlockEvent || (nb - chucks);
        let to = nb;
        const evts = [];
        while (!loaded) {
          // eslint-disable-next-line no-await-in-loop
          const evt = await getEvts(from, to);
          // console.log('Get events: from, to', from, to); // uncomment for debugging
          if (!evt) {
            loaded = true;
            break;
          }
          evts.push(...evt);
          if (evts.length >= limit) loaded = true; // uncomment to speedup (testings)
          if (from <= (lastBlockEvent || deployBlock.blockNumber)) loaded = true;
          to = from;
          from -= chucks;
          if (from < 0) from = 0;
        }
        if (fail) console.info('Failed query at block number', fail);

        const all = eventHistory && eventHistory.all
          ? [...evts.filter((el) => (el.raw.topics.includes(Web3.utils.padLeft(account, 64)))), ...eventHistory.all]
          : evts.filter((el) => (el.raw.topics.includes(Web3.utils.padLeft(account, 64))));
        // Can parse account as well with: Object.values(el.returnValues).includes(Web3.utils.toChecksumAddress(account))

        const allowance = events.allowance || {};
        all.filter((el) => (el.event === 'Approval' && el.returnValues.owner === Web3.utils.toChecksumAddress(account)))
          .forEach((el) => {
            if (!allowance[el.returnValues.spender]) allowance[el.returnValues.spender] = true;
          });

        const promises = Object.keys(allowance).map((acc) => (
          contract.methods.allowance(account, acc)
        ));
        const allAlloances = await Promise.all(promises.map((p) => p.call({ from: account })));
        const newAllowance = {};
        Object.keys(allowance).forEach((acc, id) => {
          newAllowance[acc] = allAlloances[id] / 10 ** netCfg.params.nativeCurrency.decimals;
        });

        this.setState({
          isLoadingEvts: false,
          // lastBlockFail: fail,
          events: {
            lasts: events && events.lasts
              ? [...evts.slice(0, limit), ...events.lasts].slice(0, limit)
              : evts.slice(0, limit),
            user: all.slice(0, limit),
            allowance: newAllowance,
          },
          eventHistory: { all },
          lastBlockEvent: nb,
        });
      }
    }

    render() {
      const { contract, events, isLoadingEvts } = this.state;
      const methods = [];
      const contractEvents = [];
      if (contract && contract._jsonInterface) contract._jsonInterface.forEach((el) => {
        if (el.type === 'function') methods.push(el);
        if (el.type === 'event') contractEvents.push(el);
      });

      return (
        <WrappedComponent
          {...this.state}
          {...this.props}
          methods={methods.filter((m) => (m.name[0] !== '_'))}
          contractEvents={contractEvents}
          useMethod={this.useMethod}
          onNewNetwork={this.proposeNewChain}
          onConnect={this.connectWallet}
          onDisconnect={this.resetStates}
          events={events}
          loadEvents={this.getEvents}
          isLoadingEvts={isLoadingEvts}
        />
      );
    }
  };
}

export default withWallet;
