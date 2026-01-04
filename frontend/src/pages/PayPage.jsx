import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAccount, useSwitchChain, useChainId } from 'wagmi'
import { getPaymentLinkById, updatePaymentLink, saveSentPayment } from '../utils/localStorage'
import { generatePaymentReceipt } from '../utils/generateReceipt'
import { invoiceAPI } from '../services/invoiceService'
import QRCode from 'react-qr-code'
import { toast } from 'sonner'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import { ERC20_ABI } from '../utils/abis'
import { arcTestnet } from '../config/wagmi'

// Endereços Oficiais Arc Testnet
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

export default function PayPage() {
    const { linkId } = useParams()
    const { address, isConnected } = useAccount()
    const [paymentData, setPaymentData] = useState(null)
    const [isPaying, setIsPaying] = useState(false)
    const [paymentComplete, setPaymentComplete] = useState(false)
    const [txHash, setTxHash] = useState('')
    const [error, setError] = useState('')
    const [timeLeft, setTimeLeft] = useState(null)
    const [isExpired, setIsExpired] = useState(false)

    // Wagmi Hooks
    const chainId = useChainId()
    const { switchChain } = useSwitchChain()
    const { data: hash, writeContract, error: writeError } = useWriteContract()
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

    useEffect(() => {
        const loadPaymentData = async () => {
            // 1. Try to get from localStorage (Creator view)
            const savedLink = getPaymentLinkById(linkId)
            let data = null;

            if (savedLink) {
                data = savedLink;
            } else {
                // 2. Try to get from Backend (Payer view)
                try {
                    const invoice = await invoiceAPI.getById(linkId);
                    if (invoice) {
                        data = invoice;
                    } else {
                        setError('Link de pagamento inválido ou expirado.');
                    }
                } catch (error) {
                    console.error('Failed to load invoice:', error);
                    setError('Erro ao carregar dados do pagamento.');
                }
            }

            if (data) {
                setPaymentData(data);

                // Expiration Logic
                if (data.status !== 'paid') {
                    const created = new Date(data.createdAt).getTime();
                    const now = Date.now();
                    const expiry = created + (24 * 60 * 60 * 1000); // 24h Standard
                    // const expiry = created + (2 * 60 * 1000); // 2min Test
                    const diff = expiry - now;

                    if (diff <= 0) {
                        setIsExpired(true);
                    } else {
                        setTimeLeft(diff);
                    }
                }
            }
        };

        if (linkId) {
            loadPaymentData();
        }
    }, [linkId])

    // Timer Effect
    useEffect(() => {
        if (!timeLeft || isExpired || paymentData?.status === 'paid') return;

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1000) {
                    clearInterval(interval);
                    setIsExpired(true);
                    return 0;
                }
                return prev - 1000;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft, isExpired, paymentData]);

    const formatTime = (ms) => {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor((ms / (1000 * 60 * 60)));
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    // Monitor Transaction Success
    useEffect(() => {
        if (isConfirmed && hash) {
            handlePaymentSuccess(hash)
        }
        if (writeError) {
            setIsPaying(false)

            // Silenciar erro de rejeição do usuário
            if (writeError.message?.toLowerCase().includes('user rejected') ||
                writeError.shortMessage?.toLowerCase().includes('user rejected')) {
                console.log("Transação cancelada pelo usuário")
                return
            }

            console.error("Payment Error:", writeError)
            toast.error("Erro no pagamento: " + (writeError.shortMessage || "Falha na transação"))
        }
    }, [isConfirmed, hash, writeError])

    const handlePayment = async () => {
        if (!paymentData) return

        // Check if on correct network
        if (chainId !== arcTestnet.id) {
            try {
                toast.info('Trocando para Arc Testnet...')
                await switchChain({ chainId: arcTestnet.id })
            } catch (err) {
                toast.error('Você precisa estar na Arc Testnet para pagar')
                return
            }
        }

        setIsPaying(true)

        // Select correct token address based on currency
        const tokenAddress = paymentData.currency === 'EURC' ? EURC_ADDRESS : USDC_ADDRESS;

        try {
            writeContract({
                address: tokenAddress,
                abi: ERC20_ABI,
                functionName: 'transfer',
                args: [
                    paymentData.recipientWallet,
                    parseUnits(paymentData.amount.toString(), 6) // Ambos têm 6 decimais
                ],
            })
        } catch (err) {
            console.error("Write Contract Error:", err)
            setIsPaying(false)
            toast.error("Erro ao iniciar transação")
        }
    }

    const handlePaymentSuccess = async (confirmedHash) => {
        setTxHash(confirmedHash)

        // Update localStorage if link exists (for receiver)
        if (paymentData?.id) {
            updatePaymentLink(paymentData.id, {
                status: 'paid',
                txHash: confirmedHash,
                paidAt: Date.now(),
                payer: address
            })
        }

        // Update backend
        try {
            await invoiceAPI.updateStatus(linkId, 'paid', {
                txHash: confirmedHash,
                paidAt: Date.now(),
                payer: address
            })
        } catch (err) {
            console.error('Failed to sync payment status:', err)
        }

        // Save sent payment
        saveSentPayment({
            id: paymentData?.id || linkId,
            recipientName: paymentData.recipientName,
            recipientWallet: paymentData.recipientWallet,
            amount: paymentData.amount,
            currency: paymentData.currency,
            description: paymentData.description,
            txHash: confirmedHash,
            payer: address
        })

        setIsPaying(false)
        setPaymentComplete(true)
        toast.success('Pagamento processado com sucesso!')
    }

    // ERROR STATE UI
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-red-500/30 p-8 rounded-2xl text-center space-y-4 shadow-2xl max-w-sm w-full">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 text-3xl">
                        ⚠️
                    </div>
                    <h2 className="text-xl font-bold text-white">Link Não Encontrado</h2>
                    <p className="text-gray-400 text-sm">{error}</p>
                    <a href="/" className="inline-block px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors">
                        Criar Novo Link
                    </a>
                </div>
            </div>
        )
    }

    // SAFETY CHECK - LOADING STATE
    // This prevents the main UI from trying to render incomplete data
    if (!paymentData || !paymentData.recipientWallet) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">
                        {paymentData ? 'Inicializando...' : 'Buscando informações...'}
                    </p>
                </div>
            </div>
        )
    }

    // SUCCESS STATE
    if (paymentComplete) {
        const handleDownloadReceipt = () => {
            generatePaymentReceipt({
                ...paymentData,
                txHash,
                paidAt: Date.now(),
                payer: address
            })
            toast.success('Comprovante baixado com sucesso!')
        }

        return (
            <section className="flex-1 flex items-center justify-center p-4 pb-8 h-full min-h-0">
                <div className="max-w-md w-full opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-green-500/20 rounded-2xl blur-2xl"></div>
                        <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center space-y-4">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                                <span className="text-4xl">✓</span>
                            </div>

                            <div>
                                <h1 className="text-2xl font-black mb-1">Pagamento Confirmado!</h1>
                                <p className="text-sm text-gray-400">Transação processada com sucesso</p>
                            </div>

                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Valor:</span>
                                    <span className="font-bold">{paymentData.amount} {paymentData.currency}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Para:</span>
                                    <span className="font-bold">{paymentData.recipientName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Status:</span>
                                    <span className="text-green-400 font-bold">Confirmado</span>
                                </div>
                            </div>

                            {txHash && (
                                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                                    <p className="text-xs text-gray-400 mb-1">Hash da Transação:</p>
                                    <p className="text-xs font-mono text-gray-300 break-all">
                                        {txHash.slice(0, 10)}...{txHash.slice(-8)}
                                    </p>
                                </div>
                            )}

                            {/* Download Receipt Button */}
                            <button
                                onClick={handleDownloadReceipt}
                                className="w-full px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-500/50 flex items-center justify-center gap-2"
                            >
                                <span className="text-lg">📄</span>
                                Baixar Comprovante PDF
                            </button>

                            <p className="text-xs text-gray-500">
                                Link ID: {linkId}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    // ALREADY PAID / EXPIRED STATE
    if ((paymentData.status === 'paid' || isExpired) && !paymentComplete) {
        const isPaid = paymentData.status === 'paid';
        const handleDownloadReceipt = () => {
            if (!isPaid) return;
            generatePaymentReceipt({
                ...paymentData,
                // Ensure we use existing data for receipt
                txHash: paymentData.txHash || 'N/A',
                paidAt: paymentData.paidAt || Date.now(),
                payer: paymentData.payer || 'Desconhecido'
            })
            toast.success('Comprovante baixado com sucesso!')
        }

        return (
            <section className="flex-1 flex items-center justify-center p-4 pb-8 h-full min-h-0">
                <div className="max-w-md w-full opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gray-500/10 rounded-2xl blur-2xl"></div>
                        <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center space-y-4">
                            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
                                <span className="text-3xl">{isPaid ? '🔒' : '⏳'}</span>
                            </div>

                            <div>
                                <h1 className="text-2xl font-black mb-1">{isPaid ? 'Link Expirado' : 'Tempo Esgotado'}</h1>
                                <p className="text-sm text-gray-400">
                                    {isPaid ? 'Este pagamento já foi realizado.' : 'O prazo para este pagamento expirou.'}
                                </p>
                            </div>

                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Valor:</span>
                                    <span className="font-bold">{paymentData.amount} {paymentData.currency}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Destinatário:</span>
                                    <span className="font-bold">{paymentData.recipientName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Data Criação:</span>
                                    <span className="text-white">
                                        {new Date(paymentData.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {paymentData.txHash && isPaid && (
                                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                                    <p className="text-xs text-gray-400 mb-1">Hash da Transação:</p>
                                    <p className="text-xs font-mono text-gray-300 break-all">
                                        {paymentData.txHash.slice(0, 10)}...{paymentData.txHash.slice(-8)}
                                    </p>
                                </div>
                            )}

                            {/* Download Receipt Button (Only if Paid) */}
                            {isPaid && (
                                <button
                                    onClick={handleDownloadReceipt}
                                    className="w-full px-6 py-3 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10 flex items-center justify-center gap-2"
                                >
                                    <span className="text-lg">📄</span>
                                    Baixar Comprovante
                                </button>
                            )}

                            <a href="/" className="block text-xs text-blue-400 hover:text-blue-300 mt-4">
                                Voltar ao Início
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    // MAIN FORM STATE
    return (
        <section className="flex-1 flex items-center justify-center p-4 h-full min-h-0">
            <div className="max-w-4xl w-full">
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                        {/* Header */}
                        <div className="text-center space-y-1 mb-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                                Arc Invoice
                            </div>
                            <h1 className="text-xl font-black">Solicitação de Pagamento</h1>

                            {timeLeft !== null && (
                                <div className="flex items-center justify-center gap-1.5 mt-2 bg-amber-500/10 border border-amber-500/20 rounded-lg py-1.5 px-3 w-fit mx-auto animate-pulse">
                                    <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="text-xs font-bold text-amber-500 font-mono tracking-wide">
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Recipient Name Highlight */}
                        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                            <p className="text-xs text-gray-400 mb-1 text-center">Solicitado por</p>
                            <p className="text-lg font-bold text-white text-center">{paymentData.recipientName}</p>
                        </div>

                        {/* Two Column Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column - Payment Details */}
                            <div className="space-y-4">
                                {/* Valor */}
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-center">
                                    <p className="text-xs text-gray-400 mb-0.5">Valor a pagar</p>
                                    <div className="text-4xl font-black text-emerald-500">
                                        {paymentData.currency === 'EURC' ? '€' : '$'}{paymentData.amount}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">{paymentData.currency}</p>
                                </div>

                                {/* Descrição */}
                                {paymentData.description && (
                                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                                        <p className="text-xs text-gray-400 mb-0.5">Descrição</p>
                                        <p className="text-xs text-white">{paymentData.description}</p>
                                    </div>
                                )}

                                {/* Detalhes */}
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex justify-between p-2 rounded-lg bg-white/[0.02]">
                                        <span className="text-gray-400">Destinatário</span>
                                        <span className="font-mono text-gray-300">
                                            {paymentData.recipientWallet.slice(0, 6)}...{paymentData.recipientWallet.slice(-4)}
                                        </span>
                                    </div>
                                </div>

                                {/* Network Status & Action Area */}
                                {isConnected && chainId && chainId !== arcTestnet.id ? (
                                    <div className="space-y-3">
                                        {/* Compact Error Message */}
                                        <div className="flex items-center justify-center gap-2 text-amber-500 bg-amber-500/10 py-2 px-3 rounded-lg border border-amber-500/20">
                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <span className="text-xs font-medium">Rede incorreta detectada</span>
                                        </div>

                                        {/* Switch Network Button */}
                                        <button
                                            onClick={() => {
                                                toast.info('Trocando para Arc Testnet...')
                                                switchChain({ chainId: arcTestnet.id }).catch(err => {
                                                    console.error('Erro ao trocar rede:', err)
                                                    toast.error('Erro ao trocar de rede')
                                                })
                                            }}
                                            className="w-full px-6 py-3 rounded-xl font-bold text-base bg-red-500 hover:bg-red-600 text-white transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-4 group overflow-hidden relative"
                                        >
                                            {/* Left Arrow - Animated */}
                                            <svg className="w-5 h-5 animate-bounce-left" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" transform="scale(-1, 1) translate(-24, 0)" />
                                            </svg>

                                            <span className="relative z-10 uppercase tracking-wide">Trocar para Arc Testnet</span>

                                            {/* Right Arrow - Animated */}
                                            <svg className="w-5 h-5 animate-bounce-right" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : !isConnected ? (
                                    <div className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/10">
                                        <p className="text-sm text-gray-400 mb-2">
                                            Conecte sua wallet para pagar
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Utilize o botão "Conectar Wallet" no topo
                                        </p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handlePayment}
                                        disabled={isPaying}
                                        className="w-full px-6 py-3 rounded-xl font-bold text-base bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        {isPaying || isConfirming ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                {isConfirming ? 'Confirmando...' : 'Processando...'}
                                            </span>
                                        ) : (
                                            `Pagar ${paymentData.amount} ${paymentData.currency}`
                                        )}
                                    </button>
                                )}

                                {/* Info */}
                                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    Pagamento seguro via Arc Network
                                </div>
                            </div>

                            {/* Right Column - QR Code */}
                            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-white/[0.05] border border-white/10">
                                <div className="bg-white p-3 rounded-lg mb-3">
                                    <QRCode value={window.location.href} size={220} />
                                </div>
                                <p className="text-xs text-gray-400 text-center">
                                    Escaneie para pagar pelo celular
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
