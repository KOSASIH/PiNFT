pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/token/ERC721/SafeERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Auction {
    using SafeMath for uint256;

    // Mapping of auction IDs to auction details
    mapping(uint256 => AuctionDetails) public auctions;

    // Mapping of bidder addresses to their bids
    mapping(address => mapping(uint256 => Bid)) public bids;

    // Mapping of auction IDs to the highest bidder
    mapping(uint256 => address) public highestBidders;

    // Mapping of auction IDs to the highest bid amount
    mapping(uint256 => uint256) public highestBidAmounts;

    // Mapping of auction IDs to the auction creator
    mapping(uint256 => address) public auctionCreators;

    // Mapping of auction IDs to the auction end time
    mapping(uint256 => uint256) public auctionEndTimes;

    // Mapping of auction IDs to the auction start time
    mapping(uint256 => uint256) public auctionStartTimes;

    // Mapping of auction IDs to the auction duration
    mapping(uint256 => uint256) public auctionDurations;

    // Mapping of auction IDs to the auction status
    mapping(uint256 => AuctionStatus) public auctionStatuses;

    // Event emitted when an auction is created
    event AuctionCreated(uint256 indexed auctionId, address indexed creator, uint256 indexed tokenId, uint256 startPrice, uint256 endPrice, uint256 duration);

    // Event emitted when a bid is placed
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 indexed amount);

    // Event emitted when an auction is ended
    event AuctionEnded(uint256 indexed auctionId, address indexed winner, uint256 indexed amount);

    // Event emitted when an auction is cancelled
    event AuctionCancelled(uint256 indexed auctionId);

    // Enum for auction status
    enum AuctionStatus { Active, Ended, Cancelled }

    // Struct for auction details
    struct AuctionDetails {
        uint256 tokenId;
        uint256 startPrice;
        uint256 endPrice;
        uint256 duration;
        address creator;
    }

    // Struct for bid details
    struct Bid {
        uint256 amount;
        uint256 timestamp;
    }

    // Function to create an auction
    function createAuction(uint256 _tokenId, uint256 _startPrice, uint256 _endPrice, uint256 _duration) public {
        // Check if the auction creator is the owner of the token
        require(msg.sender == ERC721.ownerOf(_tokenId), "Only the owner can create an auction");

        // Create a new auction ID
        uint256 auctionId = uint256(keccak256(abi.encodePacked(_tokenId, _startPrice, _endPrice, _duration)));

        // Set the auction details
        auctions[auctionId] = AuctionDetails(_tokenId, _startPrice, _endPrice, _duration, msg.sender);

        // Set the auction creator
        auctionCreators[auctionId] = msg.sender;

        // Set the auction start time
        auctionStartTimes[auctionId] = block.timestamp;

        // Set the auction end time
        auctionEndTimes[auctionId] = block.timestamp + _duration;

        // Set the auction status
        auctionStatuses[auctionId] = AuctionStatus.Active;

        // Emit the AuctionCreated event
        emit AuctionCreated(auctionId, msg.sender, _tokenId, _startPrice, _endPrice, _duration);
    }

    // Function to place a bid on an auction
    function placeBid(uint256 _auctionId, uint256 _amount) public {
        // Check if the auction exists
        require(auctions[_auctionId].tokenId != 0, "Auction does not exist");

        // Check if the auction is active
        require(auctionStatuses[_auctionId] == AuctionStatus.Active, "Auction is not active");

        // Check if the bid amount is greater than the current highest bid
        require(_amount > highestBidAmounts[_auctionId], "Bid amount is not greater than the current highest bid");

        // Set the bidder's bid details
        bids[msg.sender][_auctionId] = Bid(_amount, block.timestamp);

        // Set the highest bidder
        highestBidders[_auctionId] = msg.sender;

        // Set the highest bid amount
        highestBidAmounts[_auctionId] = _amount;

        // Emit the BidPlaced event
        emit BidPlaced(_auctionId, msg.sender, _amount);
    }

        // Function to end an auction
    function endAuction(uint256 _auctionId) public {
        // Check if the auction exists
        require(auctions[_auctionId].tokenId != 0, "Auction does not exist");

        // Check if the auction is active
        require(auctionStatuses[_auctionId] == AuctionStatus.Active, "Auction is not active");

        // Check if the auction has ended
        require(block.timestamp >= auctionEndTimes[_auctionId], "Auction has not ended");

        // Set the auction status to Ended
        auctionStatuses[_auctionId] = AuctionStatus.Ended;

        // Get the highest bidder
        address highestBidder = highestBidders[_auctionId];

        // Get the highest bid amount
        uint256 highestBidAmount = highestBidAmounts[_auctionId];

        // Transfer the token to the highest bidder
        ERC721.transfer(auctions[_auctionId].tokenId, highestBidder);

        // Emit the AuctionEnded event
        emit AuctionEnded(_auctionId, highestBidder, highestBidAmount);
    }

    // Function to cancel an auction
    function cancelAuction(uint256 _auctionId) public {
        // Check if the auction exists
        require(auctions[_auctionId].tokenId != 0, "Auction does not exist");

        // Check if the auction is active
        require(auctionStatuses[_auctionId] == AuctionStatus.Active, "Auction is not active");

        // Check if the auction creator is the one cancelling the auction
        require(msg.sender == auctionCreators[_auctionId], "Only the auction creator can cancel the auction");

        // Set the auction status to Cancelled
        auctionStatuses[_auctionId] = AuctionStatus.Cancelled;

        // Emit the AuctionCancelled event
        emit AuctionCancelled(_auctionId);
    }

    // Function to get the auction details
    function getAuctionDetails(uint256 _auctionId) public view returns (AuctionDetails memory) {
        return auctions[_auctionId];
    }

    // Function to get the highest bidder
    function getHighestBidder(uint256 _auctionId) public view returns (address) {
        return highestBidders[_auctionId];
    }

    // Function to get the highest bid amount
    function getHighestBidAmount(uint256 _auctionId) public view returns (uint256) {
        return highestBidAmounts[_auctionId];
    }

    // Function to get the auction status
    function getAuctionStatus(uint256 _auctionId) public view returns (AuctionStatus) {
        return auctionStatuses[_auctionId];
    }
}
