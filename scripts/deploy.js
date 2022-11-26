const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const PolToken = await ethers.getContractFactory("PolyToken");
  const poltoken = await PolToken.deploy();

  await poltoken.deployed();

  console.log(
    `PolToken deployed to ${poltoken.address}`
  );

  const TradeToken = await ethers.getContractFactory("TradeToken");
  const tradetoken = await TradeToken.deploy();
  await tradetoken.deployed();

  console.log(
    `TradeToken deployed to ${tradetoken.address}`
  );

  const WrapToken = await ethers.getContractFactory("WrappToken");
  const wraptoken = await WrapToken.deploy();
  await wraptoken.deployed();

  console.log(
    `WrapToken deployed to ${wraptoken.address}`
  );

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// 0xA0855bACF7712001DF3b3aa6209c879A323a97Ff Polytoken
// 0xdB3457d1649eF0e3E306b8A7Ecd66E50d7Ef31cD Tradetoken
// 0xEb22eDf3F11453AeC427e29308816CeD16b00a9A Wrapptoken