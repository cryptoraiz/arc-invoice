import { useState, useEffect, useRef, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { getPaymentLinksByWallet, getSentPaymentsByWallet, clearAllPaymentLinks, clearAllSentPayments } from '../utils/localStorage';
import { invoiceAPI } from '../services/invoiceService';
import { motion, AnimatePresence } from 'framer-motion';
import { generateBatchReceipts } from '../utils/generateReceipt';

export default function HistoryPage() {
    const { address, isConnected } = useAccount();
    const [receivedLinks, setReceivedLinks] = useState([]);
    const [sentPayments, setSentPayments] = useState([]);
    const [activeTab, setActiveTab] = useState('all'); // all, received, pending, expired, sent
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Notification State
    const [toasts, setToasts] = useState([]);
    const [showClearModal, setShowClearModal] = useState(false);
    const prevReceivedRef = useRef([]);

    // Toast Helper
    const addToast = (title, message) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, title, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    };

    const fetchHistory = useCallback(async () => {
        if (!isConnected || !address) {
            setReceivedLinks([]);
            setSentPayments([]);
            return;
        }

        const receivedLocal = getPaymentLinksByWallet(address);
        const sentLocal = getSentPaymentsByWallet(address);

        try {
            // console.log('🔄 Polling history for:', address); // Commented out to reduce console noise
            const backendInvoices = await invoiceAPI.getByWallet(address);

            const backendReceivedItems = backendInvoices.map(inv => ({
                id: inv.id,
                creatorAddress: inv.fromWallet,
                recipientName: inv.recipientName || 'Cobrança Recebida',
                recipientWallet: inv.recipientWallet,
                amount: inv.amount,
                currency: inv.currency,
                description: inv.description,
                status: inv.status,
                createdAt: inv.createdAt,
                paidAt: inv.paidAt,
                txHash: inv.txHash,
                isBackend: true
            }));

            // Merge Logic (Backend Priority)
            const allReceived = [...receivedLocal, ...backendReceivedItems];
            const uniqueReceived = Array.from(new Map(allReceived.map(item => [item.id, item])).values());

            // Notification Logic: Check for new 'paid' status
            uniqueReceived.forEach(newItem => {
                if (newItem.status === 'paid') {
                    const oldItem = prevReceivedRef.current.find(old => old.id === newItem.id);
                    // Trigger if it wasn't paid before (or is new and paid)
                    // Only if oldItem existed and was NOT paid (avoid notification on first load if refined, but here handles 'just paid')
                    if (oldItem && oldItem.status !== 'paid') {
                        addToast('Pagamento Recebido! 💰', `Recebeu ${newItem.amount} ${newItem.currency} de ${newItem.recipientName}`);
                    }
                }
            });

            // Update State and Ref
            setReceivedLinks(uniqueReceived);
            prevReceivedRef.current = uniqueReceived;
            setSentPayments(sentLocal);

        } catch (err) {
            console.error('❌ Polling error:', err);
            // Fallback to local only on error for first load
            setReceivedLinks(prev => {
                if (prev.length === 0) return receivedLocal;
                return prev;
            });
        }
    }, [address, isConnected]);

    // Polling Effect
    useEffect(() => {
        fetchHistory(); // Initial fetch
        const interval = setInterval(fetchHistory, 5000); // 5s Poll
        return () => clearInterval(interval);
    }, [fetchHistory]);

    // --- Stats Computation ---
    const totalReceived = receivedLinks
        .filter(i => i.status === 'paid')
        .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

    const totalSent = sentPayments
        .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

    const formattedTotalReceived = totalReceived.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formattedTotalSent = totalSent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const pendingCount = receivedLinks.filter(i => i.status === 'pending').length;
    const completedCount = receivedLinks.filter(i => i.status === 'paid').length;

    // --- Filtering Logic ---
    let displayedItems = [];

    // Helper to check if expired (older than 24h)
    const isExpired = (item) => {
        if (item.status === 'paid') return false;
        const created = new Date(item.createdAt).getTime();
        const now = Date.now();
        const expirationTime = 24 * 60 * 60 * 1000; // 24h Standard
        // const expirationTime = 2 * 60 * 1000; // 2min Test
        return (now - created) > expirationTime;
    };

    // Helper for countdown display
    const getTimeRemaining = (createdAt) => {
        const created = new Date(createdAt).getTime();
        const now = Date.now();
        const expiry = created + (24 * 60 * 60 * 1000); // 24h Standard
        // const expiry = created + (2 * 60 * 1000); // 2min Test
        const diff = expiry - now;

        if (diff <= 0) return 'Expirado';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const receivedItems = receivedLinks.map(i => ({ ...i, type: 'received' }));
    const sentItems = sentPayments.map(i => ({ ...i, type: 'sent', status: 'paid' }));

    if (activeTab === 'all') displayedItems = [...receivedItems, ...sentItems];
    else if (activeTab === 'received') displayedItems = receivedItems.filter(i => i.status === 'paid');
    else if (activeTab === 'pending') displayedItems = receivedItems.filter(i => i.status === 'pending' && !isExpired(i));
    else if (activeTab === 'expired') displayedItems = receivedItems.filter(i => i.status === 'pending' && isExpired(i));
    else if (activeTab === 'sent') displayedItems = sentItems;

    // Sort by dates
    displayedItems.sort((a, b) => {
        const dateA = a.paidAt || a.createdAt;
        const dateB = b.paidAt || b.createdAt;
        return new Date(dateB) - new Date(dateA);
    });

    // Apply Search
    if (searchTerm) {
        displayedItems = displayedItems.filter(item =>
            item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.amount?.toString().includes(searchTerm)
        );
    }

    // Apply Pagination
    const totalPages = Math.ceil(displayedItems.length / ITEMS_PER_PAGE);
    const paginatedItems = displayedItems.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const copyLink = (id) => {
        const url = `${window.location.origin}/pay/${id}`;
        navigator.clipboard.writeText(url);
        addToast('Link Copiado', 'Link de pagamento copiado para a área de transferência.');
    };

    const generatePaymentReceipt = (item) => {

        // console.log("Generating receipt for:", item);
        import('../utils/generateReceipt').then(module => {
            module.generatePaymentReceipt(item);
            addToast('Comprovante Gerado', `Comprovante para ${item.recipientName} está pronto.`);
        });
    };

    const handleExportData = () => {
        const allItems = [...receivedLinks, ...sentPayments];
        if (allItems.length === 0) {
            addToast('Nada para exportar', 'Seu histórico está vazio.');
            return;
        }
        generateBatchReceipts(allItems, address);
        addToast('Backup Iniciado', 'Download do PDF completo iniciado.');
    };

    const handleClearData = async () => {
        try {
            // Clear Local
            clearAllPaymentLinks();
            clearAllSentPayments();

            // Clear Backend
            if (isConnected && address) {
                await invoiceAPI.deleteByWallet(address);
            }

            addToast('Histórico Limpo', 'Todos os dados foram excluídos.');

            setTimeout(() => {
                setShowClearModal(false);
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error('Error clearing history:', error);
            addToast('Erro', 'Falha ao limpar histórico do servidor.');
            setShowClearModal(false);
        }
    };

    if (!isConnected) return (
        <div className="flex h-full items-center justify-center p-8">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-2xl">🔌</div>
                <h2 className="text-xl font-bold text-white">Conecte sua carteira</h2>
                <p className="text-zinc-500">Para ver seu histórico de transações</p>
            </div>
        </div>
    );

    return (
        <section className="flex-1 flex flex-col p-4 md:p-6 min-h-0 w-full items-center">
            <div className="w-full max-w-4xl flex flex-col flex-1 min-h-0 space-y-6">

                {/* Header & Controls Container */}
                <div className="flex flex-col gap-6 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">

                    {/* Stats Row */}
                    <div className="space-y-4">
                        {/* Row 1 - Monetary Values Only */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-zinc-400 mb-1">Total Recebido</p>
                                    <p className="text-2xl font-bold text-white tracking-tight">${formattedTotalReceived}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-zinc-400 mb-1">Total Enviado</p>
                                    <p className="text-2xl font-bold text-white tracking-tight">${formattedTotalSent}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Controls Row */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* Tabs */}
                        <div className="flex gap-2 bg-white/[0.02] p-1 rounded-xl border border-white/5">
                            {['Todos', 'Recebidos', 'Pendentes', 'Enviados'].map((tabLabel) => {
                                const key = tabLabel === 'Todos' ? 'all' :
                                    tabLabel === 'Recebidos' ? 'received' :
                                        tabLabel === 'Pendentes' ? 'pending' :
                                            tabLabel === 'Expirados' ? 'expired' : 'sent';
                                const isActive = activeTab === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            setActiveTab(key);
                                            setCurrentPage(1);
                                        }}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isActive
                                            ? 'bg-zinc-800 text-white shadow-lg'
                                            : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {tabLabel}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Admin Controls Moved to Bottom */}
                    </div>
                </div>

                {/* Links List */}
                <div className="flex-1 space-y-3 pb-8">
                    {/* Top Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-end items-center gap-4 pb-2">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-xs"
                                >
                                    Anterior
                                </button>
                                <span className="text-zinc-500 text-xs font-medium">
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-xs"
                                >
                                    Próximo
                                </button>
                            </div>
                        </div>
                    )}

                    {paginatedItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-zinc-600 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center">
                                <svg className="w-6 h-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            </div>
                            <p className="text-sm font-medium">Nenhum registro encontrado</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {paginatedItems.map(item => (
                                <div key={item.id} className="group bg-white/[0.02] border border-white/5 rounded-xl p-4 transition-all hover:bg-white/[0.04] hover:border-white/10">
                                    <div className="flex items-center justify-between gap-4">

                                        {/* Left Icon */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.type === 'sent' ? 'bg-red-500/10 text-red-400' :
                                            item.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' :
                                                (item.status === 'pending' && isExpired(item)) ? 'bg-zinc-800 text-zinc-400' : // Expired Style
                                                    'bg-amber-500/10 text-amber-400'
                                            }`}>
                                            {item.type === 'sent' ? (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                        </div>

                                        {/* Main Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-base font-bold text-white truncate">{item.recipientName}</h3>
                                                <span className={`px-2 py-[2px] rounded text-[10px] font-bold uppercase tracking-wider ${item.type === 'sent' ? 'bg-red-500/10 text-red-500' :
                                                    item.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' :
                                                        (item.status === 'pending' && isExpired(item)) ? 'bg-zinc-800 text-zinc-400' :
                                                            'bg-amber-500/10 text-amber-500'
                                                    }`}>
                                                    {item.type === 'sent' ? 'Enviado' :
                                                        item.status === 'paid' ? 'Recebido' :
                                                            (item.status === 'pending' && isExpired(item)) ? 'Expirado' :
                                                                'Aguardando'}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 mb-3">
                                                {item.status === 'pending' && !isExpired(item) && (
                                                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        Expira em: {getTimeRemaining(item.createdAt)}
                                                    </span>
                                                )}
                                                <p className="text-zinc-500 text-xs font-medium">
                                                    {new Date(item.paidAt || item.createdAt).toLocaleDateString('pt-BR', {
                                                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>

                                            {/* Action Bar */}
                                            <div className="flex flex-wrap gap-3 items-center">
                                                {item.status === 'pending' && item.type === 'received' && (
                                                    <button
                                                        onClick={() => copyLink(item.id)}
                                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors text-xs font-bold"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2v1h-4V5z" /></svg>
                                                        Copiar Link
                                                    </button>
                                                )}

                                                {(item.status === 'paid' || item.type === 'sent') && (
                                                    <button
                                                        onClick={() => generatePaymentReceipt(item)}
                                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors text-xs font-bold"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                        Comprovante
                                                    </button>
                                                )}

                                                {item.txHash && (
                                                    <a
                                                        href={`https://etherscan.io/tx/${item.txHash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-600 hover:text-white transition-colors"
                                                        title="View on Etherscan"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Side: Amount */}
                                        <div className="text-right pl-4">
                                            <p className="flex items-baseline justify-end gap-1 text-2xl md:text-3xl font-bold text-white tracking-tighter">
                                                <span className="text-zinc-600 font-medium select-none text-xl md:text-2xl mr-0.5">{item.type === 'sent' ? '-' : '+'}</span>
                                                {item.amount}
                                                <span className="text-sm md:text-base font-medium text-zinc-500 ml-1">{item.currency}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8 pb-4">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-sm"
                            >
                                Anterior
                            </button>
                            <span className="text-zinc-400 text-sm font-medium">
                                Página {currentPage} de {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-sm"
                            >
                                Próximo
                            </button>
                        </div>
                    )}

                    {/* Admin Controls (Bottom) */}
                    <div className="flex justify-center gap-4 mt-8 pt-4 border-t border-white/5 pb-4">
                        <button
                            onClick={handleExportData}
                            className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 text-sm font-bold transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            BACKUP PDF
                        </button>

                        <button
                            onClick={() => setShowClearModal(true)}
                            className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 text-sm font-bold transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            LIMPAR DADOS
                        </button>
                    </div>
                </div>
            </div>

            {/* Notification Toast Container */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="pointer-events-auto bg-zinc-900/90 border border-emerald-500/30 rounded-xl p-4 shadow-2xl shadow-emerald-900/20 w-80 flex items-start gap-3 backdrop-blur-xl"
                        >
                            <div className="p-2 bg-emerald-500/10 rounded-lg shrink-0">
                                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-white mb-0.5">{toast.title}</h4>
                                <p className="text-xs text-zinc-400 break-words">{toast.message}</p>
                            </div>
                            <button
                                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                                className="text-zinc-500 hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Clear Data Modal */}
            <AnimatePresence>
                {showClearModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 text-3xl">
                                    🗑️
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Limpar Histórico?</h3>
                                    <p className="text-sm text-zinc-400 leading-relaxed">
                                        Você perderá todo o histórico de transações e comprovantes salvos neste dispositivo.
                                        <br /><span className="text-red-400 font-bold">Essa ação é irreversível.</span>
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 w-full">
                                    <button
                                        onClick={handleExportData}
                                        className="w-full py-3 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 font-bold text-sm border border-blue-500/20 flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        Baixar Backup (PDF Completo)
                                    </button>

                                    <div className="flex gap-3 w-full">
                                        <button
                                            onClick={() => setShowClearModal(false)}
                                            className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-bold text-sm"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleClearData}
                                            className="flex-1 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 font-bold text-sm shadow-lg shadow-red-500/20"
                                        >
                                            Excluir Tudo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}
