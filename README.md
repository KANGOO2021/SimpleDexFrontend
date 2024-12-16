# Frontend for Interacting with Smart Contracts

This frontend allows interaction with a decentralized exchange (SimpleDEX) to manage liquidity and swap tokens between Token A and Token B on the Sepolia test network. It includes wallet connection, token approval, liquidity management, token swapping, and price/reserve queries.

## Workflow of Actions

Follow this step-by-step order of actions to interact with the SimpleDEX contract:

### 1. **Connect Your Wallet**
   - The first step is to connect your Ethereum wallet (e.g., MetaMask) to the frontend. 
   - Click on the **"Connect Wallet"** button to initiate the wallet connection.
   - The wallet will request the connection and once confirmed, your wallet address will be displayed.

### 2. **Approve Tokens**
   - After connecting the wallet, you must approve the SimpleDEX contract to access your tokens (Token A and Token B).
   - Enter the amount of Token A and Token B you want to approve.
   - Click **"Approve Tokens"** for each token. 
   - Please note that token approval may take some time due to network latency, as it depends on the Sepolia network's transaction speed.
   - You will receive an approval confirmation once the transaction is mined.

### 3. **Add Liquidity**
   - After approving the tokens, you can add liquidity to the SimpleDEX contract.
   - Enter the amount of Token A and Token B you wish to add. The amount must be equal to or less than the approved amount.
   - Click **"Add Liquidity"** to add your tokens to the liquidity pool. 
   - The contract will update the liquidity reserves, and you will receive a confirmation once the transaction is completed.

### 4. **Swap Tokens**
   - You can swap Token A for Token B or Token B for Token A.
   - Enter the amount of Token A or Token B you wish to swap and click the corresponding swap button (**"Swap A for B"** or **"Swap B for A"**).
   - The swap will occur after the transaction is mined, and you will receive a confirmation once it's completed.

### 5. **Remove Liquidity**
   - If you want to withdraw liquidity from the SimpleDEX contract, you can do so by entering the amount of Token A and Token B to remove.
   - Click **"Remove Liquidity"** to withdraw your tokens from the liquidity pool.
   - This will decrease the reserves and reflect the updated liquidity in the contract.

### 6. **Check Token Prices and Reserves**
   - You can check the current price of Token A and Token B by clicking the **"Get Price"** buttons for each token.
   - You can also check the current reserves of Token A and Token B in the SimpleDEX contract by clicking the **"Get Reserve"** buttons.
   - The reserves and prices will be updated to reflect the current state of the liquidity pool.

## Important Notes

- **Network Delays**: Since token approval and transactions depend on the Sepolia network, actions such as approvals and liquidity additions may take some time due to network congestion or delays in transaction mining.
  
- **Removing Liquidity**: The reserves of Token A and Token B accumulate with each transaction. If you want to reset the reserves for testing purposes or to perform new actions, you can use the **"Remove Liquidity"** action to withdraw tokens and reset the reserves to zero.

- **Token Approval**: Always ensure that you approve the correct amount of tokens before adding liquidity or swapping them. Without proper approval, the contract will not be able to interact with your tokens.

## Prerequisites

- MetaMask or any Ethereum-compatible wallet.
- Knowledge of how Ethereum transactions and decentralized exchanges (DEX) work.
- The Sepolia test network must be selected in your wallet for this demo.

## Installation

1. Clone this repository to your local machine:
   ```bash
   git clone https://github.com/your-repository/frontend-smart-contracts.git
   ```

2. Navigate to the project folder:
   ```bash
   cd frontend-smart-contracts
   ```

3. Open the `index.html` file in your browser, or host it locally using a web server (e.g., using `http-server` or a similar tool).

## Files Structure

- `index.html`: The main HTML file that loads the user interface.
- `css/`: Folder containing the CSS file for styling the frontend.
- `js/`: Folder containing the JavaScript file containing the logic for interacting with Ethereum smart contracts.
- `assets/`: Folder containing the images files for the frontend.
- `ABIs/`: Folder containing the ABI files for Token A, Token B, and SimpleDEX contracts.

## JavaScript Logic

The logic is implemented in `scripts.js` using the following features:

1. **Connecting the Wallet**: 
   - The `connectWallet()` function uses `ethers.js` to connect MetaMask, fetch the user's account address, and initialize the contract instances.
   
2. **Token Approvals**:
   - The `approveTokens()` function allows the user to approve Token A and Token B for interaction with the SimpleDEX contract.

3. **Adding and Removing Liquidity**:
   - The `addLiquidity()` function lets users deposit tokens into the SimpleDEX contract.
   - The `removeLiquidity()` function allows users to withdraw liquidity from the SimpleDEX.

4. **Token Swaps**:
   - The `swapAforB()` function swaps Token A for Token B in the SimpleDEX.
   - The `swapBforA()` function swaps Token B for Token A in the SimpleDEX.

5. **Price and Reserve Queries**:
   - The `getPriceA()` and `getPriceB()` functions fetch the current prices of Token A and Token B.
   - The `getReserveA()` and `getReserveB()` functions fetch the current reserves of Token A and Token B in the SimpleDEX contract.

## Running the Frontend

1. Ensure you have MetaMask installed and connected to the Sepolia test network.
2. Open the `index.html` file in your browser or serve it using a local web server.
3. Follow the step-by-step actions as outlined in the workflow section to interact with the SimpleDEX contract.


