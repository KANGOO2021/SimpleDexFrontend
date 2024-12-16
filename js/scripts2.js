// Variables globales
let provider, signer, simpleDex, tokenA, tokenB;
const simpleDexAddress = "0xf93133f2C93C584FE6D1e9574A2be22C266046fF";  // Dirección de SimpleDEX
const tokenAAddress = "0x06b4Bd486B5A0F9D69dD50c628480E2649D106A7";  // Dirección de Token A
const tokenBAddress = "0x3A83576aC540609466445972c8D5fe8990AFE464";  // Dirección de Token B

// Cargar los ABI de los contratos
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
        console.error("Error cargando los ABIs:", error);
    }
}

// Conectar la wallet
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

// Function to copy the address to clipboard
document.getElementById("copyButton").addEventListener("click", function() {
    const walletAddress = document.getElementById("walletAddress").value;

    // Check if the input is not empty
    if (walletAddress.trim() !== "") {
        navigator.clipboard.writeText(walletAddress).then(() => {
            const copyMessage = document.getElementById("copyMessage");
            copyMessage.style.display = "block";  // Show the copy message

            // Hide the message after 3 seconds
            setTimeout(() => {
                copyMessage.style.display = "none";
            }, 2000);
        }).catch(err => {
            console.error("Error copying: ", err);
        });
    }
});



// Función para obtener la reserva de Token A
async function getReserveA() {
    try {
        // Obtener la reserva de Token A
        const reserveA = await simpleDex.reserveA();

        // Formatear la reserva a unidades legibles
        const formattedReserveA = ethers.utils.formatUnits(reserveA, 18);

        // Actualizar el valor en el input correspondiente
        document.getElementById("reserveA").value = formattedReserveA;
    } catch (error) {
        alert("Hubo un error al obtener la reserva de Token A.");
    }
}

// Función para obtener la reserva de Token B
async function getReserveB() {
    try {
        // Obtener la reserva de Token B
        const reserveB = await simpleDex.reserveB();

        // Formatear la reserva a unidades legibles
        const formattedReserveB = ethers.utils.formatUnits(reserveB, 18);

        // Actualizar el valor en el input correspondiente
        document.getElementById("reserveB").value = formattedReserveB;
    } catch (error) {
        alert("Hubo un error al obtener la reserva de Token B.");
    }
}


// Función para agregar liquidez
async function addLiquidity() {
    const amountA = ethers.utils.parseUnits(document.getElementById("addLiquidityA").value, 18);
    const amountB = ethers.utils.parseUnits(document.getElementById("addLiquidityB").value, 18);

    try {
        // Validar que las aprobaciones sean suficientes
        const allowanceA = await tokenA.allowance(await signer.getAddress(), simpleDexAddress);
        const allowanceB = await tokenB.allowance(await signer.getAddress(), simpleDexAddress);

        // Si no se ha aprobado suficiente, alertar
        if (allowanceA.lt(amountA)) {
            alert("Por favor, aprueba más tokens de Token A.");
            return;
        }
        if (allowanceB.lt(amountB)) {
            alert("Por favor, aprueba más tokens de Token B.");
            return;
        }

        // Agregar liquidez usando los montos aprobados
        const tx = await simpleDex.addLiquidity(amountA, amountB, {
            gasLimit: 3000000  
        });
        await tx.wait();

        alert("Liquidez agregada exitosamente");

    } catch (error) {
        console.error("Error al agregar liquidez:", error);
        alert("Hubo un error al agregar liquidez.");
    }
}

// Función para retirar liquidez
async function removeLiquidity() {
    const amountA = ethers.utils.parseUnits(document.getElementById("removeLiquidityA").value, 18);
    const amountB = ethers.utils.parseUnits(document.getElementById("removeLiquidityB").value, 18);

    try {
        const tx = await simpleDex.removeLiquidity(amountA, amountB);
        await tx.wait();
        alert("Liquidez retirada exitosamente");


    } catch (error) {
        alert("Hubo un error al retirar liquidez.");
    }
}

// Función para intercambiar Token A por B
async function swapAforB() {
    const amountA = ethers.utils.parseUnits(document.getElementById("swapAforB").value, 18);

    try {
        const tx = await simpleDex.swapAforB(amountA);
        await tx.wait();
        alert("Intercambio realizado con éxito");
    } catch (error) {
        alert("Hubo un error al intercambiar Token A por B.");
    }
}

// Función para intercambiar Token B por A
async function swapBforA() {
    const amountB = ethers.utils.parseUnits(document.getElementById("swapBforA").value, 18);

    try {
        const tx = await simpleDex.swapBforA(amountB);
        await tx.wait();
        alert("Intercambio realizado con éxito");

    } catch (error) {
        alert("Hubo un error al intercambiar Token B por A.");
    }
}

// Función para aprobar Token A o B
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

    alert("Tokens aprobados exitosamente");
}

// Función para obtener el precio de Token A
async function getPriceA() {
    try {
        const priceA = await simpleDex.getPrice(tokenAAddress);
        document.getElementById("priceA").value = ethers.utils.formatUnits(priceA, 18);
    } catch (error) {
        alert("Hubo un error al obtener el precio de Token A.");
    }
}

// Función para obtener el precio de Token B
async function getPriceB() {
    try {
        const priceB = await simpleDex.getPrice(tokenBAddress);
        document.getElementById("priceB").value = ethers.utils.formatUnits(priceB, 18);
    } catch (error) {
        alert("Hubo un error al obtener el precio de Token B.");
    }
}

// Evento de conexión de wallet
document.getElementById("connectWallet").addEventListener("click", connectWallet);

// Evento para agregar liquidez
document.getElementById("btnAddLiquidity").addEventListener("click", addLiquidity);

// Evento para retirar liquidez
document.getElementById("btnRemoveLiquidity").addEventListener("click", removeLiquidity);

// Evento para intercambiar Token A por B
document.getElementById("btnSwapAforB").addEventListener("click", swapAforB);

// Evento para intercambiar Token B por A
document.getElementById("btnSwapBforA").addEventListener("click", swapBforA);

// Evento para aprobar tokens
document.getElementById("btnApproveTokens").addEventListener("click", approveTokens);

// Evento para obtener el precio de Token A y B
document.getElementById("btnGetPriceA").addEventListener("click", getPriceA);
document.getElementById("btnGetPriceB").addEventListener("click", getPriceB);


// Asignar las funciones específicas a cada botón
document.getElementById("btnGetReserveA").addEventListener("click", getReserveA);
document.getElementById("btnGetReserveB").addEventListener("click", getReserveB);



