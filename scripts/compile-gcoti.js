const { ethers } = require("hardhat");
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Hardhat script to compile gCOTI.sol and extract its ABI
 * This script will:
 * 1. Compile the gCOTI contract
 * 2. Extract and display the ABI
 * 3. Save the ABI to a JSON file
 * 4. Display contract information
 */
async function main() {
    console.log("🔗 Compiling gCOTI contract...");
    
    try {
        // Force compilation first
        await hre.run("compile");
        
        // Now try to get the contract factory
        let gCOTIFactory;
        try {
            gCOTIFactory = await ethers.getContractFactory("gCOTI");
            console.log("✅ Contract compiled successfully!");
        } catch (error) {
            console.log("⚠️  Contract factory creation failed, but continuing with artifact extraction...");
            console.log("Error:", error.message);
        }
        
        console.log("📄 Contract Name: gCOTI");
        console.log("🏷️  Token Name: COTI Treasury Governance Token");
        console.log("🎯 Token Symbol: gCOTI");
        
        // Try multiple artifact paths
        const possibleArtifactPaths = [
            path.join(__dirname, "../artifacts/contracts/gCOTI.sol/gCOTI.json"),
            path.join(__dirname, "../artifacts/contracts/gCOTI.SOL/gCOTI.json"),
            path.join(__dirname, "../artifacts/contracts/gCOTI.sol/gCOTI.sol/gCOTI.json")
        ];
        
        let artifactPath = null;
        for (const testPath of possibleArtifactPaths) {
            if (fs.existsSync(testPath)) {
                artifactPath = testPath;
                break;
            }
        }
        
        if (!artifactPath) {
            console.log("🔍 Searching for gCOTI artifact...");
            // Search for any gCOTI artifact
            const artifactsDir = path.join(__dirname, "../artifacts");
            const findArtifact = (dir) => {
                const files = fs.readdirSync(dir);
                for (const file of files) {
                    const filePath = path.join(dir, file);
                    if (fs.statSync(filePath).isDirectory()) {
                        const result = findArtifact(filePath);
                        if (result) return result;
                    } else if (file === "gCOTI.json") {
                        return filePath;
                    }
                }
                return null;
            };
            artifactPath = findArtifact(artifactsDir);
        }
        
        if (fs.existsSync(artifactPath)) {
            const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
            
            // Extract ABI
            const abi = artifact.abi;
            
            console.log("\n📋 CONTRACT ABI:");
            console.log("================");
            console.log(JSON.stringify(abi, null, 2));
            
            // Save ABI to a separate file
            const abiOutputPath = path.join(__dirname, "../abi/gCOTI-abi.json");
            
            // Create abi directory if it doesn't exist
            const abiDir = path.dirname(abiOutputPath);
            if (!fs.existsSync(abiDir)) {
                fs.mkdirSync(abiDir, { recursive: true });
            }
            
            fs.writeFileSync(abiOutputPath, JSON.stringify(abi, null, 2));
            console.log(`\n💾 ABI saved to: ${abiOutputPath}`);
            
            // Display contract functions
            console.log("\n🔧 CONTRACT FUNCTIONS:");
            console.log("====================");
            
            const functions = abi.filter(item => item.type === 'function');
            functions.forEach((func, index) => {
                const inputs = func.inputs.map(input => `${input.type} ${input.name}`).join(', ');
                const outputs = func.outputs ? func.outputs.map(output => output.type).join(', ') : 'void';
                console.log(`${index + 1}. ${func.name}(${inputs}) -> ${outputs}`);
            });
            
            // Display contract events
            console.log("\n📡 CONTRACT EVENTS:");
            console.log("==================");
            
            const events = abi.filter(item => item.type === 'event');
            events.forEach((event, index) => {
                const inputs = event.inputs.map(input => `${input.type} ${input.name}`).join(', ');
                console.log(`${index + 1}. ${event.name}(${inputs})`);
            });
            
            // Display constructor
            console.log("\n🏗️  CONSTRUCTOR:");
            console.log("===============");
            
            const constructor = abi.find(item => item.type === 'constructor');
            if (constructor) {
                const inputs = constructor.inputs.map(input => `${input.type} ${input.name}`).join(', ');
                console.log(`constructor(${inputs})`);
            }
            
            // Display contract bytecode size
            console.log("\n📊 CONTRACT DETAILS:");
            console.log("===================");
            console.log(`Bytecode size: ${artifact.bytecode.length / 2 - 1} bytes`);
            console.log(`Deployed bytecode size: ${artifact.deployedBytecode.length / 2 - 1} bytes`);
            
            // Create a TypeScript interface for the ABI
            const tsInterfacePath = path.join(__dirname, "../abi/gCOTI-interface.ts");
            const tsInterface = generateTypeScriptInterface(abi);
            fs.writeFileSync(tsInterfacePath, tsInterface);
            console.log(`📝 TypeScript interface saved to: ${tsInterfacePath}`);
            
        } else {
            console.error("❌ Artifact file not found. Make sure the contract compiled successfully.");
        }
        
    } catch (error) {
        console.error("❌ Compilation failed:", error.message);
        if (error.stack) {
            console.error("Stack trace:", error.stack);
        }
        process.exit(1);
    }
}

/**
 * Generate TypeScript interface for the contract ABI
 */
function generateTypeScriptInterface(abi) {
    const functions = abi.filter(item => item.type === 'function');
    const events = abi.filter(item => item.type === 'event');
    
    let tsInterface = `// Generated TypeScript interface for gCOTI contract
import { ethers } from 'ethers';

export interface GCOTIContract extends ethers.Contract {
`;

    // Add function signatures
    functions.forEach(func => {
        const inputs = func.inputs.map(input => `${input.name}: ${solTypeToTsType(input.type)}`).join(', ');
        const outputs = func.outputs && func.outputs.length > 0 
            ? func.outputs.map(output => solTypeToTsType(output.type)).join(' | ')
            : 'Promise<void>';
        
        const returnType = func.stateMutability === 'view' || func.stateMutability === 'pure' 
            ? `Promise<${outputs}>` 
            : 'Promise<ethers.TransactionResponse>';
        
        tsInterface += `  ${func.name}(${inputs}): ${returnType};\n`;
    });

    tsInterface += `}\n\n`;

    // Add event types
    if (events.length > 0) {
        tsInterface += `export interface GCOTIEvents {\n`;
        events.forEach(event => {
            const inputs = event.inputs.map(input => `${input.name}: ${solTypeToTsType(input.type)}`).join(', ');
            tsInterface += `  ${event.name}: (${inputs}) => void;\n`;
        });
        tsInterface += `}\n\n`;
    }

    // Add ABI export
    tsInterface += `export const GCOTI_ABI = ${JSON.stringify(abi, null, 2)} as const;\n`;

    return tsInterface;
}

/**
 * Convert Solidity types to TypeScript types
 */
function solTypeToTsType(solType) {
    if (solType.includes('uint') || solType.includes('int')) {
        return 'bigint';
    }
    if (solType === 'bool') {
        return 'boolean';
    }
    if (solType === 'address') {
        return 'string';
    }
    if (solType === 'string') {
        return 'string';
    }
    if (solType === 'bytes' || solType.includes('bytes')) {
        return 'string';
    }
    if (solType.includes('[]')) {
        const baseType = solType.replace('[]', '');
        return `${solTypeToTsType(baseType)}[]`;
    }
    return 'any';
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
