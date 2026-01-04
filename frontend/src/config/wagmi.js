import { http, createConfig } from 'wagmi'
import { mainnet, arbitrum, polygon, optimism, base } from 'wagmi/chains'

// Arc Network Testnet Configuration
export const arcTestnet = {
  id: 5042002, // Chain ID Oficial
  name: 'Arc Network Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'USDC', // Arc uses USDC as native token for gas? Search result says "native token is USDC".
    symbol: 'USDC',
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
    public: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'Arc Explorer', url: 'https://explorer.testnet.arc.network' },
  },
  testnet: true,
}

export const config = createConfig({
  chains: [arcTestnet, mainnet, arbitrum, polygon, optimism, base],
  transports: {
    [arcTestnet.id]: http(),
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
  },
})
