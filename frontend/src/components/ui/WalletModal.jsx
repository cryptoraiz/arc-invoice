import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'

export default function WalletModal({ isOpen, onClose, connectors, onSelectWallet }) {
    // Detect installed wallets by checking if connector is ready
    const installedWallets = connectors.filter(c => c.ready !== false)
    const popularWallets = [
        { name: 'MetaMask', icon: '🦊', description: 'Popular para Ethereum' },
        { name: 'Rainbow', icon: '🌈', description: 'Colorida e fácil de usar' },
        { name: 'Coinbase Wallet', icon: '💼', description: 'Wallet oficial da Coinbase' },
        { name: 'WalletConnect', icon: '🔗', description: 'Conectar via QR code' },
    ]

    // Wallet metadata
    const walletInfo = {
        'MetaMask': { icon: '🦊', description: 'Popular para Ethereum' },
        'Rabby Wallet': { icon: '🐰', description: 'Multi-chain DeFi wallet' },
        'Phantom': { icon: '👻', description: 'Wallet para Solana e EVM' },
        'Coinbase Wallet': { icon: '💼', description: 'Wallet oficial da Coinbase' },
        'WalletConnect': { icon: '🔗', description: 'Conectar via QR code' },
        'Rainbow': { icon: '🌈', description: 'Colorida e fácil de usar' },
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 shadow-2xl transition-all">
                                <div className="grid md:grid-cols-5 gap-6">
                                    {/* Left: Wallet List */}
                                    <div className="md:col-span-3 p-6 border-r border-white/10">
                                        <Dialog.Title className="text-2xl font-bold mb-2">
                                            Conectar uma Carteira
                                        </Dialog.Title>
                                        <p className="text-sm text-gray-400 mb-6">
                                            Escolha sua carteira preferida
                                        </p>

                                        {/* Installed Wallets */}
                                        {installedWallets.length > 0 && (
                                            <>
                                                <div className="mb-3">
                                                    <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                                                        Instalado
                                                    </h3>
                                                </div>
                                                <div className="space-y-2 mb-6">
                                                    {installedWallets.map((connector) => {
                                                        const info = walletInfo[connector.name] || {
                                                            icon: '💳',
                                                            description: 'Web3 Wallet'
                                                        }

                                                        return (
                                                            <button
                                                                key={connector.id}
                                                                onClick={() => {
                                                                    onSelectWallet(connector)
                                                                    onClose()
                                                                }}
                                                                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.07] hover:border-blue-500/30 transition-all group"
                                                            >
                                                                <div className="text-2xl">{info.icon}</div>
                                                                <div className="flex-1 text-left">
                                                                    <div className="font-semibold text-sm text-white group-hover:text-blue-400 transition-colors">
                                                                        {connector.name}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {info.description}
                                                                    </div>
                                                                </div>
                                                                <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                </svg>
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </>
                                        )}

                                        {/* Popular Wallets */}
                                        <div className="mb-3">
                                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Popular
                                            </h3>
                                        </div>
                                        <div className="space-y-2">
                                            {popularWallets.map((wallet) => (
                                                <div
                                                    key={wallet.name}
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.01] border border-white/5 opacity-60"
                                                >
                                                    <div className="text-2xl">{wallet.icon}</div>
                                                    <div className="flex-1 text-left">
                                                        <div className="font-semibold text-sm text-gray-400">
                                                            {wallet.name}
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            {wallet.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={onClose}
                                            className="mt-6 w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                                        >
                                            Cancelar
                                        </button>
                                    </div>

                                    {/* Right: Educational Panel */}
                                    <div className="md:col-span-2 p-6 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
                                        <h3 className="text-lg font-bold mb-4">
                                            O que é uma Carteira?
                                        </h3>

                                        <div className="space-y-4">
                                            <div className="flex gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xl">🏦</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-sm mb-1">Um lar para seus ativos digitais</h4>
                                                    <p className="text-xs text-gray-400">
                                                        Carteiras são usadas para enviar, receber, armazenar e exibir ativos digitais como USDC e NFTs.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xl">🔑</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-sm mb-1">Uma nova maneira de fazer login</h4>
                                                    <p className="text-xs text-gray-400">
                                                        Em vez de criar novas contas e senhas em todos os sites, basta conectar sua carteira.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-white/10">
                                            <a
                                                href="https://ethereum.org/wallets/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                                            >
                                                Saiba mais
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
