import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'

export default function WalletModal({ isOpen, onClose, connectors, onSelectWallet }) {
    // Detect installed wallets by checking if connector is ready
    const installedWallets = connectors.filter(c => c.ready !== false && c.id !== 'walletConnect')

    // Official Wallet Icons - All high-quality, transparent backgrounds
    const walletIcons = {
        'MetaMask': 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
        'Rabby Wallet': 'https://raw.githubusercontent.com/RabbyHub/Rabby/develop/src/ui/assets/dashboard/rabby.svg',
        'Rabby': 'https://raw.githubusercontent.com/RabbyHub/Rabby/develop/src/ui/assets/dashboard/rabby.svg', // Alias
        'Phantom': 'https://raw.githubusercontent.com/phantom/branding/main/phantom-icon-purple.svg',
        'Coinbase Wallet': 'https://images.ctfassets.net/q5ulk4bp65r7/1rFQCqoq8hipvVJSKdU3fQ/21ab733af7a8ab404e29b873ffb28348/coinbase-icon2.svg',
        'WalletConnect': 'https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Logo/Blue%20(Default)/Logo.svg',
        'Rainbow': 'https://raw.githubusercontent.com/rainbow-me/rainbowkit/main/assets/rainbow.svg',
        'Backpack': 'https://docs.xnfts.dev/img/backpack.svg',
        'Keplr': 'https://raw.githubusercontent.com/chainapsis/keplr-wallet/master/packages/extension/public/assets/logo-256.svg',
        'Safe': 'https://raw.githubusercontent.com/safe-global/safe-react-apps/main/apps/tx-builder/public/safe-logo.svg',
        'Trust Wallet': 'https://trustwallet.com/assets/images/media/assets/trust_platform.svg',
        'Trust': 'https://trustwallet.com/assets/images/media/assets/trust_platform.svg', // Alias
        'Brave Wallet': 'https://upload.wikimedia.org/wikipedia/commons/5/51/Brave_icon_lionface.svg',
        'Brave': 'https://upload.wikimedia.org/wikipedia/commons/5/51/Brave_icon_lionface.svg', // Alias
        'OKX Wallet': 'https://www.okx.com/cdn/assets/imgs/221/530B48007C649C16.png',
        'BitKeep': 'https://raw.githubusercontent.com/bitkeepwallet/download/main/logo/png/bitkeep_logo_square.png',
        'Bitget Wallet': 'https://raw.githubusercontent.com/bitkeepwallet/download/main/logo/png/bitkeep_logo_square.png',
        'Injected': 'https://www.svgrepo.com/show/331309/ethereum.svg' // Fallback for Injected
    }

    const popularWallets = [
        { name: 'Rainbow', icon: walletIcons['Rainbow'], description: 'Colorida e fácil de usar' },
        { name: 'MetaMask', icon: walletIcons['MetaMask'], description: 'Popular para Ethereum' },
        { name: 'WalletConnect', icon: walletIcons['WalletConnect'], description: 'Conectar via QR code' },
        { name: 'Coinbase Wallet', icon: walletIcons['Coinbase Wallet'], description: 'Wallet oficial da Coinbase' },
    ]

    const getWalletIcon = (name) => {
        return walletIcons[name] || walletIcons['Injected']
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
                                        <div className="flex items-center justify-between mb-2">
                                            <Dialog.Title className="text-2xl font-bold">
                                                Conectar uma Carteira
                                            </Dialog.Title>
                                            <button onClick={onClose} className="md:hidden text-gray-400">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
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
                                                    {installedWallets.map((connector) => (
                                                        <button
                                                            key={connector.id}
                                                            onClick={() => {
                                                                onSelectWallet(connector)
                                                                onClose()
                                                            }}
                                                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.07] hover:border-blue-500/30 transition-all group"
                                                        >
                                                            <div className="w-8 h-8 flex items-center justify-center">
                                                                <img src={getWalletIcon(connector.name)} alt={connector.name} className="w-full h-full object-contain p-0.5" />
                                                            </div>
                                                            <div className="flex-1 text-left">
                                                                <div className="font-semibold text-sm text-white group-hover:text-blue-400 transition-colors">
                                                                    {connector.name}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    Detectada
                                                                </div>
                                                            </div>
                                                            <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </button>
                                                    ))}
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
                                            {popularWallets
                                                .filter(wallet => !installedWallets.find(w => w.name === wallet.name))
                                                .map((wallet) => (
                                                    <div
                                                        key={wallet.name}
                                                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.01] border border-white/5 opacity-60 hover:opacity-100 cursor-not-allowed"
                                                    >
                                                        <div className="w-8 h-8 flex items-center justify-center">
                                                            <img src={wallet.icon} alt={wallet.name} className="w-full h-full object-contain p-0.5" />
                                                        </div>
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
                                    </div>

                                    {/* Right: Educational Panel */}
                                    <div className="hidden md:block md:col-span-2 p-6 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
                                        <div className="h-full flex flex-col">
                                            <h3 className="text-lg font-bold mb-4">
                                                O que é uma Carteira?
                                            </h3>

                                            <div className="space-y-6 flex-1">
                                                <div className="flex gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xl">🏦</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-sm mb-1">Seus Ativos Digitais</h4>
                                                        <p className="text-xs text-gray-400">
                                                            Envie, receba e guarde seus tokens e NFTs com segurança total.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xl">🔑</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-sm mb-1">Login Universal</h4>
                                                        <p className="text-xs text-gray-400">
                                                            Chega de senhas. Use sua carteira para logar em qualquer app Web3.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-center justify-center mt-8 p-4 bg-blue-500/10 rounded-xl border border-blue-500/10 text-center">
                                                    <p className="text-xs font-medium text-blue-300 mb-2">Novo no mundo Cripto?</p>
                                                    <a
                                                        href="https://ethereum.org/wallets/"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition-colors"
                                                    >
                                                        Obter uma Carteira
                                                    </a>
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-white/10 text-center">
                                                <a href="#" className="text-xs text-blue-400/50 hover:text-blue-400 transition-colors">
                                                    Saiba mais sobre wallets
                                                </a>
                                            </div>
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
