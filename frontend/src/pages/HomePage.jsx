import PaymentForm from '../components/forms/PaymentForm'
import { useAccount } from 'wagmi'

export default function HomePage() {
  const { isConnected } = useAccount()

  return (
    <section className="flex-1 flex flex-col items-center justify-start pt-16 md:pt-24 lg:pt-20 w-full">
      <div className="flex flex-col lg:flex-row items-center lg:items-start w-full max-w-7xl mx-auto px-6 gap-10 lg:gap-16 transition-all duration-700">

        {/* Coluna Esquerda - Hero (Animada) */}
        <div
          className={`space-y-6 lg:space-y-8 transition-all duration-700 ease-in-out opacity-0 animate-[fadeIn_0.8s_ease-out_forwards] mt-8 lg:mt-12
            ${isConnected
              ? 'w-0 opacity-0 -translate-x-20 overflow-hidden pointer-events-none scale-90 blur-lg'
              : 'w-full lg:w-5/12 opacity-100 translate-x-0 scale-100 blur-0'
            }`}
        >
          {/* Título */}
          <div className="space-y-4 min-w-[300px]">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none text-white drop-shadow-2xl">
              Receive instant
              <span className="block text-white">payments</span>
              <span className="gradient-text block mt-2 whitespace-nowrap">in USDC & EURC (V2)</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 leading-relaxed lg:max-w-2xl transition-all">
              Create professional payment links in seconds. No hidden fees, no intermediaries. Confirmation in less than 1 second.
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-4 min-w-[300px]">
            <div className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 transition-all cursor-default select-none backdrop-blur-sm shadow-lg shadow-black/20">
              <span className="text-xl group-hover:animate-bounce">⚡</span>
              <span className="text-base font-bold text-gray-200">Instant</span>
            </div>
            <div className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 transition-all cursor-default select-none backdrop-blur-sm shadow-lg shadow-black/20">
              <span className="text-xl group-hover:rotate-12 transition-transform">🛡️</span>
              <span className="text-base font-bold text-gray-200">On-chain</span>
            </div>
            <div className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 transition-all cursor-default select-none backdrop-blur-sm shadow-lg shadow-black/20">
              <span className="text-xl group-hover:spin-slow">🌍</span>
              <span className="text-base font-bold text-gray-200">Global</span>
            </div>
          </div>
        </div>

        {/* Coluna Direita - Formulário */}
        <div className={`flex justify-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] opacity-0 animate-[fadeIn_0.8s_ease-out_0.2s_forwards]
          ${isConnected ? 'w-full' : 'w-full lg:w-7/12 lg:justify-end'}`}>

          <div className="w-full max-w-xl relative">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-50 pointer-events-none"></div>

            {/* Payment Form */}
            <PaymentForm theme="modern" />
          </div>
        </div>

      </div>
    </section>
  )
}
