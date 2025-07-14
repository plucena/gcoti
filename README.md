# gCOTI Contract Development

This project contains the gCOTI (COTI Treasury Governance Token) smart contract, a comprehensive ERC20 token with advanced features including capping, burning, pausing, and permit functionality.

## 🔧 Setup

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

```bash
npm install
```

### Environment Configuration

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```
2. Edit `.env` file with your configuration:

   ```env
   PRIVATE_KEY=your_private_key_here
   COTI_TESTNET_RPC_URL=https://testnet.coti.io/rpc
   COTI_MAINNET_RPC_URL=https://mainnet.coti.io/rpc
   ```

## 🏗️ Contract Overview


## 📋 ABI Extraction

### Extract gCOTI ABI

To extract the Application Binary Interface (ABI) from the compiled gCOTI contract:

```bash
npm run extract:gcoti
```

This command will:

1. **🔍 Search for the compiled contract** - Looks for the gCOTI.json artifact in the artifacts directory
2. **📋 Extract the ABI** - Pulls the ABI from the compiled artifact
3. **💾 Save ABI files** - Creates multiple output formats:

   - `abi/gCOTI-abi.json` - Pure JSON ABI
   - `abi/gCOTI-abi.js` - JavaScript module export
   - `abi/gCOTI-interface.ts` - TypeScript interface with type definitions
4. **📊 Display contract information**:

   - Contract functions with parameters and return types
   - Contract events
   - Constructor parameters
   - Contract metadata (compiler version, bytecode size)

### Prerequisites for ABI Extraction

Before running the extract command, make sure the contract is compiled:

```bash
npm run compile
# or
npx hardhat compile
```

### Example Output

When you run `npm run extract:gcoti`, you'll see output like:

```
🔗 Extracting gCOTI ABI from artifacts...
📁 Found artifact at: /path/to/artifacts/contracts/gCOTI.sol/gCOTI.json

📋 gCOTI CONTRACT ABI:
======================
[JSON ABI output...]

💾 ABI saved to: /path/to/abi/gCOTI-abi.json

🔧 CONTRACT FUNCTIONS:
====================
1. allowance(address owner, address spender) -> uint256 (view)
2. approve(address spender, uint256 amount) -> bool
3. balanceOf(address account) -> uint256 (view)
4. burn(uint256 amount) -> void
5. burnFrom(address account, uint256 amount) -> void
6. cap() -> uint256 (view)
7. decimals() -> uint8 (view)
8. mint(address to, uint256 amount) -> void
9. name() -> string (view)
10. owner() -> address (view)
11. pause() -> void
12. paused() -> bool (view)
13. symbol() -> string (view)
14. totalSupply() -> uint256 (view)
15. transfer(address to, uint256 amount) -> bool
16. transferFrom(address from, address to, uint256 amount) -> bool
17. unpause() -> void
... and more

📡 CONTRACT EVENTS:
==================
1. Approval(address indexed owner, address indexed spender, uint256 value)
2. Paused(address account)
3. Transfer(address indexed from, address indexed to, uint256 value)
4. Unpaused(address account)
... and more

🏗️ CONSTRUCTOR:
===============
constructor(address initialOwner, address recipient, uint256 totalSupply)

📊 CONTRACT DETAILS:
===================
Contract Name: gCOTI
Source Name: contracts/gCOTI.sol
Compiler Version: 0.8.19+commit.7dd6d404
Bytecode size: 2156 bytes
Deployed bytecode size: 1987 bytes

📝 TypeScript interface saved to: /path/to/abi/gCOTI-interface.ts
📝 JavaScript module saved to: /path/to/abi/gCOTI-abi.js

✅ ABI extraction completed successfully!
```

## 🚀 Available Scripts

```bash
# Compile contracts
npm run compile

# Extract gCOTI ABI (detailed analysis)
npm run extract:gcoti

# Deploy to local network
npm run deploy:gcoti

# Deploy to COTI testnet
npm run deploy:gcoti:testnet

# Run tests
npm test

# Generate coverage report
npm run coverage

# Gas usage report
npm run gas-report
```

## 📁 Generated Files

After running `npm run extract:gcoti`, you'll find these files in the `abi/` directory:

### `gCOTI-abi.json`

Pure JSON ABI for use with web3 libraries:

```json
[
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "initialOwner",
        "type": "address"
      },
      // ... more ABI entries
    ]
  }
]
```

### `gCOTI-abi.js`

JavaScript module export:

```javascript
// gCOTI Contract ABI
module.exports = [
  // ABI array
];
```

### `gCOTI-interface.ts`

TypeScript interface with full type definitions:

```typescript
export interface GCOTIContract extends ethers.Contract {
  allowance(owner: string, spender: string): Promise<bigint>;
  approve(spender: string, amount: bigint): Promise<ethers.ContractTransactionResponse>;
  // ... more function signatures
}

export const GCOTI_ABI = [...] as const;
```

## 🔗 Using the Generated ABI

### JavaScript/Node.js

```javascript
const { ethers } = require('ethers');
const gCOTI_ABI = require('./abi/gCOTI-abi.js');

const contract = new ethers.Contract(contractAddress, gCOTI_ABI, signer);
```

### TypeScript

```typescript
import { ethers } from 'ethers';
import { GCOTIContract, GCOTI_ABI } from './abi/gCOTI-interface';

const contract = new ethers.Contract(
  contractAddress, 
  GCOTI_ABI, 
  signer
) as GCOTIContract;
```

## 🛠️ Development Workflow

1. **Develop/Edit Contract**: Modify `contracts/gCOTI.sol`
2. **Compile**: `npm run compile`
3. **Extract ABI**: `npm run extract:gcoti`
4. **Test**: `npm test`
5. **Deploy**: `npm run deploy:gcoti:testnet`

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [COTI Documentation](https://docs.coti.io/)
- [Ethers.js Documentation](https://docs.ethers.io/)

## 🆘 Troubleshooting

### "gCOTI artifact not found" Error

Make sure to compile the contract first:

```bash
npm run compile
```

### Missing Dependencies

Reinstall dependencies:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Network Issues

Check your `.env` file configuration and network connectivity.
