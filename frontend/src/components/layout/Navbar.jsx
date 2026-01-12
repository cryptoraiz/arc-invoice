
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAccount, useConnect, useDisconnect, useSwitchChain, useChainId } from 'wagmi'
import { useInvoiceNotifications } from '../../hooks/useInvoiceNotifications'
import { arcTestnet } from '../../config/wagmi'
import { toast } from 'sonner'
import WalletModal from '../ui/WalletModal'

export default function Navbar() {
  const location = useLocation()
  const { address, isConnected, connector } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { count: notificationCount } = useInvoiceNotifications()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [showWalletModal, setShowWalletModal] = useState(false)

  // Handle wallet selection from modal
  const handleWalletSelect = (connector) => {
    connect({ connector })
  }

  // Handle network switch
  const handleSwitchNetwork = () => {
    toast.info('Switching to Arc Testnet...')
    switchChain({ chainId: arcTestnet.id }).catch(() => attemptRawSwitch())
  }

  // Raw Switch Implementation (Fallback)
  const attemptRawSwitch = async () => {
    try {
      const provider = await connector?.getProvider()
      if (!provider) throw new Error('No provider')

      const chainIdHex = '0x4cef02' // 5042002

      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        })
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902 || switchError.data?.originalError?.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: chainIdHex,
              chainName: 'Arc Network Testnet',
              nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
              rpcUrls: ['https://rpc.testnet.arc.network'],
              blockExplorerUrls: ['https://explorer.testnet.arc.network']
            }]
          })
        } else {
          throw switchError
        }
      }
      return true
    } catch (rawErr) {
      console.error("Raw Switch falhou:", rawErr)
      toast.error('Error switching network. Try manually.', { duration: 4000 })
      return false
    }
  }

  // Auto-switch with REAL chainId verification (bypass Rabby cache bug)
  useEffect(() => {
    if (!isConnected) {
      // console.log('❌ Not connected, skipping auto-switch')
      return
    }

    let mounted = true
    let pollAttempts = 0
    const maxPollAttempts = 30 // Poll for 15 seconds total
    let retryCount = 0
    const maxRetries = 2

    // Get REAL chainId from provider (bypass wagmi cache)
    const getRealChainId = async () => {
      try {
        const provider = await connector?.getProvider()
        if (!provider) return null

        const hexChainId = await provider.request({ method: 'eth_chainId' })
        const realChainId = parseInt(hexChainId, 16)
        // console.log('🔍 Real chainId from provider:', { hexChainId, realChainId, wagmiChainId: chainId })
        return realChainId
      } catch (err) {
        console.error('❌ Erro ao obter chainId do provider:', err)
        return null
      }
    }

    // Poll for chainId if not immediately available
    const pollForChainId = async () => {
      if (!mounted) return

      // Get real chainId from provider
      const realChainId = await getRealChainId()

      if (!realChainId) {
        pollAttempts++
        if (pollAttempts < maxPollAttempts) {
          setTimeout(pollForChainId, 500)
        } else {
          console.error('❌ chainId not detected after 5s - possible wallet issue')
          toast.error('Error detecting network. Try disconnecting and reconnecting.')
        }
        return
      }

      // chainId foi detectado, verificar se precisa trocar
      if (realChainId === arcTestnet.id) {
        return
      }

      // Different chainId detected, starting auto-switch...
      attemptSwitch()
    }

    const attemptSwitch = async () => {
      if (!mounted) return

      // Verify again before switching
      const realChainId = await getRealChainId()
      if (realChainId === arcTestnet.id) {
        // console.log('✅ Network already changed')
        return
      }

      // Auto-Switch started

      try {
        await switchChain({ chainId: arcTestnet.id })
        // console.log('✅ Auto-Switch successful!')
        // toast.success('Network switched successfully!')
      } catch (err) {
        console.warn(`⚠️ Auto - Switch Error(Attempt ${retryCount + 1}): `, err)

        // Ignora rejeição do usuário
        if (err.code === 4001 || err.message?.includes('rejected')) {
          // console.log('❌ User rejected network switch')
          return
        }

        // Fallback para Raw Switch na última tentativa
        if (retryCount >= maxRetries) {
          // console.log("🔧 Tentando Fallback Raw Switch...")
          const success = await attemptRawSwitch()
          if (!success) {
            toast.error('Could not switch to Arc Testnet. Please switch manually.', { duration: 5000 })
          }
        } else {
          retryCount++
          // console.log(`⏳ Aguardando 1.5s para próxima tentativa...`)
          setTimeout(attemptSwitch, 1500)
        }
      }
    }

    // Start polling
    pollForChainId()

    return () => {
      mounted = false
    }
  }, [isConnected, chainId, switchChain, connector])

  // Check if on correct network
  const isCorrectNetwork = chainId === arcTestnet.id

  const isActive = (path) => location.pathname === path

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo + Links */}
            <div className="flex items-center gap-12">
              <Link to="/" className="flex items-center gap-3 group">
                {/* Logo Icon - Modern Invoice Design */}
                <div className="relative w-10 h-10">
                  {/* Outer glow */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 opacity-20 blur-lg group-hover:opacity-30 transition-opacity"></div>
                  {/* Main logo */}
                  <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Invoice icon */}
                      <path d="M9 3H4C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M7 12H13M7 16H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M14 3H21L14 10V3Z" fill="currentColor" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">Arc Invoice</span>
                  <span className="text-xs font-medium text-gray-400 tracking-wider uppercase">Payment Links</span>
                </div>
              </Link>

              <div className="hidden md:flex items-center gap-8">
                <Link
                  to="/"
                  className={`text-sm font-medium transition ${isActive('/') ? 'text-white' : 'text-gray-400 hover:text-white'
                    } `}
                >
                  Home
                </Link>
                <Link
                  to="/como-funciona"
                  className={`text-sm font-medium transition ${isActive('/como-funciona') ? 'text-white' : 'text-gray-400 hover:text-white'
                    } `}
                >
                  How It Works
                </Link>
                <Link
                  to="/faq"
                  className={`text-sm font-medium transition ${isActive('/faq') ? 'text-white' : 'text-gray-400 hover:text-white'
                    } `}
                >
                  FAQ
                </Link>
                <Link
                  to="/activity"
                  className={`text-sm font-medium transition relative ${isActive('/activity') ? 'text-white' : 'text-gray-400 hover:text-white'
                    } `}
                >
                  Activity
                  {notificationCount > 0 && (
                    <span className="relative group/notify">
                      {/* Badge Circle */}
                      <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] flex items-center justify-center bg-amber-500 text-white text-[10px] font-bold rounded-full px-1 animate-pulse border border-slate-900">
                        {notificationCount}
                      </span>

                      {/* Premium Custom Tooltip */}
                      <div className="absolute top-0 left-full ml-6 opacity-0 group-hover/notify:opacity-100 pointer-events-none transition-all duration-200 z-50">
                        {/* Glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg blur-md"></div>

                        {/* Tooltip Card */}
                        <div className="relative flex items-center justify-center px-3 py-2 bg-slate-900/95 backdrop-blur-md border border-yellow-500/40 rounded-lg shadow-xl shadow-yellow-500/10">
                          {/* Text - Centered */}
                          <span className="text-xs font-semibold text-white whitespace-nowrap">
                            {notificationCount} Pending Invoice{notificationCount !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Arrow Pointer (Left side) */}
                        <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 border-l border-b border-yellow-500/40 transform rotate-45"></div>
                      </div>
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Botões Direita */}
            <div className="flex items-center gap-3">
              {/* Faucet Button */}
              <div className="relative">
                <Link
                  to="/faucet"
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition flex items-center gap-2"
                >
                  💧 Faucet
                </Link>
              </div>

              {/* Wallet Button */}
              {isConnected ? (
                <button
                  onClick={() => {
                    // Force disconnect all connectors to prevent auto-reconnect to another wallet
                    connectors.forEach(c => {
                      try {
                        disconnect({ connector: c })
                      } catch (e) {
                        console.error('Error disconnecting connector:', e)
                      }
                    })
                    // Ensure local state is cleared too (fallback)
                    disconnect()
                  }}
                  className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition"
                >
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </button>
              ) : (
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="px-4 md:px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Wallet Modal */}
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        connectors={connectors}
        onSelectWallet={handleWalletSelect}
      />
    </>
  )
}
