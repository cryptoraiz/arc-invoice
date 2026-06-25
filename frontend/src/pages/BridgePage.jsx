import { useState } from 'react'
import { useWalletClient, useAccount } from 'wagmi'
import { getAppKit, createCircleAdapter } from '../config/circleKit'

const SUPPORTED_CHAINS = [
  { id: 'ETH',   label: 'Ethereum',  emoji: '🔷' },
  { id: 'ARB',   label: 'Arbitrum',  emoji: '🔵' },
  { id: 'BASE',  label: 'Base',      emoji: '🔵' },
  { id: 'MATIC', label: 'Polygon',   emoji: '🟣' },
  { id: 'OP',    label: 'Optimism',  emoji: '🔴' },
]

const TOKENS = ['USDC', 'EURC']

export default function BridgePage() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()

  const [fromChain, setFromChain] = useState('ETH')
  const [toChain, setToChain]     = useState('ARB')
  const [tokenIn, setTokenIn]     = useState('USDC')
  const [tokenOut, setTokenOut]   = useState('USDC')
  const [amount, setAmount]       = useState('')
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState(null)
  const [error, setError]         = useState(null)
  const [mode, setMode]           = useState('bridge') // 'bridge' | 'swap'

  const kitKey = import.meta.env.VITE_CIRCLE_KIT_KEY

  async function handleAction() {
    if (!walletClient || !isConnected) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const kit     = getAppKit()
      const adapter = createCircleAdapter(walletClient)

      let res
      if (mode === 'bridge') {
        res = await kit.bridge({ adapter, fromChain, toChain, token: tokenIn, amount, config: { kitKey } })
      } else {
        res = await kit.swap({ adapter, chain: fromChain, tokenIn, tokenOut, amountIn: amount, config: { kitKey } })
      }
      setResult(res)
    } catch (err) {
      setError(err?.message || 'Erro ao processar a transação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex-1 flex flex-col items-center justify-center p-6 lg:p-8 relative overflow-hidden">

      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/8 rounded-full blur-3xl" />
      </div>

      <div className="max-w-lg w-full space-y-8 relative z-10">

        {/* Hero */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl lg:text-6xl font-black gradient-text tracking-tight">
            Bridge & Swap
          </h1>
          <p className="text-base text-gray-400 leading-relaxed">
            Transfira stablecoins entre redes ou troque tokens com a infraestrutura Circle.
          </p>
        </div>

        {/* Card principal */}
        <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-5">

          {/* Toggle Bridge / Swap */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
            {['bridge', 'swap'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === m
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {m === 'bridge' ? '🌉 Bridge' : '🔄 Swap'}
              </button>
            ))}
          </div>

          {!isConnected ? (
            /* Aviso de carteira desconectada */
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl">
                🔗
              </div>
              <p className="text-gray-400 text-sm">
                Conecte sua carteira para usar o <span className="text-white font-semibold">Bridge & Swap</span>
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              {/* Valor */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Valor</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-lg font-semibold"
                />
              </div>

              {/* Token de entrada */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {mode === 'swap' ? 'Token de Entrada' : 'Token'}
                </label>
                <select
                  value={tokenIn}
                  onChange={e => setTokenIn(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  {TOKENS.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                </select>
              </div>

              {/* Rede de Origem */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {mode === 'bridge' ? 'Rede de Origem' : 'Rede'}
                </label>
                <select
                  value={fromChain}
                  onChange={e => setFromChain(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  {SUPPORTED_CHAINS.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900">{c.emoji} {c.label}</option>
                  ))}
                </select>
              </div>

              {/* Rede de Destino (bridge) ou Token de Saída (swap) */}
              {mode === 'bridge' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rede de Destino</label>
                  <select
                    value={toChain}
                    onChange={e => setToChain(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                  >
                    {SUPPORTED_CHAINS.filter(c => c.id !== fromChain).map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900">{c.emoji} {c.label}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Token de Saída</label>
                  <select
                    value={tokenOut}
                    onChange={e => setTokenOut(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                  >
                    {TOKENS.filter(t => t !== tokenIn).map(t => (
                      <option key={t} value={t} className="bg-slate-900">{t}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Resumo da operação */}
              <div className="flex items-center justify-between px-4 py-2 bg-white/3 border border-white/5 rounded-xl text-sm text-gray-400">
                <span>
                  {mode === 'bridge'
                    ? `${tokenIn} • ${SUPPORTED_CHAINS.find(c => c.id === fromChain)?.label} → ${SUPPORTED_CHAINS.find(c => c.id === toChain)?.label}`
                    : `${tokenIn} → ${tokenOut} • ${SUPPORTED_CHAINS.find(c => c.id === fromChain)?.label}`}
                </span>
                <span className="text-blue-400 font-medium">via Circle</span>
              </div>

              {/* Botão */}
              <button
                onClick={handleAction}
                disabled={loading || !amount}
                className="w-full py-4 rounded-xl gradient-button font-bold text-lg text-white shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processando...
                  </>
                ) : mode === 'bridge' ? (
                  <>🌉 Fazer Bridge de {tokenIn}</>
                ) : (
                  <>🔄 Swap {tokenIn} → {tokenOut}</>
                )}
              </button>

              {/* Resultado */}
              {result && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl space-y-1">
                  <p className="text-green-400 font-semibold text-sm">✅ Transação enviada com sucesso!</p>
                  {result.txHash && (
                    <p className="text-xs text-gray-400 font-mono break-all">TX: {result.txHash}</p>
                  )}
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 font-semibold text-sm">❌ {error}</p>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Powered by <span className="text-blue-400 font-medium">Circle AppKit</span>
        </div>

      </div>
    </section>
  )
}
