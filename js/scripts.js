// Global variables
let provider, signer, simpleDex, tokenA, tokenB;
const simpleDexAddress = "0x814F4110e626F555E4632a1C030e506c53641afE";  // SimpleDEX address
const tokenAAddress = "0xF6E5F9F5475231B432F3063274CFB7Ad1A082a3e";  // Token A address
const tokenBAddress = "0x92db406E362dB206c6e5A0D25460d898DAf6cdaa";  // Token B address

// Load the contracts' ABIs
let simpleDexABI, tokenA_ABI, tokenB_ABI;

async function loadABIs() {
    try {
        const responseTokenA = await fetch('./ABIs/tokenA_ABI.json');
        tokenA_ABI = await responseTokenA.json();

        const responseTokenB = await fetch('./ABIs/tokenB_ABI.json');
        tokenB_ABI = await responseTokenB.json();

        const responseSimpleDex = await fetch('./ABIs/simpleDexABI.json');
        simpleDexABI = await responseSimpleDex.json();

    } catch (error) {
        console.error("Error loading ABIs:", error);
    }
}

// Connect wallet
async function connectWallet() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);  // Request MetaMask accounts
        signer = provider.getSigner();
        
        // Get the wallet address and set it in the input
        const walletAddress = await signer.getAddress();
        document.getElementById("walletAddress").value = walletAddress;

        // Initialize contracts after loading ABIs
        await loadABIs();

        simpleDex = new ethers.Contract(simpleDexAddress, simpleDexABI, signer);
        tokenA = new ethers.Contract(tokenAAddress, tokenA_ABI, signer);
        tokenB = new ethers.Contract(tokenBAddress, tokenB_ABI, signer);
    } else {
        alert("MetaMask is not available");
    }
}

// Function to copy address to clipboard
document.getElementById("copyButton").addEventListener("click", function() {
    const walletAddress = document.getElementById("walletAddress").value;

    // Check if input is not empty
    if (walletAddress.trim() !== "") {
        navigator.clipboard.writeText(walletAddress).then(() => {
            const copyMessage = document.getElementById("copyMessage");
            copyMessage.style.display = "block";  // Show copy message

            // Hide message after 3 seconds
            setTimeout(() => {
                copyMessage.style.display = "none";
            }, 2000);
        }).catch(err => {
            console.error("Error copying: ", err);
        });
    }
});

// Function to get Token A reserve
async function getReserveA() {
    try {
        // Get Token A reserve
        const reserveA = await simpleDex.reserveA();

        // Format reserve to readable units
        const formattedReserveA = ethers.utils.formatUnits(reserveA, 18);

        // Update value in corresponding input
        document.getElementById("reserveA").value = formattedReserveA;
    } catch (error) {
        alert("Error getting Token A reserve.");
    }
}

// Function to get Token B reserve
async function getReserveB() {
    try {
        // Get Token B reserve
        const reserveB = await simpleDex.reserveB();

        // Format reserve to readable units
        const formattedReserveB = ethers.utils.formatUnits(reserveB, 18);

        // Update value in corresponding input
        document.getElementById("reserveB").value = formattedReserveB;
    } catch (error) {
        alert("Error getting Token B reserve.");
    }
}

// Function to add liquidity
async function addLiquidity() {
    const amountA = ethers.utils.parseUnits(document.getElementById("addLiquidityA").value, 18);
    const amountB = ethers.utils.parseUnits(document.getElementById("addLiquidityB").value, 18);

    try {
        // Validate if approvals are sufficient
        const allowanceA = await tokenA.allowance(await signer.getAddress(), simpleDexAddress);
        const allowanceB = await tokenB.allowance(await signer.getAddress(), simpleDexAddress);

        // If not enough approved, alert
        if (allowanceA.lt(amountA)) {
            alert("Please approve more Token A.");
            return;
        }
        if (allowanceB.lt(amountB)) {
            alert("Please approve more Token B.");
            return;
        }

        // Add liquidity using approved amounts
        const tx = await simpleDex.addLiquidity(amountA, amountB, {
            gasLimit: 3000000  
        });
        await tx.wait();

        alert("Liquidity added successfully");

    } catch (error) {
        console.error("Error adding liquidity:", error);
        alert("Error adding liquidity.");
    }
}

// Function to remove liquidity
async function removeLiquidity() {
    const amountA = ethers.utils.parseUnits(document.getElementById("removeLiquidityA").value, 18);
    const amountB = ethers.utils.parseUnits(document.getElementById("removeLiquidityB").value, 18);

    try {
        const tx = await simpleDex.removeLiquidity(amountA, amountB);
        await tx.wait();
        alert("Liquidity removed successfully");
    } catch (error) {
        alert("Error removing liquidity.");
    }
}

// Function to swap Token A for B
async function swapAforB() {
    const amountA = ethers.utils.parseUnits(document.getElementById("swapAforB").value, 18);

    try {
        const tx = await simpleDex.swapAforB(amountA);
        await tx.wait();
        alert("Swap successful");
    } catch (error) {
        alert("Error swapping Token A for B.");
    }
}

// Function to swap Token B for A
async function swapBforA() {
    const amountB = ethers.utils.parseUnits(document.getElementById("swapBforA").value, 18);

    try {
        const tx = await simpleDex.swapBforA(amountB);
        await tx.wait();
        alert("Swap successful");

    } catch (error) {
        alert("Error swapping Token B for A.");
    }
}

// Function to approve Token A or B
async function approveTokens() {
    const amountA = ethers.utils.parseUnits(document.getElementById("approveTokenA").value, 18);
    const amountB = ethers.utils.parseUnits(document.getElementById("approveTokenB").value, 18);

    let tx;
    if (amountA.gt(0)) {
        tx = await tokenA.approve(simpleDexAddress, amountA);
        await tx.wait();
    }

    if (amountB.gt(0)) {
        tx = await tokenB.approve(simpleDexAddress, amountB);
        await tx.wait();
    }

    alert("Tokens approved successfully");
}

// Function to get Token A price
async function getPriceA() {
    try {
        const priceA = await simpleDex.getPrice(tokenAAddress);
        document.getElementById("priceA").value = ethers.utils.formatUnits(priceA, 18);
    } catch (error) {
        alert("Error getting Token A price.");
    }
}

// Function to get Token B price
async function getPriceB() {
    try {
        const priceB = await simpleDex.getPrice(tokenBAddress);
        document.getElementById("priceB").value = ethers.utils.formatUnits(priceB, 18);
    } catch (error) {
        alert("Error getting Token B price.");
    }
}

// Wallet connection event
document.getElementById("connectWallet").addEventListener("click", connectWallet);

// Add liquidity event
document.getElementById("btnAddLiquidity").addEventListener("click", addLiquidity);

// Remove liquidity event
document.getElementById("btnRemoveLiquidity").addEventListener("click", removeLiquidity);

// Swap Token A for B event
document.getElementById("btnSwapAforB").addEventListener("click", swapAforB);

// Swap Token B for A event
document.getElementById("btnSwapBforA").addEventListener("click", swapBforA);

// Approve tokens event
document.getElementById("btnApproveTokens").addEventListener("click", approveTokens);

// Get Token A and B price event
document.getElementById("btnGetPriceA").addEventListener("click", getPriceA);
document.getElementById("btnGetPriceB").addEventListener("click", getPriceB);

// Assign specific functions to each button
document.getElementById("btnGetReserveA").addEventListener("click", getReserveA);
document.getElementById("btnGetReserveB").addEventListener("click", getReserveB);




