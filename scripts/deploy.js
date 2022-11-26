const { ethers } = require("hardhat");

async function main() {
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

  const Swapper = await ethers.getContractFactory("Swapper");
  const swapper = await Swapper.deploy();
  await swapper.deployed();

  console.log(
    `Swapper deployed to ${swapper.address}`
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
// 0xb69660F4201F7bb18552A745E0fc00BE8075BE2d Wrapptoken