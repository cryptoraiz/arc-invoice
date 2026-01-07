import { ethers } from 'ethers';

// The private key user provided (hardcoded here for the script only)
const PRIVATE_KEY = '0xbfd4df493bc585d80d50b696fba98fdd681a27c5a35daf01770c386d6ddfb895';
const RPC_URL = 'https://rpc.testnet.arc.network';

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log('🔐 Wallet Address:', wallet.address);

    try {
        const balance = await provider.getBalance(wallet.address);
        console.log('💰 Balance:', ethers.formatEther(balance), 'ETH/USDC');
    } catch (e) {
        console.log('Error checking balance:', e.message);
    }
}

main().catch(console.error);
