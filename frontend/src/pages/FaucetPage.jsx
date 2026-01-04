import { useAccount, useReadContract } from 'wagmi'
import { ERC20_ABI } from '../utils/abis'

// USDC Oficial Arc Testnet
const TOKEN_ADDRESS = "0x3600000000000000000000000000000000000000";

export default function FaucetPage() {
    const { address, isConnected } = useAccount()

    // Read Balance
    const { data: balanceData } = useReadContract({
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
        query: {
            enabled: !!address,
        }
    })

    // Format Balance (assuming 6 decimals)
    const formattedBalance = balanceData
        ? (Number(balanceData) / 1_000_000).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
        : '0,00'

    return (
        <section className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl blur-2xl"></div>
                    <div className="relative bg-zinc-900 border border-white/10 rounded-2xl p-8 text-center space-y-8">

                        <div className="space-y-2">
                            <h1 className="text-3xl font-black text-white">Arc Faucet 🚰</h1>
                            <p className="text-zinc-400 text-sm">
                                Para testar o Arc Invoice, você precisa de USDC na rede de testes.
                            </p>
                        </div>

                        {/* Balance Card */}
                        <div className="p-6 rounded-xl bg-white/[0.05] border border-white/10 relative overflow-hidden group/card">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                            <p className="text-xs text-zinc-500 uppercase font-bold mb-2">Seu Saldo Atual</p>
                            <p className="text-5xl font-bold text-white tracking-tight flex items-baseline justify-center gap-2">
                                {formattedBalance}
                                <span className="text-lg text-zinc-600 font-medium">USDC</span>
                            </p>
                        </div>

                        <div className="space-y-4">
                            {!isConnected ? (
                                <p className="text-yellow-500 text-sm bg-yellow-500/10 px-4 py-2 rounded-lg border border-yellow-500/20">
                                    Conecte sua carteira para ver seu saldo
                                </p>
                            ) : (
                                <a
                                    href="https://faucet.circle.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-lg transition-all shadow-lg shadow-blue-500/20 hover:scale-[1.02] hover:shadow-blue-500/40 flex items-center justify-center gap-2"
                                >
                                    <span>Ir para Faucet Oficial</span>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            )}

                            <p className="text-xs text-zinc-500">
                                Você será redirecionado para o site da Circle (faucet.circle.com)
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}
