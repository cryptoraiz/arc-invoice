import { useState, useEffect, useLayoutEffect } from 'react'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { toast } from 'sonner'
import { arcTestnet } from '../config/wagmi'

import confetti from 'canvas-confetti'
import { Turnstile } from '@marsidev/react-turnstile'
import WalletModal from '../components/ui/WalletModal'
import { useConnect } from 'wagmi'

const FAUCET_API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/faucet` : 'http://localhost:5000/api/faucet';

export default function FaucetPage() {
    const { address, isConnected } = useAccount()
    const chainId = useChainId()
    const { switchChain } = useSwitchChain()
    const { connect, connectors } = useConnect()

    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
    const handleWalletSelect = (connector) => {
        connect({ connector })
        setIsWalletModalOpen(false)
    }


    const [isLoading, setIsLoading] = useState(false)
    const [txHash, setTxHash] = useState(null)
    const [errorMsg, setErrorMsg] = useState(null)

    const [showShareModal, setShowShareModal] = useState(false)
    const [stats, setStats] = useState({ claims: 0, totalDistributed: 0, uniqueWallets: 0 })
    const [turnstileToken, setTurnstileToken] = useState(null)

    const [timeLeft, setTimeLeft] = useState(null); // in MS

    // Synchronously derive cached state to prevent flash when address loads
    const getCachedCooldown = () => {
        if (!address) return 0;
        const savedEnd = localStorage.getItem(`faucet_cooldown_${address}`);
        if (savedEnd) {
            const remaining = parseInt(savedEnd) - Date.now();
            return remaining > 0 ? remaining : 0;
        }
        return 0;
    };

    const cachedTime = getCachedCooldown();
    // Use state if available, otherwise fallback to cache (instant red button)
    const effectiveTimeLeft = timeLeft !== null ? timeLeft : cachedTime;

    // Poll stats every 5 seconds
    const fetchStats = async () => {
        try {
            const res = await fetch(`${FAUCET_API_URL}/stats`);
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    // Check individual eligibility
    const checkEligibility = async () => {
        if (!address) return;
        try {
            const res = await fetch(`${FAUCET_API_URL}/check?address=${address}`);
            const data = await res.json();

            if (data.canClaim === false) {
                setTimeLeft(data.waitTimeMs);
                setErrorMsg(`Wait for cooldown`);

                // Update LocalStorage (Address Specific)
                const endTime = Date.now() + data.waitTimeMs;
                localStorage.setItem(`faucet_cooldown_${address}`, endTime.toString());
            } else {
                setTimeLeft(null);
                setErrorMsg(null);
                localStorage.removeItem(`faucet_cooldown_${address}`);
                // Clean up old global key if exists
                localStorage.removeItem('faucet_cooldown_end');
            }
        } catch (error) {
            console.error("Error checking eligibility:", error);
        }
    };

    // Initial Load
    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    // Check eligibility when address changes
    useEffect(() => {
        if (address) {
            // Initialize timeLeft with cache immediately if possible to start timer
            const cached = getCachedCooldown();
            if (cached > 0) setTimeLeft(cached);

            checkEligibility();
        } else {
            setTimeLeft(null);
        }
    }, [address]);

    // Countdown Timer
    useEffect(() => {
        if (!effectiveTimeLeft || effectiveTimeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                // Handle case where prev might be null (transitioning from derived to state)
                const current = prev !== null ? prev : getCachedCooldown();
                const newVal = current - 1000;

                if (newVal <= 0) {
                    clearInterval(timer);
                    if (address) localStorage.removeItem(`faucet_cooldown_${address}`);
                    checkEligibility(); // Re-check server
                    return 0;
                }
                return newVal;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [effectiveTimeLeft, address]); // Dep on effectiveTimeLeft to start/stop

    const formatTime = (ms) => {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor((ms / (1000 * 60 * 60)));
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    // Persistent Fireworks Logic 🎆
    useEffect(() => {
        if (!showShareModal) return;

        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 200 };
        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
            // Left burst
            confetti({
                ...defaults,
                particleCount: 80,
                startVelocity: 45,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            // Right burst
            confetti({
                ...defaults,
                particleCount: 80,
                startVelocity: 45,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
            // Center random burst (occasionally)
            if (Math.random() > 0.5) {
                confetti({
                    ...defaults,
                    particleCount: 60,
                    startVelocity: 55,
                    origin: { x: randomInRange(0.4, 0.6), y: Math.random() - 0.2 }
                });
            }
        }, 800); // Fire much faster (every 0.8s)

        // Fire huge burst immediately on start
        confetti({ ...defaults, particleCount: 150, spread: 100, origin: { y: 0.6 } });

        return () => clearInterval(interval);
    }, [showShareModal]);

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

        if (!turnstileToken) {
            setErrorMsg("Please complete the security check below.")
            return;
        }

        setErrorMsg(null);
        setTxHash(null);

        if (chainId !== arcTestnet.id) {
            try {
                switchChain({ chainId: arcTestnet.id })
            } catch (e) {
                toast.error("Error switching network. Please switch manually.")
                return;
            }
        }

        setIsLoading(true);

        try {
            const response = await fetch(FAUCET_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, turnstileToken })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao processar pedido');
            }

            setTxHash(data.txHash);
            toast.success("100 USDC sent! 🎉");
            fetchStats(); // Update immediately

            // Set local cooldown immediately (optimistic ui or strict)
            const waitTime = 24 * 60 * 60 * 1000;
            setTimeLeft(waitTime);
            localStorage.setItem(`faucet_cooldown_${address}`, (Date.now() + waitTime).toString());

            setShowShareModal(true);

        } catch (error) {
            console.error(error);
            const msg = error.message;
            setErrorMsg(msg);

            // Only clear error if it's NOT a cooldown error
            if (!msg.toLowerCase().includes('cooldown') && !msg.toLowerCase().includes('24h')) {
                setTimeout(() => setErrorMsg(null), 5000);
            }
        } finally {
            setIsLoading(false);
        }
    }

    const shareText = `Just claimed 100 USDC on Arc Testnet via Arc Invoice Faucet! 🚀\n\nFuel your wallet now:\nhttps://arcinvoice.xyz/faucet\n\n#ArcNetwork #DeFi #Web3`
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
                            100 USDC
                        </h1>
                        <h2 className="text-2xl lg:text-3xl font-bold text-white">
                            Completely Free
                        </h2>
                    </div>

                    {/* Description */}
                    <p className="text-base lg:text-lg text-gray-400 mx-auto leading-relaxed">
                        Claim now and get fuel to test on <span className="whitespace-nowrap">Arc Network</span>.
                    </p>
                </div>

                {/* Stats Cards - WITH REQUESTED GLASS/SHIMMER EFFECT */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 p-4 rounded-xl text-center flex flex-col items-center justify-center min-h-[100px]">
                        <div className="text-3xl font-black gradient-text mb-1">
                            {stats.claims.toLocaleString('en-US')}
                        </div>
                        <div className="text-xs text-zinc-400 font-medium">Claims Made</div>
                    </div>
                    <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 p-4 rounded-xl text-center flex flex-col items-center justify-center min-h-[100px]">
                        <div className="text-3xl font-black text-cyan-400 mb-1">
                            ${stats.totalDistributed.toLocaleString('en-US')}
                        </div>
                        <div className="text-xs text-zinc-400 font-medium">USDC Distributed</div>
                    </div>
                    <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 p-4 rounded-xl text-center flex flex-col items-center justify-center min-h-[100px]">
                        <div className="text-3xl font-black text-purple-400 mb-1">
                            {stats.uniqueWallets.toLocaleString('en-US')}
                        </div>
                        <div className="text-xs text-zinc-400 font-medium">Unique Wallets</div>
                    </div>
                </div>

                {/* Claim Card - Clean style (Reverted) */}
                <div className="relative">
                    <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-5">

                        {/* Turnstile Widget */}
                        <div className="flex justify-center py-2 h-[80px]">
                            <Turnstile
                                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                                onSuccess={setTurnstileToken}
                                onError={() => setErrorMsg("Security check failed. Please reload.")}
                                onExpire={() => setTurnstileToken(null)}
                                options={{ theme: 'dark' }}
                            />
                        </div>

                        {/* Claim Button */}
                        {!isConnected ? (
                            <button
                                onClick={() => setIsWalletModalOpen(true)}
                                className="w-full py-4 rounded-xl gradient-button font-bold text-lg text-white shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-3"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Connect Wallet to Claim
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
                                    disabled={isLoading || effectiveTimeLeft > 0}
                                    className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group transition-all ${errorMsg || effectiveTimeLeft > 0
                                        ? 'bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 shadow-red-500/10'
                                        : 'gradient-button shadow-cyan-500/20'
                                        }`}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Processing...
                                        </>
                                    ) : (effectiveTimeLeft > 0) ? (
                                        <>
                                            <span className="text-xl">⏳</span>
                                            Cooldown Active: {formatTime(effectiveTimeLeft)}
                                        </>
                                    ) : errorMsg ? (
                                        <>
                                            <span className="text-xl">⚠️</span>
                                            {errorMsg}
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-xl">⚡</span>
                                            Claim 100 USDC
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
                                    Limit: <span className="text-blue-400 font-medium">1 claim every 24 hours</span>
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
                    <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full animate-scaleIn">
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

                            <h3 className="text-xl font-bold text-white">100 USDC Sent!</h3>
                            <p className="text-sm text-gray-400">
                                Tokens have been sent to your wallet. Share with friends!
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <a
                                    href={shareUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-xl bg-[#1DA1F2] hover:bg-[#1a91da] text-white font-bold flex items-center justify-center gap-2 transition-all text-sm shadow-[0_0_20px_rgba(29,161,242,0.4)] hover:shadow-[0_0_30px_rgba(29,161,242,0.6)] hover:-translate-y-1"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                                    Share on Twitter
                                </a>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(shareText);
                                        toast.success("Text copied!");
                                    }}
                                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold flex items-center justify-center gap-2 transition-colors text-sm"
                                >
                                    Copy
                                </button>
                            </div>

                            {txHash && (
                                <a
                                    href={`https://testnet.arcscan.app/tx/${txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-xs text-blue-400 hover:text-blue-300 underline mt-2"
                                >
                                    View on Explorer
                                </a>
                            )}
                        </div>
                    </div>

                </div>
            )}

            {/* Strategic Alternative Faucet Option */}
            <div className="mt-8 flex justify-center w-full relative z-10">
                <a
                    href="https://faucet.circle.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-4 px-6 py-4 rounded-2xl bg-[#0F1115] border border-white/5 hover:border-cyan-500/30 hover:bg-white/5 transition-all w-full max-w-sm shadow-lg hover:shadow-cyan-500/10"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-900/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">Official Circle Faucet</p>
                            <p className="text-xs text-zinc-500">Alternative request method</p>
                        </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 text-zinc-400 group-hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </div>
                </a>
            </div>


            <WalletModal
                isOpen={isWalletModalOpen}
                onClose={() => setIsWalletModalOpen(false)}
                connectors={connectors}
                onSelectWallet={handleWalletSelect}
            />
        </section>
    )
}
