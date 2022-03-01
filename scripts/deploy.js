const { ethers } = require("hardhat")

const main = async() => {
    const ERC20TokenContract = await ethers.getContractFactory("ERC20Token")
    const ERCTokenDeploy = await ERC20TokenContract.deploy("KENYA", "KE")

    console.log(`CONTRACT ADDRESS: ${ERCTokenDeploy.address}`)
    await ERCTokenDeploy.deployed()
}
main()
.then(() => process.exit(0))
.catch(err => {
    console.error(err)
    process.exit(1)
})