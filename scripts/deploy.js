const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  ethPool = await ethers.getContractFactory('EthPool');
  ethPool = await ethPool.deploy();
  await ethPool.deployed();
  console.log("EthPool contract address:", ethPool.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });