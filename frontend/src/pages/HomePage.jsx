import PaymentForm from '../components/forms/PaymentForm'
import { useAccount } from 'wagmi'

export default function HomePage() {
  const { isConnected } = useAccount()

  return (
    <section className="flex-1 flex flex-col items-center justify-center py-6 w-full px-4 lg:px-6 min-h-0">
      <div className="flex flex-col lg:flex-row items-center w-full max-w-7xl mx-auto gap-12 lg:gap-20 transition-all duration-700">

        {/* Coluna Esquerda - Hero (Animada) */}
        <div
          className={`space-y-4 transition-all duration-700 ease-in-out
            ${isConnected
              ? 'w-0 opacity-0 -translate-x-20 overflow-hidden pointer-events-none scale-90 blur-lg'
              : 'w-full lg:w-5/12 opacity-100 translate-x-0 scale-100 blur-0'
            }`}
        >
          {/* Título */}
          <div className="space-y-1 min-w-[300px]"> {/* min-w evita que o texto quebre feio durante a redução de largura */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none">
              Receba pagamentos
              <span className="block">instantâneos</span>
              <span className="gradient-text block mt-1">em USDC & EURC</span>
            </h1>

            <p className="text-base md:text-lg max-h-[800px]:text-base text-gray-400 leading-relaxed lg:max-w-lg transition-all">
              Crie links de pagamento profissionais em segundos. Sem taxas ocultas, sem intermediários. Confirmação em menos de 1 segundo.
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2 min-w-[300px]">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className="text-lg">⚡</span>
              <span className="text-sm font-medium">Instantâneo</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className="text-lg">🛡️</span>
              <span className="text-sm font-medium">On-chain</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className="text-lg">🌍</span>
              <span className="text-sm font-medium">Global</span>
            </div>
          </div>
        </div>

        {/* Coluna Direita - Formulário (Centraliza quando conectado) */}
        <div className={`flex justify-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isConnected ? 'w-full' : 'w-full lg:w-7/12 lg:justify-end'}`}>
          <div className="w-full max-w-xl">
            <PaymentForm />
          </div>
        </div>
      </div>
    </section>
  )
}
