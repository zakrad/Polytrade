// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/// @author Mohammad Z. Rad
/// @title Multitoken Swapper
/**
* @dev First we deploy 2 ERC20 token (PLT, TLT) then this contract which is an ERC20 Wrapp token with default price of 1 and the price can change by Owner 
*/
///@notice ERC20 interface to interact with ant ERC20 contract
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./WrappToken.sol";


contract Swapper is WrappToken, Ownable {
    
    IERC20 private token;
    ///@notice wrpPrice initial price
    uint256 public wrpPrice = 1;

    ///@notice events which emit after Swapping and Unswapping
    event Swapped(address user, uint256 amount);
    event Unswapped(address user, uint256 amount);

    constructor() {
    }

    ///@notice a modifier to simple check parameters before swap and unswap runs
    modifier priorCheck(address token_, uint256 amount) {
        require(msg.sender != address(0), "sender should not be null");
        require(token_ != address(0), "token address should not be null");
        require(amount >= 0, "amount should be greater than 0");
        _;
    }

    ///@dev price input should be without decimal precision 
    function setPrice(uint price) external onlyOwner {
        wrpPrice = price;
    }

    ///@param token_ address of ERC20 token
    ///@param amount amount of token sender will send to swap for wrapp token 
    ///@notice this function take amount of ERC20 token and swap for wrapp token
    function swap(address token_, uint256 amount) external priorCheck(token_, amount) {
        token = IERC20(token_);
        uint256 allowance = token.allowance(msg.sender, address(this));
        uint256 balance = token.balanceOf(msg.sender);
        require(allowance >= amount, "approve contract to spend your tokens");
        require(balance >= amount, "you don't have enough token");
        token.transferFrom(msg.sender, address(this), amount);
        _mint(msg.sender, (amount / getPrice()));
        emit Swapped(msg.sender, amount);
    }
    /**
    *@param token_ address of ERC20 token he wants to redeem
    *@param amount amount of wrapp token sender will send to redeem his/her initial ERC20 token 
    *@notice this function take amount of wrapp token and unswap for ERC20 token
    *@dev there are some possibilities if owner change Price it could result in not having enough reserveBalance so swapping and unswapping will redeem themselves as long as same amount with same price exchange between contract and sender happens
    */ 
    function unswap(address token_, uint256 amount) external priorCheck(token_, amount) {
        token = IERC20(token_);
        uint256 balance = balanceOf(msg.sender);
        uint256 reserveBalance = token.balanceOf(address(this));
        require(balance >= amount, "you don't have this amount of wrapped token");
        require(reserveBalance >= (amount * getPrice()), "Not enough reserve balance to redeem");
        _burn(msg.sender, amount);
        token.transfer(msg.sender, amount * getPrice());
        emit Unswapped(msg.sender, amount);
    }

    ///@notice The Owner (which is deployer of Swapper) can Set the Price of each Wrapp token
    ///@dev This could result in not having enough reserveBalance to redeem when Unswapping happens
    function getPrice() public view returns (uint256) {
        return  wrpPrice;
    }

}
