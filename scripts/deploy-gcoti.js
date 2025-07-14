const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Example deployment script for gCOTI contract
 * This demonstrates how to deploy the contract using the extracted ABI
 */
async function main() {
    console.log("🚀 Deploying gCOTI contract...");
    
    // Get the signers
    const [deployer] = await ethers.getSigners();
    console.log("🔑 Deploying with account:", deployer.address);
    
    // Check deployer balance
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
    
    // Contract deployment parameters
    const initialOwner = deployer.address; // The deployer will be the initial owner
    const recipient = deployer.address;    // The deployer will receive the initial supply
    const totalSupply = ethers.parseEther("1000000"); // 1 million tokens
    
    console.log("\n📋 Deployment Parameters:");
    console.log("Initial Owner:", initialOwner);
    console.log("Recipient:", recipient);
    console.log("Total Supply:", ethers.formatEther(totalSupply), "gCOTI");
    
    // Deploy the contract
    const gCOTIFactory = await ethers.getContractFactory("gCOTI");
    
    console.log("\n🔗 Deploying contract...");
    const gCOTI = await gCOTIFactory.deploy(initialOwner, recipient, totalSupply);
    
    console.log("⏳ Waiting for deployment confirmation...");
    await gCOTI.waitForDeployment();
    
    const contractAddress = await gCOTI.getAddress();
    console.log("✅ gCOTI contract deployed to:", contractAddress);
    
    // Verify the deployment
    console.log("\n🔍 Verifying deployment...");
    const name = await gCOTI.name();
    const symbol = await gCOTI.symbol();
    const decimals = await gCOTI.decimals();
    const cap = await gCOTI.cap();
    const totalSupplyOnChain = await gCOTI.totalSupply();
    const ownerAddress = await gCOTI.owner();
    const recipientBalance = await gCOTI.balanceOf(recipient);
    
    console.log("Token Name:", name);
    console.log("Token Symbol:", symbol);
    console.log("Decimals:", decimals.toString());
    console.log("Cap:", ethers.formatEther(cap), "gCOTI");
    console.log("Total Supply:", ethers.formatEther(totalSupplyOnChain), "gCOTI");
    console.log("Owner:", ownerAddress);
    console.log("Recipient Balance:", ethers.formatEther(recipientBalance), "gCOTI");
    
    // Save deployment info
    const deploymentInfo = {
        contractAddress,
        deployerAddress: deployer.address,
        initialOwner,
        recipient,
        totalSupply: totalSupply.toString(),
        name,
        symbol,
        decimals: decimals.toString(),
        deploymentTime: new Date().toISOString(),
        networkName: (await ethers.provider.getNetwork()).name,
        chainId: (await ethers.provider.getNetwork()).chainId.toString()
    };
    
    const deploymentPath = path.join(__dirname, "../deployments/gCOTI-deployment.json");
    
    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.dirname(deploymentPath);
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to:", deploymentPath);
    
    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Verify the contract on the block explorer");
    console.log("2. Test the contract functions");
    console.log("3. Set up any additional permissions or configurations");
    
    return {
        contract: gCOTI,
        address: contractAddress,
        deploymentInfo
    };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
