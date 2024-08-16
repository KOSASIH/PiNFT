import React from 'react';
import { Link } from 'react-router-dom';
import Web3 from 'web3';

const MarketplaceHeader = () => {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const web3 = new Web3(window.ethereum);
    web3.eth.getAccounts().then(accounts => {
      setAccount(accounts[0]);
    });
    web3.eth.getBalance(account).then(balance => {
      setBalance(web3.utils.fromWei(balance, 'ether'));
    });
  }, []);

  return (
    <header className="marketplace-header">
      <div className="logo">
        <Link to="/">Marketplace</Link>
      </div>
      <div className="account-info">
        <p>Account: {account}</p>
        <p>Balance: {balance} ETH</p>
      </div>
      <nav>
        <ul>
          <li><Link to="/create-nft">Create NFT</Link></li>
          <li><Link to="/my-nfts">My NFTs</Link></li>
          <li><Link to="/marketplace">Marketplace</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default MarketplaceHeader;
