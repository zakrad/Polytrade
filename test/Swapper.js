const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
require("@nomiclabs/hardhat-ethers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const fs = require("fs")
const path = require("path")

describe("Swapper", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployAll() {
    const [deployer, account2] = await ethers.getSigners();
    const Deployer = deployer.address;
    const PolToken = await ethers.getContractFactory("PolyToken");
    const poltoken = await PolToken.deploy();
    await poltoken.deployed();

    const PLTAddress = poltoken.address;

    const TradeToken = await ethers.getContractFactory("TradeToken");
    const tradetoken = await TradeToken.deploy();
    await tradetoken.deployed();

    const TLTAddress = tradetoken.address;

    const Swapper = await ethers.getContractFactory("Swapper");
    const swapper = await Swapper.deploy();
    await swapper.deployed();

    const swapperAddress = swapper.address;

    const dir = path.resolve(
      __dirname,
      "../artifacts/contracts/Swapper.sol/Swapper.json"
    )
    const file = fs.readFileSync(dir, "utf8")
    const json = JSON.parse(file)
    const swapperAbi = json.abi;

    return { PLTAddress, TLTAddress, swapperAddress, Deployer, swapperAbi, tradetoken, poltoken, swapper, account2 };
  }

  describe("Swapper: Swapp", function () {
    it("Swapped 100 PLT token for WRP token (1:1)", async function () {
      const { Deployer, swapper, PLTAddress, poltoken, swapperAddress } = await loadFixture(deployAll);
      const buyAmount = await ethers.utils.parseEther("100.0");
      await poltoken.approve(swapperAddress, buyAmount);
      await swapper.swap(PLTAddress, buyAmount);
      const newBalance = await swapper.balanceOf(Deployer);
      const swapperBalance = await poltoken.balanceOf(swapperAddress);
      expect(newBalance).to.equal(buyAmount);
      expect(swapperBalance).to.equal(buyAmount);
    });
    it("Admin (Deployer) setPrice to 2", async function () {
      const { swapper } = await loadFixture(deployAll);
      await swapper.setPrice(2);
      const price = await swapper.getPrice();
      expect(price).to.equal(2);
    });

   it("Swapp 100 TLT token for 50 WRP token (2:1)", async function () {
    const { Deployer, swapper, TLTAddress, tradetoken, swapperAddress } = await loadFixture(deployAll);
    const buyAmount = await ethers.utils.parseEther("100.0");
    const expectAmount = await ethers.utils.parseEther("50.0");
    await swapper.setPrice(2);
    await tradetoken.approve(swapperAddress, buyAmount);
    await swapper.swap(TLTAddress, buyAmount);
    const newBalance = await swapper.balanceOf(Deployer);
    const swapperBalance = await tradetoken.balanceOf(swapperAddress);
    expect(newBalance).to.equal(expectAmount);
    expect(swapperBalance).to.equal(buyAmount);
 });

 it("Unswap 100 WRP token for 100 PLT token (1:1)", async function () {
  const { Deployer, swapper, PLTAddress, poltoken, swapperAddress } = await loadFixture(deployAll);
  const buyAmount = await ethers.utils.parseEther("100.0");
  await poltoken.approve(swapperAddress, buyAmount);
  const beforeBalance = await swapper.balanceOf(Deployer);
  const beforePLTBalance = await poltoken.balanceOf(Deployer);
  const beforeSwapperBalance = await poltoken.balanceOf(swapperAddress);
  await swapper.swap(PLTAddress, buyAmount);
  await swapper.unswap(PLTAddress, buyAmount);
  const newBalance = await swapper.balanceOf(Deployer);
  const newPLTBalance = await poltoken.balanceOf(Deployer);
  const newSwapperBalance = await poltoken.balanceOf(swapperAddress);
  expect(beforeBalance).to.equal(newBalance);
  expect(beforePLTBalance).to.equal(newPLTBalance);
  expect(beforeSwapperBalance).to.equal(newSwapperBalance);
});

 it("Only Admin (Deployer) can set price", async function () {
  const { swapper, account2 } = await loadFixture(deployAll);

  expect(swapper.connect(account2).setPrice(2)).to.be.revertedWith("Ownable: caller is not the owner");
});

});
});