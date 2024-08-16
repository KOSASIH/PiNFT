import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Web3 from 'web3';
import { abi as AUCTION_HOUSE_ABI } from '../abis/AuctionHouse.json';

import AuctionCard from '../components/AuctionCard';
import MarketplaceHeader from '../components/MarketplaceHeader';

const AuctionHouse = ({ auctions, account, web3 }) => {
  const [loading, setLoading] = useState(false);
  const [auctionFilter, setAuctionFilter] = useState('');
  const [sortedAuctions, setSortedAuctions] = useState([]);

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      try {
        const auctionHouseContract = new web3.eth.Contract(AUCTION_HOUSE_ABI, process.env.REACT_APP_AUCTION_HOUSE_CONTRACT_ADDRESS);
        const auctionCount = await auctionHouseContract.methods.totalAuctions().call();
        const auctions = [];
        for (let i = 0; i < auctionCount; i++) {
          const auction = await auctionHouseContract.methods.getAuction(i).call();
          auctions.push(auction);
        }
        setSortedAuctions(auctions);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, [web3]);

  const handleFilterChange = (event) => {
    setAuctionFilter(event.target.value);
  };

  const filteredAuctions = sortedAuctions.filter((auction) => {
    if (auctionFilter === '') {
      return true;
    } else {
      return auction.name.toLowerCase().includes(auctionFilter.toLowerCase());
    }
  });

  return (
    <div className="auction-house">
      <MarketplaceHeader />
      <div className="auction-filter">
        <input type="text" value={auctionFilter} onChange={handleFilterChange} placeholder="Search Auctions" />
      </div>
      <div className="auction-grid">
        {filteredAuctions.map((auction) => (
          <AuctionCard key={auction.id} auction={auction} />
        ))}
      </div>
      {loading ? <div className="loading">Loading...</div> : null}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    auctions: state.auctions,
    account: state.account,
    web3: state.web3,
  };
};

export default connect(mapStateToProps)(AuctionHouse);
