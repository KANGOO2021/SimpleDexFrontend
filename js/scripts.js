// Variables globales
let provider, signer, simpleDex, tokenA, tokenB;
const simpleDexAddress = "0x2fAf6934627092437d43a88Ed4A0169C3bc6De0D";  // Dirección de SimpleDEX
const tokenAAddress = "0x7AD191F6C5DbCC634D3b0c761d5BF9ae3599e8c8";  // Dirección de Token A
const tokenBAddress = "0xA9A79034d5a21f9d7a2E907D996EF6fD32a2fD74";  // Dirección de Token B

// Cargar los ABI de los contratos
let simpleDexABI, tokenA_ABI, tokenB_ABI;

async function loadABIs() {
    try {
        const responseTokenA = await fetch('./ABIs/tokenA_ABI.json');
        tokenA_ABI = await responseTokenA.json();

        const responseTokenB = await fetch('./ABIs/tokenB_ABI.json');
        tokenB_ABI = await responseTokenB.json();

        const responseSimpleDex = await fetch('./ABIs/');
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






// Obtener y mostrar las reservas de los tokens
/* async function getReserves() {
  try {
      // Usamos las funciones reserveA() y reserveB() según el ABI del contrato SimpleDEX
      const reserveA = await simpleDex.reserveA();
      const reserveB = await simpleDex.reserveB();

      // Convertir las reservas a formato legible (usando ethers.utils.formatUnits)
      document.getElementById("reserveA").textContent = `Reserva Token A: ${ethers.utils.formatUnits(reserveA, 18)}`;
      document.getElementById("reserveB").textContent = `Reserva Token B: ${ethers.utils.formatUnits(reserveB, 18)}`;
  } catch (error) {
      console.error("Error al obtener las reservas:", error);
      alert("Hubo un error al obtener las reservas.");
  }
} */

  // Función para obtener las reservas de ambos tokens
async function getReserves() {
    try {
        // Obtener ambas reservas (Token A y Token B)
        const reserveA = await simpleDex.reserveA();
        const reserveB = await simpleDex.reserveB();

        // Formatear las reservas a unidades legibles
        const formattedReserveA = ethers.utils.formatUnits(reserveA, 18);
        const formattedReserveB = ethers.utils.formatUnits(reserveB, 18);

        // Actualizar los valores de los inputs
        document.getElementById("reserveA").value = formattedReserveA;
        document.getElementById("reserveB").value = formattedReserveB;
    } catch (error) {
        console.error("Error al obtener las reservas:", error);
        alert("Hubo un error al obtener las reservas.");
    }
}

// Agregar el event listener a ambos botones para llamar a la misma función
document.getElementById("btnGetReserveA").addEventListener("click", getReserves);
document.getElementById("btnGetReserveB").addEventListener("click", getReserves);




// Función para agregar liquidez
async function addLiquidity() {
    const amountA = ethers.utils.parseUnits(document.getElementById("addLiquidityA").value, 18);
    const amountB = ethers.utils.parseUnits(document.getElementById("addLiquidityB").value, 18);

    try {
        // Verificar saldo de los tokens antes de proceder
        const balanceA = await tokenA.balanceOf(await signer.getAddress());
        const balanceB = await tokenB.balanceOf(await signer.getAddress());

        console.log("Saldo Token A:", balanceA.toString());
        console.log("Saldo Token B:", balanceB.toString());

        // Si no se tiene suficiente saldo de alguno de los tokens, alertar
        if (balanceA.lt(amountA)) {
            alert("Saldo insuficiente de Token A.");
            return;
        }
        if (balanceB.lt(amountB)) {
            alert("Saldo insuficiente de Token B.");
            return;
        }

        // Asegúrate de que los tokens están aprobados antes de añadir liquidez
        const allowanceA = await tokenA.allowance(await signer.getAddress(), simpleDexAddress);
        const allowanceB = await tokenB.allowance(await signer.getAddress(), simpleDexAddress);

        // Si no se ha aprobado suficiente, pedir aprobación
        if (allowanceA.lt(amountA)) {
            console.log("Aprobando Token A...");
            let txApproveA = await tokenA.approve(simpleDexAddress, amountA);
            await txApproveA.wait();  // Esperar a que la transacción de aprobación se confirme
        }

        if (allowanceB.lt(amountB)) {
            console.log("Aprobando Token B...");
            let txApproveB = await tokenB.approve(simpleDexAddress, amountB);
            await txApproveB.wait();  // Esperar a que la transacción de aprobación se confirme
        }

        // Ahora que los tokens están aprobados, agregamos liquidez
        console.log("Agregando liquidez...");
        const tx = await simpleDex.addLiquidity(amountA, amountB, {
            gasLimit: 8000000  // Asegúrate de tener suficiente gas
        });
        await tx.wait();
        alert("Liquidez agregada exitosamente");

        // Actualizar las reservas después de agregar liquidez
        await getReserves();
        
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

        // Actualizar las reservas después de retirar liquidez
        await getReserves();
    } catch (error) {
        console.error("Error al retirar liquidez:", error);
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

        // Actualizar las reservas después del intercambio
        await getReserves();
    } catch (error) {
        console.error("Error al intercambiar Token A por B:", error);
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

        // Actualizar las reservas después del intercambio
        await getReserves();
    } catch (error) {
        console.error("Error al intercambiar Token B por A:", error);
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
        console.error("Error al obtener el precio de Token A:", error);
        alert("Hubo un error al obtener el precio de Token A.");
    }
}

// Función para obtener el precio de Token B
async function getPriceB() {
    try {
        const priceB = await simpleDex.getPrice(tokenBAddress);
        document.getElementById("priceB").value = ethers.utils.formatUnits(priceB, 18);
    } catch (error) {
        console.error("Error al obtener el precio de Token B:", error);
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



