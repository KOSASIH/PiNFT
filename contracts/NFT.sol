pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/token/ERC721/SafeERC721.sol";

contract NFT {
    address private owner;
    string private name;
    string private symbol;
    uint256 private totalSupply;

    mapping(address => uint256) public balances;
    mapping(uint256 => NFT) public nftMap;

    constructor(string memory _name, string memory _symbol) public {
        owner = msg.sender;
        name = _name;
        symbol = _symbol;
        totalSupply = 0;
    }

    function mint(address _to, string memory _uri) public {
        require(msg.sender == owner, "Only the owner can mint NFTs");
        uint256 newTokenId = totalSupply++;
        nftMap[newTokenId] = NFT(_to, _uri);
        balances[_to] = balances[_to] + 1;
        emit Transfer(address(0), _to, newTokenId);
    }

    function transfer(address _from, address _to, uint256 _tokenId) public {
        require(balances[_from] > 0, "Insufficient balance");
        require(nftMap[_tokenId].owner == _from, "Invalid token owner");
        balances[_from] = balances[_from] - 1;
        balances[_to] = balances[_to] + 1;
        nftMap[_tokenId].owner = _to;
        emit Transfer(_from, _to, _tokenId);
    }

    function getNFT(uint256 _tokenId) public view returns (NFT) {
        return nftMap[_tokenId];
    }
}
