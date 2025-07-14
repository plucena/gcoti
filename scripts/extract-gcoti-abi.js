const fs = require("fs");
const path = require("path");

/**
 * Simple ABI extractor that reads compiled artifacts directly
 */
async function extractABI() {
    console.log("🔗 Extracting gCOTI ABI from artifacts...");
    
    try {
        // Search for the gCOTI artifact in the artifacts directory
        const artifactsDir = path.join(__dirname, "../artifacts");
        
        const findArtifact = (dir) => {
            if (!fs.existsSync(dir)) return null;
            
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
        
        const artifactPath = findArtifact(artifactsDir);
        
        if (!artifactPath) {
            console.error("❌ gCOTI artifact not found. Please compile the contract first:");
            console.error("   npx hardhat compile");
            return;
        }
        
        console.log(`📁 Found artifact at: ${artifactPath}`);
        
        // Read the artifact
        const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
        
        // Extract ABI
        const abi = artifact.abi;
        
        console.log("\n📋 gCOTI CONTRACT ABI:");
        console.log("======================");
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
            const outputs = func.outputs && func.outputs.length > 0 
                ? func.outputs.map(output => output.type).join(', ') 
                : 'void';
            const mutability = func.stateMutability ? ` (${func.stateMutability})` : '';
            console.log(`${index + 1}. ${func.name}(${inputs}) -> ${outputs}${mutability}`);
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
        console.log(`Contract Name: ${artifact.contractName}`);
        console.log(`Source Name: ${artifact.sourceName}`);
        console.log(`Compiler Version: ${artifact.metadata ? JSON.parse(artifact.metadata).compiler.version : 'Unknown'}`);
        console.log(`Bytecode size: ${artifact.bytecode.length / 2 - 1} bytes`);
        console.log(`Deployed bytecode size: ${artifact.deployedBytecode.length / 2 - 1} bytes`);
        
        // Create a TypeScript interface for the ABI
        const tsInterfacePath = path.join(__dirname, "../abi/gCOTI-interface.ts");
        const tsInterface = generateTypeScriptInterface(abi);
        fs.writeFileSync(tsInterfacePath, tsInterface);
        console.log(`📝 TypeScript interface saved to: ${tsInterfacePath}`);
        
        // Create a JavaScript module export
        const jsExportPath = path.join(__dirname, "../abi/gCOTI-abi.js");
        const jsExport = `// gCOTI Contract ABI
module.exports = ${JSON.stringify(abi, null, 2)};
`;
        fs.writeFileSync(jsExportPath, jsExport);
        console.log(`📝 JavaScript module saved to: ${jsExportPath}`);
        
        console.log("\n✅ ABI extraction completed successfully!");
        
    } catch (error) {
        console.error("❌ ABI extraction failed:", error.message);
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
// This file is auto-generated - do not edit manually
import { ethers } from 'ethers';

export interface GCOTIContract extends ethers.Contract {
`;

    // Add function signatures
    functions.forEach(func => {
        const inputs = func.inputs.map(input => `${input.name}: ${solTypeToTsType(input.type)}`).join(', ');
        
        if (func.stateMutability === 'view' || func.stateMutability === 'pure') {
            const outputType = func.outputs && func.outputs.length > 0 
                ? func.outputs.length === 1 
                    ? solTypeToTsType(func.outputs[0].type)
                    : `[${func.outputs.map(output => solTypeToTsType(output.type)).join(', ')}]`
                : 'void';
            tsInterface += `  ${func.name}(${inputs}): Promise<${outputType}>;\n`;
        } else {
            tsInterface += `  ${func.name}(${inputs}): Promise<ethers.ContractTransactionResponse>;\n`;
        }
    });

    tsInterface += `}\n\n`;

    // Add event types
    if (events.length > 0) {
        tsInterface += `export interface GCOTIEvents {\n`;
        events.forEach(event => {
            const inputs = event.inputs.map(input => `${input.name}: ${solTypeToTsType(input.type)}`).join(', ');
            tsInterface += `  ${event.name}: { ${inputs} };\n`;
        });
        tsInterface += `}\n\n`;
    }

    // Add constructor parameters type
    const constructor = abi.find(item => item.type === 'constructor');
    if (constructor) {
        tsInterface += `export type GCOTIConstructorParams = {\n`;
        constructor.inputs.forEach(input => {
            tsInterface += `  ${input.name}: ${solTypeToTsType(input.type)};\n`;
        });
        tsInterface += `};\n\n`;
    }

    // Add ABI export
    tsInterface += `export const GCOTI_ABI = ${JSON.stringify(abi, null, 2)} as const;\n\n`;
    
    // Add contract deployment helper
    tsInterface += `export const GCOTI_BYTECODE = ""; // Add bytecode here if needed\n\n`;
    
    // Add deployment function type
    tsInterface += `export type DeployGCOTI = (
  signer: ethers.Signer,
  initialOwner: string,
  recipient: string,
  totalSupply: bigint
) => Promise<GCOTIContract>;\n`;

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

// Run the extraction
extractABI()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
