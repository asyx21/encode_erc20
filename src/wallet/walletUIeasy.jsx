import React, { useEffect, useState } from 'react';
import { Card, Button, Offcanvas, Toast, Table } from 'react-bootstrap';

import ExpandInputAction from '../components/expandInputAction';
import { getImageUrl } from '../utils';

/*
  const methods = [
    name,
    decimals,
    symbol,
    'getOwner',
    'owner',
    'totalSupply',
    'burn',
    'mint',
    'balanceOf',
    'transferOwnership',
    'approve',
    'allowance',
    'decreaseAllowance',
    'increaseAllowance',
    'transfer',
    'transferFrom',
  ];
*/

function DisplayEvt({
  evt, decimals, openLink,
}) {
  return (
    <Toast className="m-2">
      <Toast.Header closeButton={false}>
        <div className="row w-100">
          <div className="col-12">
            <strong className="me-auto">{evt.event}</strong>
          </div>
          <div className="col-12 overflow-hidden" role="button" onClick={() => openLink({ hash: evt.transactionHash })}>
            <small>{evt.transactionHash}</small>
          </div>
        </div>
      </Toast.Header>
      <Toast.Body>
        {Object.entries(evt.returnValues).map(([k, v]) => {
          if (Number.isNaN(parseInt(k, 10))) {
            return (
              <div className="row" key={`${evt.id}${k}`}>
                <div className="col-12"><strong>{k}</strong></div>
                <div className="col-12">{k === 'value' ? v / 10 ** decimals : v}</div>
              </div>
            );
          }
          return null;
        })}
      </Toast.Body>
    </Toast>
  );
}

const parseStates = (states) => {
  const result = {};
  Object.entries(states).forEach(([key, val]) => {
    if (val && val.results) result[key] = val.results[0];
  });
  return result;
};

function WalletUIeasy({
  chainId,
  balance,
  account,
  methods,
  data,
  netParams,
  error,
  useMethod,
  loadBasicInfo,
  openLink,
  isLoadingEvts,
  events,
  loadEvents,
  pending,
  getPriceRounded,
}) {
  const [drawerOpen, setDrawer] = useState(false);
  useEffect(() => (!data.name ? loadBasicInfo() : undefined));

  const openDrawer = () => setDrawer(!drawerOpen);

  const scMethods = methods.reduce((result, method) => ({ ...result, [method.name]: method }), {});
  const states = parseStates(data);
  const {
    owner, decimals, symbol, balanceOf, name,
  } = states;
  const scBalance = balanceOf && decimals ? balanceOf * 10 ** (-decimals) : '?';

  if (error) {
    return (
      <div className="p-4">
        <div className="row" style={{ marginTop: '15px' }}>
          <h3 style={{ color: 'red' }}>{error}</h3>
        </div>
      </div>
    );
  }

  // const logoPath = `./assets/${netParams.nativeCurrency.symbol.toLowerCase()}-logo.png`;
  const logoPath = getImageUrl(`${netParams.nativeCurrency.symbol.toLowerCase()}-logo`);
  return (
    <div className="">
      <div>
        <Card className="text-center">
          <Card.Header>
            <div className="row text-center">
              <div className="col-12 col-md-1 mt-2">
                {chainId === netParams.chainId ? (
                  <img
                    src={logoPath}
                    className="rounded mx-auto d-block mb-2"
                    alt={chainId}
                    style={{ maxHeight: '1.8rem' }}
                  />
                ) : '...'}
              </div>
              <div className="col-12 col-md-1 mt-2">Account</div>
              <div className="col-12 col-md-6 mt-2 overflow-auto">
                <span className="badge rounded-pill look-main">
                  <h6 style={{ margin: 'auto' }}>{account}</h6>
                </span>
              </div>
              <div className="col-6 col-md-1 mt-2">Balance</div>
              <div className="col-6 col-md-2 mt-2" style={{ maxWidth: '150px', overflowY: 'auto' }}>
                <span className="badge rounded-pill look-main">
                  <h6 className="fw-bold" style={{ margin: 'auto' }}>
                    {Number.isNaN(balance) ? '?' : `${getPriceRounded(balance)} ${netParams.nativeCurrency.symbol}`}
                  </h6>
                </span>
              </div>
              <div className="col-12 col-md-1 mt-1">
                <button className="btn btn-secondary rounded" type="button" disabled={pending || isLoadingEvts} onClick={() => { loadEvents(); openDrawer(); }}>
                  {isLoadingEvts ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" /> : null}
                  Events
                </button>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <Card.Title>
              <div className="btn-group" role="group" aria-label="title">
                <button type="button" className="btn btn-secondary" onClick={openLink}>Contract</button>
                <button type="button" className="btn btn-light">{name}</button>
                <button type="button" className="btn btn-secondary">{`${getPriceRounded(scBalance)} ${symbol}`}</button>
              </div>
            </Card.Title>
            {!data || !data.balanceOf || data.balanceOf.waiting ? (
              <div>
                <span className="spinner-border txt-main" role="status">
                  <span className="sr-only" />
                </span>
              </div>
            ) : (
              <Button className="look-main" variant="main" onClick={() => useMethod(scMethods.balanceOf, { account })}>
                {`Update ${symbol} balance`}
              </Button>
            )}
            {methods.length ? (
              <>
                <ExpandInputAction
                  decimals={decimals}
                  symbol={symbol}
                  method={scMethods.approve}
                  data={data.approve}
                  useMethod={useMethod}
                  account={account}
                  label="Approve"
                  validate="Approve spender"
                  tips="Approve another account to spend token on your behalf"
                />
                <ExpandInputAction
                  decimals={decimals}
                  symbol={symbol}
                  method={scMethods.allowance}
                  data={data.allowance}
                  useMethod={useMethod}
                  account={account}
                  label="Allowance"
                  validate="See allowance"
                  tips="Get amount allowed to be spent by spender"
                />
                <ExpandInputAction
                  decimals={decimals}
                  symbol={symbol}
                  method={scMethods.transfer}
                  data={data.transfer}
                  useMethod={useMethod}
                  account={account}
                  label="Send tokens"
                  validate="Send"
                  tips="Send tokens to another account"
                />
                <ExpandInputAction
                  decimals={decimals}
                  symbol={symbol}
                  method={scMethods.transferFrom}
                  data={data.transferFrom}
                  useMethod={useMethod}
                  account={account}
                  label="Get tokens from"
                  validate="Collect"
                  tips="Collect funds from a friend's addres who allowed such operation"
                />
                <ExpandInputAction
                  decimals={decimals}
                  symbol={symbol}
                  method={scMethods.mint}
                  data={data.mint}
                  useMethod={useMethod}
                  account={account}
                  label="Get free tokens"
                  validate="Get money !"
                  // tips="Collect funds from a friend's addres who allowed such operation"
                />
                {owner && account && owner.toLowerCase() === account.toLowerCase() ? (
                  <>
                    <ExpandInputAction
                      decimals={decimals}
                      symbol={symbol}
                      method={scMethods.transferOwnership}
                      data={data.transferOwnership}
                      useMethod={useMethod}
                      account={account}
                      label="Transfer ownership"
                      validate="Transfer"
                      tips="Transfer ownership to another account"
                    />
                    <ExpandInputAction
                      danger
                      decimals={decimals}
                      symbol={symbol}
                      method={scMethods.renounceOwnership}
                      data={data.renounceOwnership}
                      useMethod={useMethod}
                      account={account}
                      label="Renounce ownership"
                      validate="Renounce ownership"
                      tips="Renounce and realease the ownership to nobody"
                    />
                  </>
                ) : null}
              </>
            ) : (
              <div>
                <span className="spinner-border txt-main" role="status">
                  <span className="sr-only" />
                </span>
              </div>
            )}
          </Card.Body>
          <Card.Footer className="text-muted">
            <button type="button" className="btn btn-link text-muted" onClick={openLink} style={{ color: 'black' }}>
              <h6>Explore contract</h6>
            </button>
          </Card.Footer>
        </Card>
      </div>
      <Offcanvas show={drawerOpen} onHide={openDrawer} scroll>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{isLoadingEvts ? 'Loading events...' : 'Events listing'}</Offcanvas.Title>
        </Offcanvas.Header>
        {isLoadingEvts ? (
          <div className="d-flex justify-content-center">
            <span className="spinner-grow txt-main" style={{ width: '5rem', height: '5rem' }} role="status">
              <span className="sr-only" />
            </span>
          </div>
        ) : (
          <Offcanvas.Body>
            <h4 className="m-3">
              My last events
              {' '}
              <span role="img" aria-label="smile">😎</span>
            </h4>
            {events.user && events.user.length ? (
              events.user.map(evt => (
                <DisplayEvt key={`evt-user-${evt.id}`} evt={evt} decimals={decimals} openLink={openLink} />
              ))) : 'No perso event...'}
            <h4 className="m-3 mt-5">
              Allowed spender accounts
              {' '}
              <span role="img" aria-label="money">💸</span>
            </h4>
            {events.allowance ? (
              <Table className="w-100 overflow-auto" striped borderless hover responsive="sm">
                <thead>
                  <tr>
                    <th className="fw-bold">Amount</th>
                    <th className="fw-bold">Spender</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(events.allowance).map(([acc, amnt]) => (
                    <tr key={acc}>
                      <td><span className="badge rounded-pill bg-primary">{`${amnt} ${symbol}`}</span></td>
                      <td>{acc}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : null}
            <h4 className="m-3 mt-5">
              Latest public events
              {' '}
              <span role="img" aria-label="notes">📝</span>
            </h4>
            {events.lasts && events.lasts.length ? (
              events.lasts.map(evt => (
                <DisplayEvt key={`evt-lasts-${evt.id}`} evt={evt} decimals={decimals} openLink={openLink} />
              ))) : 'No perso event...'}
          </Offcanvas.Body>
        )}
      </Offcanvas>
    </div>
  );
}

export default WalletUIeasy;
