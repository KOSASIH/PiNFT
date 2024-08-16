import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import { Web3Provider } from '@ethersproject/providers';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';

import App from './App';
import NFTMarketplace from './containers/NFTMarketplace';
import AuctionHouse from './containers/AuctionHouse';
import WalletConnect from './components/WalletConnect';
import Header from './components/Header';
import Footer from './components/Footer';

import nftReducer from './reducers/nftReducer';
import auctionReducer from './reducers/auctionReducer';
import walletReducer from './reducers/walletReducer';

import './index.css';

const rootReducer = combineReducers({
  nfts: nftReducer,
  auctions: auctionReducer,
  wallet: walletReducer,
});

const store = createStore(rootReducer);

const web3Provider = new Web3Provider(window.ethereum);

const AppContainer = () => {
  return (
    <Web3ReactProvider>
      <Provider store={store}>
        <BrowserRouter>
          <Header />
          <Switch>
            <Route path="/" exact component={App} />
            <Route path="/nft-marketplace" component={NFTMarketplace} />
            <Route path="/auction-house" component={AuctionHouse} />
          </Switch>
          <Footer />
        </BrowserRouter>
        <WalletConnect />
      </Provider>
    </Web3ReactProvider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <AppContainer />
  </React.StrictMode>,
  document.getElementById('root')
);

// Initialize Web3 provider
web3Provider.initialize().then(() => {
  console.log('Web3 provider initialized');
});

// Set up Ethereum provider
ethers.getDefaultProvider().then((provider) => {
  console.log('Ethereum provider set up');
});
