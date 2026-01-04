import { useState, useEffect, useCallback } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { invoiceAPI } from '../services/invoiceService';
import { arcTestnet } from '../config/wagmi';

/**
 * Hook to manage invoice notifications for the connected wallet
 */
export const useInvoiceNotifications = () => {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const [pendingInvoices, setPendingInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastChecked, setLastChecked] = useState(null);

    // Fetch pending invoices
    const fetchInvoices = useCallback(async () => {
        // Block request if not connected or WRONG NETWORK
        if (!isConnected || !address || chainId !== arcTestnet.id) {
            setPendingInvoices([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const invoices = await invoiceAPI.getByWallet(address);
            // Filter only pending invoices
            const pending = invoices.filter((inv) => inv.status === 'pending');
            setPendingInvoices(pending);
            setLastChecked(Date.now());
        } catch (err) {
            console.error('Error fetching invoices:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [address, isConnected]);

    // Poll for new invoices every 30 seconds
    useEffect(() => {
        if (!isConnected || !address) return;

        // Initial fetch
        fetchInvoices();

        // Set up polling
        const interval = setInterval(fetchInvoices, 30000); // 30s

        return () => clearInterval(interval);
    }, [address, isConnected, chainId, fetchInvoices]);

    // Refresh manually
    const refresh = useCallback(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    return {
        pendingInvoices,
        loading,
        error,
        lastChecked,
        refresh,
        count: pendingInvoices.length,
    };
};
