import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Web3 from 'web3';
import { abi as NFT_ABI } from '../abis/NFT.json';
import { abi as MARKETPLACE_ABI } from '../abis/Marketplace.json';

const NFTCard = ({ nft }) => {
  const [owner, setOwner] = useState('');
  const [price, setPrice] = useState(0);
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const web3 = new Web3(window.ethereum);
    const nftContract = new web3.eth.Contract(NFT_ABI, nft.contractAddress);
    const marketplaceContract = new web3.eth.Contract(MARKETPLACE_ABI, process.env.REACT_APP_MARKETPLACE_CONTRACT_ADDRESS);

    const getOwner = async () => {
      const ownerAddress = await nftContract.methods.ownerOf(nft.tokenId).call();
      setOwner(ownerAddress);
    };

    const getPrice = async () => {
      const priceWei = await marketplaceContract.methods.getPrice(nft.tokenId).call();
      setPrice(web3.utils.fromWei(priceWei, 'ether'));
    };

    const getAuction = async () => {
      const auctionId = await marketplaceContract.methods.getAuctionId(nft.tokenId).call();
      if (auctionId !== '0') {
        const auctionDetails = await marketplaceContract.methods.getAuctionDetails(auctionId).call();
        setAuction(auctionDetails);
      }
    };

    getOwner();
    getPrice();
    getAuction();
  }, [nft]);

  const handleBuy = async () => {
    setLoading(true);
    try {
      const web3 = new Web3(window.ethereum);
      const marketplaceContract = new web3.eth.Contract(MARKETPLACE_ABI, process.env.REACT_APP_MARKETPLACE_CONTRACT_ADDRESS);
      await marketplaceContract.methods.buyNFT(nft.tokenId).send({ from: window.ethereum.selectedAddress });
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handlePlaceBid = async () => {
    setLoading(true);
    try {
      const web3 = new Web3(window.ethereum);
      const marketplaceContract = new web3.eth.Contract(MARKETPLACE_ABI, process.env.REACT_APP_MARKETPLACE_CONTRACT_ADDRESS);
      await marketplaceContract.methods.placeBid(nft.tokenId, price).send({ from: window.ethereum.selectedAddress });
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="nft-card">
      <img src={nft.image} alt={nft.name} />
      <div className="nft-info">
        <h2>{nft.name}</h2>
        <p>Owner: {owner}</p>
        <p>Price: {price} ETH</p>
        {auction ? (
          <div>
            <p>Auction: {auction.startPrice} ETH - {auction.endPrice} ETH</p>
            <p>Auction ends: {new Date(auction.endTime * 1000).toLocaleString()}</p>
            <button onClick={handlePlaceBid}>Place Bid</button>
          </div>
        ) : (
          <button onClick={handleBuy}>Buy Now</button>
        )}
      </div>
      {loading ? <div className="loading">Loading...</div> : null}
    </div>
  );
};

export default NFTCard;
