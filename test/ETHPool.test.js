const { expect, assert } = require('chai');
const { BigNumber } = require('ethers');
const { ethers } = require('hardhat');

describe('ETHPool contract', function () {
   before(async function () {
      [
         this.team,
         this.stakerOne,
         this.stakerTwo
      ] = await ethers.getSigners();

      this.ethPoolFactory = await ethers.getContractFactory('EthPool');

      this.ethPool = await this.ethPoolFactory.deploy();
      await this.ethPool.deployed();

      console.log('ethPool address is ', this.ethPool.address);
   });

   it('Stake: Should stake correctly', async function() {

      this.stakeAmount = ethers.utils.parseEther('10');
      await expect(this.ethPool.connect(this.stakerOne).stake({
         value: BigInt(this.stakeAmount)
      })).to.emit(this.ethPool, 'Stake')
      .withArgs(this.stakerOne.address, BigInt(this.stakeAmount));

      const poolBalance = await ethers.provider.getBalance(this.ethPool.address);
      expect(poolBalance).to.equal(BigInt(this.stakeAmount));
      expect(await this.ethPool.totalStaked()).to.equal(BigInt(this.stakeAmount));
   });

   it('Deposit Rewards: Should deposit rewards correctly', async function() {
      this.rewardsAmount = ethers.utils.parseEther('20');
      await expect(
         this.ethPool.depositRewards({
            value: BigInt(this.rewardsAmount)
         })
      ).emit(this.ethPool, 'DepositRewards')
      .withArgs(BigInt(this.rewardsAmount));

      const poolBalance = await ethers.provider.getBalance(this.ethPool.address);
      expect(poolBalance).to.equal(BigInt(this.stakeAmount) + BigInt(this.rewardsAmount));
      expect(await this.ethPool.rewardPerToken()).to.equal(ethers.utils.parseEther('2'));
   });

   it('Deposit Rewards: Should revert if deposit rewards without stake', async function () {
      this.ethPool = await this.ethPoolFactory.deploy();
      await this.ethPool.deployed();

      await expect(
         this.ethPool.depositRewards({ value: BigInt(this.rewardsAmount) })
      ).to.be.revertedWith('Total staked should be greater than zero');
   });

   it('Deposit Rewards: Should revert if deposit rewards not called by owner', async function () {
      this.ethPool = await this.ethPoolFactory.deploy();
      await this.ethPool.deployed();

      await expect(
         this.ethPool.connect(this.stakerOne).depositRewards({ 
            value: BigInt(this.rewardsAmount) 
         })
      ).to.be.revertedWith('Ownable: caller is not the owner');
   });

   it('Withdraw Stake & Rewards: Should withdraw stake correctly', async function () {
      await this.ethPool.connect(this.stakerOne).stake({ value: BigInt(this.stakeAmount) });

      await expect(
         this.ethPool.connect(this.stakerOne).withdrawStakeAndRewards()
      ).emit(this.ethPool, 'WithdrawStakeAndRewards')
      .withArgs(this.stakerOne.address, BigInt(this.stakeAmount), BigInt(0));

      expect(await ethers.provider.getBalance(this.ethPool.address)).to.equal(0);
      expect(await this.ethPool.totalStaked()).to.equal(0);
   });

   it('Withdraw Stake & Rewards: Should withdraw stake with rewards correctly', async function () {
      await this.ethPool.connect(this.stakerOne).stake({ value: BigInt(this.stakeAmount) });
      await this.ethPool.depositRewards({ value: BigInt(this.rewardsAmount) });

      expect(await ethers.provider.getBalance(this.ethPool.address)).to.equal(BigInt(this.stakeAmount) + BigInt(this.rewardsAmount));

      await expect(
         this.ethPool.connect(this.stakerOne).withdrawStakeAndRewards()
      ).emit(this.ethPool, 'WithdrawStakeAndRewards')
      .withArgs(this.stakerOne.address, BigInt(this.stakeAmount), BigInt(this.rewardsAmount));

      expect(await ethers.provider.getBalance(this.ethPool.address)).to.equal(0);
      expect(await this.ethPool.totalStaked()).to.equal(0);
   });

   it('Withdraw Stake & Rewards: Should withdraw stake with no rewards if staked after distribution', async function () {
      await this.ethPool.connect(this.stakerOne).stake({ value: BigInt(this.stakeAmount) });
      await this.ethPool.depositRewards({ value: BigInt(this.rewardsAmount) });
      await this.ethPool.connect(this.stakerTwo).stake({ value: BigInt(this.stakeAmount) });
      
      await expect(
         this.ethPool.connect(this.stakerOne).withdrawStakeAndRewards()
      ).emit(this.ethPool, 'WithdrawStakeAndRewards')
      .withArgs(this.stakerOne.address, BigInt(this.stakeAmount), BigInt(this.rewardsAmount));

      await expect(
         this.ethPool.connect(this.stakerTwo).withdrawStakeAndRewards()
      ).emit(this.ethPool, 'WithdrawStakeAndRewards')
      .withArgs(this.stakerTwo.address, BigInt(this.stakeAmount), BigInt(0));
   });

   it('Withdraw Stake & Rewards: Should withdraw stake with half rewards if two users stake same amount', async function () {
      await this.ethPool.connect(this.stakerOne).stake({ value: BigInt(this.stakeAmount) });
      await this.ethPool.connect(this.stakerTwo).stake({ value: BigInt(this.stakeAmount) });
      await this.ethPool.depositRewards({ value: BigInt(this.rewardsAmount) });
      
      await expect(
         this.ethPool.connect(this.stakerOne).withdrawStakeAndRewards()
      ).emit(this.ethPool, 'WithdrawStakeAndRewards')
      .withArgs(this.stakerOne.address, BigInt(this.stakeAmount), BigInt(this.rewardsAmount / 2));

      await expect(
         this.ethPool.connect(this.stakerTwo).withdrawStakeAndRewards()
      ).emit(this.ethPool, 'WithdrawStakeAndRewards')
      .withArgs(this.stakerTwo.address, BigInt(this.stakeAmount), BigInt(this.rewardsAmount / 2));
   });

   it('Withdraw Stake & Rewards: Should revert if unstaker balance is zero', async function () {
      this.ethPool = await this.ethPoolFactory.deploy();
      await this.ethPool.deployed();

      await expect(
         this.ethPool.connect(this.stakerOne).withdrawStakeAndRewards()
      ).to.be.revertedWith('Balance of unstaker should be greater than zero');
   });

});