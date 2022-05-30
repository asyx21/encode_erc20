import React from 'react';
import InteractiveRow from '../components/interactiveRow';

function WalletUIpro({
  chainId,
  balance,
  account,
  methods,
  data,
  contractAddress,
  error,
  useMethod,
  openLink,
  getPriceRounded,
}) {
  return (
    <div className="p-4">
      <div>
        {error ? (
          <div className="row" style={{ marginTop: '15px' }}>
            <h3 style={{ color: 'red' }}>{error}</h3>
          </div>
        ) : (
          <div>
            <div>
              <div>
                <h5><span className="badge rounded-pill bg-primary">Your account</span></h5>
              </div>
              <div className="row mt-2">
                <div className="input-group mb-3">
                  <span className="input-group-text" id="netId">ChainId</span>
                  <input type="text" className="form-control" id="netId" defaultValue={chainId} disabled />
                </div>
                <div className="input-group mb-3">
                  <span className="input-group-text" id="account">Account</span>
                  <input type="text" className="form-control" id="account" defaultValue={account} disabled />
                </div>
                <div className="input-group mb-3">
                  <span className="input-group-text" id="balance">Balance</span>
                  <input type="text" className="form-control" id="balance" defaultValue={getPriceRounded(balance)} disabled />
                </div>
              </div>
            </div>
            <div className="mt-3">
              <h5><span className="badge rounded-pill bg-primary">List of contract&apos;s functions</span></h5>
              <ul className="list-group">
                {methods.sort((a, b) => (a.stateMutability < b.stateMutability ? 1 : -1)).map((el) => (
                  <li className="list-group-item overflow-auto" key={el.name}>
                    <InteractiveRow item={el} data={data[el.name]} action={useMethod} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      {contractAddress ? (
        <div className="row mt-2 mb-4">
          <button type="button" className="btn btn-secondary" onClick={openLink}>
            <h6>
              Contract address:
              {' '}
              {contractAddress || 'not found'}
            </h6>
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default WalletUIpro;
