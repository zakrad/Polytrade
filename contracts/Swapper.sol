// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./WrappToken.sol";


contract Swapper is WrappToken, Ownable {
    
    IERC20 private token;

    uint256 public wrpPrice = 10000;

    mapping(address => mapping(address => uint256)) tokenToBalances;
    event Swapped(address user,uint256 amount);
    event Unswapped(address user,uint256 amount);

    constructor() {
    }

    modifier priorCheck(address token_, uint256 amount) {
        require(msg.sender != address(0), "sender should not be null");
        require(token_ != address(0), "token address should not be null");
        require(amount >= 0, "amount should be greater than 0");
        _;
    }

    ///@dev price input should be (ActualPrice * 10e4) for decimal precision
    function setPrice(uint price) external onlyOwner {
        wrpPrice = price;
    }

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

    function getPrice() private view returns (uint256) {
        return  wrpPrice / (10 ** 4);
    }

}
