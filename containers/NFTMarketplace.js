import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Web3 from 'web3';
import { abi as NFT_ABI } from '../abis/NFT.json';
import { abi as MARKETPLACE_ABI } from '../abis/Marketplace.json';

import NFTCard from '../components/NFTCard';
import MarketplaceHeader from '../components/MarketplaceHeader';

const NFTMarketplace = ({ nfts, account, web3 }) => {
  const [loading, setLoading] = useState(false);
  const [nftFilter, setNftFilter] = useState('');
  const [sortedNfts, setSortedNfts] = useState([]);

  useEffect(() => {
    const fetchNFTs = async () => {
      setLoading(true);
      try {
        const nftContract = new web3.eth.Contract(NFT_ABI, process.env.REACT_APP_NFT_CONTRACT_ADDRESS);
        const nftCount = await nftContract.methods.totalSupply().call();
        const nfts = [];
        for (let i = 0; i < nftCount; i++) {
          const nft = await nftContract.methods.tokenByIndex(i).call();
          nfts.push(nft);
        }
        setSortedNfts(nfts);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchNFTs();
  }, [web3]);

  const handleFilterChange = (event) => {
    setNftFilter(event.target.value);
  };

  const filteredNfts = sortedNfts.filter((nft) => {
    if (nftFilter === '') {
      return true;
    } else {
      return nft.name.toLowerCase().includes(nftFilter.toLowerCase());
    }
  });

  return (
    <div className="nft-marketplace">
      <MarketplaceHeader />
      <div className="nft-filter">
        <input type="text" value={nftFilter} onChange={handleFilterChange} placeholder="Search NFTs" />
      </div>
      <div className="nft-grid">
        {filteredNfts.map((nft) => (
          <NFTCard key={nft.tokenId} nft={nft} />
        ))}
      </div>
      {loading ? <div className="loading">Loading...</div> : null}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    nfts: state.nfts,
    account: state.account,
    web3: state.web3,
  };
};

export default connect(mapStateToProps)(NFTMarketplace);
