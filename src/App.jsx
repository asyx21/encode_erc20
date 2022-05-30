import logo from './assets/logo.png'
import Wallet from './wallet/walletCtrl';

import CONFIG from './CONFIG.json';
import NETWORK from './networkCfg';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <main>
        <Wallet config={CONFIG} netCfg={NETWORK} />
      </main>
    </div>
  );
}

export default App
