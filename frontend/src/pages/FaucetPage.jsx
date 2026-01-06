import { useState, useEffect } from 'react'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { toast } from 'sonner'
import { arcTestnet } from '../config/wagmi'

import confetti from 'canvas-confetti'

const FAUCET_API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/faucet` : 'http://localhost:5000/api/faucet';

export default function FaucetPage() {
    const { address, isConnected } = useAccount()
    const chainId = useChainId()
    const { switchChain } = useSwitchChain()


    const [isLoading, setIsLoading] = useState(false)
    const [txHash, setTxHash] = useState(null)
    const [errorMsg, setErrorMsg] = useState(null)
    const [showShareModal, setShowShareModal] = useState(false)
    const [stats, setStats] = useState({ claims: 0, totalDistributed: 0, uniqueWallets: 0 })

    // Fetch stats on mount
    useEffect(() => {
        fetch(`${FAUCET_API_URL}/stats`)
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(() => { })
    }, [])

    // Generate snow flakes
    const snowflakes = Array.from({ length: 50 }).map((_, i) => (
        <div
            key={i}
            className="snow"
            style={{
                left: `${Math.random() * 100}vw`,
                animationDelay: `${Math.random() * 10}s`,
                opacity: Math.random() * 0.3
            }}
        />
    ));

    const handleClaim = async () => {
        if (!isConnected || !address) return;

        setErrorMsg(null);
        setTxHash(null);

        if (chainId !== arcTestnet.id) {
            try {
                switchChain({ chainId: arcTestnet.id })
            } catch (e) {
                toast.error("Erro ao trocar de rede. Troque manualmente.")
                return;
            }
        }

        setIsLoading(true);

        try {
            const response = await fetch(FAUCET_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao processar pedido');
            }

            setTxHash(data.txHash);
            toast.success("50 USDC enviados! 🎉");

            // Fireworks Effect 🎆
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min, max) => Math.random() * (max - min) + min;

            const interval = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);

                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
                });
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
                });
            }, 250);

            setShowShareModal(true);

        } catch (error) {
            console.error(error);
            setErrorMsg(error.message);
            setTimeout(() => setErrorMsg(null), 5000);
        } finally {
            setIsLoading(false);
        }
    }

    const shareText = `Acabei de receber 50 USDC na Arc Testnet usando o Faucet da Arc Invoice! 🚀\n\nAbasteça sua carteira agora:\nhttps://arcinvoice.app/faucet\n\n#ArcNetwork #DeFi #Web3`
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

    return (
        <section className="flex-1 flex flex-col items-center justify-center p-6 lg:p-8 relative overflow-hidden">
            {/* Background Elements (Reverted to subtle original style) */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Snow Effect Container */}
            <div className="snow-container">
                {snowflakes}
            </div>

            <div className="max-w-3xl w-full space-y-8 relative z-10">

                {/* Hero Section - Centered */}
                <div className="text-center space-y-4">
                    {/* Main Value */}
                    <div className="space-y-2">
                        <h1 className="text-6xl lg:text-7xl font-black gradient-text tracking-tight">
                            50 USDC
                        </h1>
                        <h2 className="text-2xl lg:text-3xl font-bold text-white">
                            Completamente Grátis
                        </h2>
                    </div>

                    {/* Description */}
                    <p className="text-base lg:text-lg text-gray-400 mx-auto leading-relaxed">
                        Faça claim agora mesmo e tenha combustível para testar a <span className="whitespace-nowrap">Arc Network</span>.
                    </p>
                </div>

                {/* Stats Cards - WITH REQUESTED GLASS/SHIMMER EFFECT */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="glass-card p-4 rounded-xl text-center flex flex-col items-center justify-center min-h-[100px] shimmer">
                        <div className="text-3xl font-black gradient-text mb-1">
                            {stats.claims.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-xs text-zinc-400 font-medium">Claims Realizados</div>
                    </div>
                    <div className="glass-card p-4 rounded-xl text-center flex flex-col items-center justify-center min-h-[100px] shimmer">
                        <div className="text-3xl font-black text-cyan-400 mb-1">
                            ${stats.totalDistributed.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-xs text-zinc-400 font-medium">USDC Distribuídos</div>
                    </div>
                    <div className="glass-card p-4 rounded-xl text-center flex flex-col items-center justify-center min-h-[100px] shimmer">
                        <div className="text-3xl font-black text-purple-400 mb-1">
                            {stats.uniqueWallets.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-xs text-zinc-400 font-medium">Wallets Únicas</div>
                    </div>
                </div>

                {/* Claim Card - Clean style (Reverted) */}
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl"></div>

                    <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-5">

                        {/* Claim Button */}
                        {!isConnected ? (
                            <button
                                onClick={() => { /* Open wallet modal logic would go here if available, relying on wagmi state usually */ }}
                                className="w-full py-4 rounded-xl gradient-button font-bold text-lg text-white shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-3"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Conectar Wallet para Receber
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-sm font-mono text-blue-200 break-all">
                                            {address}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleClaim}
                                    disabled={isLoading}
                                    className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group transition-all ${errorMsg
                                        ? 'bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 shadow-red-500/10'
                                        : 'gradient-button shadow-cyan-500/20'
                                        }`}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Processando...
                                        </>
                                    ) : errorMsg ? (
                                        <>
                                            <span className="text-xl">⚠️</span>
                                            {errorMsg}
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-xl">⚡</span>
                                            Resgatar 50 USDC
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </>
                                    )}
                                </button>

                                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Limite: <span className="text-blue-400 font-medium">1 resgate a cada 24 horas</span>
                                </div>
                            </div>
                        )}


                    </div>
                </div>

            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowShareModal(false)}></div>
                    <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full animate-scaleIn">
                        <button
                            onClick={() => setShowShareModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                <span className="text-3xl">🎉</span>
                            </div>

                            <h3 className="text-xl font-bold text-white">50 USDC Enviados!</h3>
                            <p className="text-sm text-gray-400">
                                Os tokens foram enviados para sua carteira. Compartilhe com amigos!
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <a
                                    href={shareUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-xl bg-[#1DA1F2]/10 border border-[#1DA1F2]/20 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] font-semibold flex items-center justify-center gap-2 transition-colors text-sm"
                                >
                                    Twitter
                                </a>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(shareText);
                                        toast.success("Texto copiado!");
                                    }}
                                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold flex items-center justify-center gap-2 transition-colors text-sm"
                                >
                                    Copiar
                                </button>
                            </div>

                            {txHash && (
                                <a
                                    href={`https://testnet.arcscan.app/tx/${txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-xs text-blue-400 hover:text-blue-300 underline mt-2"
                                >
                                    Ver transação no Explorer
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}
