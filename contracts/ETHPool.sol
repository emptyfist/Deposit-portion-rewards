// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @notice EthPool exposes functions to stake Eth and receive rewards based on the time and share of staked amount.
 */
contract EthPool is Ownable {
  using SafeMath for uint256;

  mapping(address => uint256) public balances;
  mapping(address => uint256) public discountRewardsForBalances;
  uint256 public totalStaked;
  uint256 public rewardPerToken;
  uint256 public decimalFactor = 1e18;
  
  event Stake(address payable indexed staker, uint256 amount);
  event WithdrawStakeAndRewards(address indexed unstaker, uint256 amount, uint256 rewardsAmount);
  event DepositRewards(uint256 amount);
  
  function stake() external payable {
    balances[msg.sender] += msg.value;
    discountRewardsForBalances[msg.sender] = discountRewardsForBalances[msg.sender].add(rewardPerToken.mul(msg.value).div(decimalFactor));
    totalStaked += msg.value;

    emit Stake(payable(msg.sender), msg.value);
  }

  function depositRewards() external payable onlyOwner() {
    require(totalStaked > 0, 'Total staked should be greater than zero');
    rewardPerToken = rewardPerToken.add(msg.value.mul(decimalFactor).div(totalStaked));

    emit DepositRewards(msg.value);
  }

  function withdrawStakeAndRewards() external {
    require(balances[msg.sender] > 0, 'Balance of unstaker should be greater than zero');

    uint256 _unstakerBalance = balances[msg.sender];
    uint256 _rewardAmount = _unstakerBalance.mul(rewardPerToken).div(decimalFactor);
    uint256 _finalRewards = _rewardAmount.sub(discountRewardsForBalances[msg.sender]);

    balances[msg.sender] = 0;
    discountRewardsForBalances[msg.sender] = 0;
    totalStaked -= _unstakerBalance;
    payable(msg.sender).transfer(_unstakerBalance.add(_finalRewards));

    emit WithdrawStakeAndRewards(msg.sender, _unstakerBalance, _finalRewards);
  }

}