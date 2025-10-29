// Archivo: public/app.js

// --- CONFIGURACIÓN E INICIALIZACIÓN ---
const API_KEY = "TU_CLAVE_API_DE_GOOGLE_MAPS";
const SOROBAN_CONTRACT_ID = "CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"; // ID de tu Contrato SUSC desplegado
const RPC_URL = "https://soroban-testnet.stellar.org:443"; // Ejemplo de Testnet

// Variables de Estado
let map;
let marker;
let watchId = null;
let userAccount = null;
let sorobanClient = null; // En una DApp real, usarías @stellar/stellar-sdk y bibliotecas Soroban

// Estado de la Aplicación (Mantenemos la simulación para datos no-blockchain)
let userState = {
    connected: false,
    balance: 0,
    experiences: 0,
    nfts: 0
};

// --- WEB3 / WALLET CONNECTION (Simulando Soroban/Freighter) ---

async function connectWallet() {
    // 1. Inicializar la Conexión a Freighter Wallet
    // Usarías el Stellar SDK y la biblioteca de conexión a wallets (ej. @stellar/wallets-kit)
    
    if (window.freighter) {
        try {
            const publicKey = await window.freighter.getPublicKey();
            userAccount = publicKey;
            userState.connected = true;

            walletInfo.textContent = `Conectado: ${userAccount.substring(0, 7)}...`;
            connectWalletBtn.textContent = 'Desconectar';
            
            // 2. Inicializar cliente Soroban (simulación)
            // sorobanClient = new SorobanClient(RPC_URL, SOROBAN_CONTRACT_ID); 

            await fetchUserBalance();
            updateUI();
            alert('Wallet conectada (Freighter).');
            return;
        } catch (error) {
            console.error("Error al conectar Freighter:", error);
            alert("Fallo la conexión con la wallet. Asegúrate de que Freighter esté instalado.");
        }
    } else {
        alert("Instala Freighter Wallet para continuar.");
    }
}

async function fetchUserBalance() {
    if (!userState.connected) return;

    // Llama a la función 'balance' del Contrato Soroban
    // userState.balance = await sorobanClient.invoke('balance', [userAccount]);
    
    // SIMULACIÓN DE BALANCE DE PRUEBA
    userState.balance = 150; 
    userState.experiences = 3;
    userState.nfts = 1;
}

// --- GOOGLE MAPS INTEGRATION ---

// Necesitas un div en tu HTML: <div id="mapContainer" style="height: 400px; width: 100%;"></div>

function initMap() {
    const defaultLocation = { lat: 19.4326, lng: -99.1332 }; // CDMX
    
    map = new google.maps.Map(document.getElementById('mapContainer'), {
        center: defaultLocation,
        zoom: 10
    });
    
    // Opcional: Centrar en la ubicación actual del usuario al cargar
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            map.setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        });
    }
}

// Iniciar el rastreo de la ubicación para la experiencia
function startTripTracking(expId, destination) {
    if (!userState.connected) {
        alert('Conecta tu wallet primero.');
        return;
    }
    
    // Función de distancia simple (aproximación)
    const calculateDistance = (p1, p2) => {
        const R = 6371e3; // Radio de la Tierra en metros
        const lat1 = p1.lat * Math.PI / 180;
        const lat2 = p2.lat * Math.PI / 180;
        const dLat = (p2.lat - p1.lat) * Math.PI / 180;
        const dLon = (p2.lng - p1.lng) * Math.PI / 180;

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distancia en metros
    };
    
    const destinationCoords = { lat: parseFloat(destination.lat), lng: parseFloat(destination.lng) };

    watchId = navigator.geolocation.watchPosition(
        (position) => {
            const currentPos = { lat: position.coords.latitude, lng: position.coords.longitude };
            
            if (!marker) {
                marker = new google.maps.Marker({ position: currentPos, map: map, title: "Tu Ubicación" });
            } else {
                marker.setPosition(currentPos);
            }
            map.setCenter(currentPos);
            
            const distance = calculateDistance(currentPos, destinationCoords);

            if (distance < 100) { // Si el usuario está a 100 metros o menos
                // LÓGICA CLAVE: COMPLETAR EXPERIENCIA Y ACUÑAR TOKEN
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
                
                // NOTA: En una DApp robusta, enviarías la RUTA COMPLETA a tu Oráculo (backend)
                // para que lo valide y luego LLAME a issue_reward() en el Contrato.
                
                // Aquí simulamos la llamada exitosa al Oráculo/Contrato.
                alert(`¡Verificación exitosa! Estás en ${destination.name}. Tokens SUSC acuñados.`);
                
                // Simulación de acuñación (reemplazar con llamada al contrato real)
                const experience = sustainableExperiences.find(exp => exp.id === expId);
                userState.balance += experience.tokensEarned;
                userState.experiences += 1;
                updateUI();
            }
        },
        (error) => { console.error('Error de Geolocalización:', error); },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    alert('Rastreo de experiencia iniciado. ¡Muévete hacia tu destino!');
}

// --- LÓGICA DE CANJE Y DONACIÓN ---

async function mintNFT(nftType) {
    if (!userState.connected) {
        alert('Conecta tu wallet.');
        return;
    }
    
    // ... lógica para verificar requisitos ...
    
    if (userState.balance >= requiredSUSC) {
        // Enviar transacción de QUEMADO a Soroban
        // const txHash = await sorobanClient.invoke('burn_for_ticket', [userAccount, requiredSUSC, nftType]);
        
        // Simulación:
        userState.balance -= requiredSUSC;
        userState.nfts += 1;
        updateUI();
        alert(`¡Felicidades! Has obtenido el NFT "${nftName}".`);
    } else {
        alert(`No tienes suficientes SUSC.`);
    }
}

async function redeemTicket(ticketType, amount) {
    if (!userState.connected) return;
    
    // Enviar transacción de QUEMADO a Soroban
    // const txHash = await sorobanClient.invoke('burn_for_ticket', [userAccount, amount, ticketType]);
    
    // Simulación:
    userState.balance -= amount;
    updateUI();
    alert(`Canje por entrada ${ticketType} realizado. El código de canje se enviará a tu wallet.`);
}

async function donateToFoundation(foundationKey, amount) {
    if (!userState.connected) return;
    
    // Enviar transacción de TRANSFERENCIA a Soroban
    // const txHash = await sorobanClient.invoke('donate', [userAccount, amount, foundationKey]);

    // Simulación:
    userState.balance -= amount;
    updateUI();
    alert(`Gracias por tu donación de ${amount} SUSC a la fundación.`);
}

// Función para actualizar la UI (se mantiene igual)
function updateUI() {
    totalSUSC.textContent = userState.balance;
    completedExperiences.textContent = userState.experiences;
    impactNFTs.textContent = userState.nfts;
}

// Inicializar la aplicación al cargar el DOM (reemplazando el script original)
document.addEventListener('DOMContentLoaded', function() {
    loadExperiences();
    setupEventListeners();
    checkWalletConnection();
    // NOTA: initMap() se llama automáticamente a través del script de Google Maps API.
});

// *Nota: Asegúrate de adjuntar este script después del HTML y las definiciones DOM en index.html*