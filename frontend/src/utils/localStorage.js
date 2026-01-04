/**
 * LocalStorage utility for managing Arc Invoice payment links
 */

const STORAGE_KEY = 'arc_invoice_payment_links';

/**
 * Get all payment links from localStorage
 */
export const getPaymentLinks = () => {
    try {
        const links = localStorage.getItem(STORAGE_KEY);
        return links ? JSON.parse(links) : [];
    } catch (error) {
        console.error('Error reading payment links:', error);
        return [];
    }
};

/**
 * Save a new payment link
 */
export const savePaymentLink = (linkData) => {
    try {
        const links = getPaymentLinks();
        links.push({
            ...linkData,
            createdAt: Date.now(),
            status: 'pending'
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
        return true;
    } catch (error) {
        console.error('Error saving payment link:', error);
        return false;
    }
};

/**
 * Update payment link status (e.g., mark as paid)
 */
export const updatePaymentLink = (linkId, updates) => {
    try {
        const links = getPaymentLinks();
        const index = links.findIndex(link => link.id === linkId);

        if (index !== -1) {
            links[index] = { ...links[index], ...updates };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error updating payment link:', error);
        return false;
    }
};

/**
 * Get payment links filtered by wallet address
 */
export const getPaymentLinksByWallet = (walletAddress) => {
    const links = getPaymentLinks();
    return links.filter(
        link => link.creatorAddress?.toLowerCase() === walletAddress?.toLowerCase()
    );
};

/**
 * Get payment link by ID
 */
export const getPaymentLinkById = (linkId) => {
    const links = getPaymentLinks();
    return links.find(link => link.id === linkId);
};

/**
 * Delete a payment link
 */
export const deletePaymentLink = (linkId) => {
    try {
        const links = getPaymentLinks();
        const filtered = links.filter(link => link.id !== linkId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('Error deleting payment link:', error);
        return false;
    }
};

/**
 * Clear all payment links (use with caution)
 */
export const clearAllPaymentLinks = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing payment links:', error);
        return false;
    }
};

// ===== SENT PAYMENTS MANAGEMENT =====

const SENT_PAYMENTS_KEY = 'arc_invoice_sent_payments';

/**
 * Get all sent payments from localStorage
 */
export const getSentPayments = () => {
    try {
        const payments = localStorage.getItem(SENT_PAYMENTS_KEY);
        return payments ? JSON.parse(payments) : [];
    } catch (error) {
        console.error('Error reading sent payments:', error);
        return [];
    }
};

/**
 * Save a sent payment record
 */
export const saveSentPayment = (paymentData) => {
    try {
        const payments = getSentPayments();
        payments.push({
            ...paymentData,
            paidAt: Date.now()
        });
        localStorage.setItem(SENT_PAYMENTS_KEY, JSON.stringify(payments));
        return true;
    } catch (error) {
        console.error('Error saving sent payment:', error);
        return false;
    }
};

/**
 * Get sent payments filtered by payer wallet address
 */
export const getSentPaymentsByWallet = (walletAddress) => {
    const payments = getSentPayments();
    return payments.filter(
        payment => payment.payer?.toLowerCase() === walletAddress?.toLowerCase()
    );
};

/**
 * Clear all sent payments (use with caution)
 */
export const clearAllSentPayments = () => {
    try {
        localStorage.removeItem(SENT_PAYMENTS_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing sent payments:', error);
        return false;
    }
};
