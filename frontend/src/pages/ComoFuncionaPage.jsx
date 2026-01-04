export default function ComoFuncionaPage() {
  return (
    <section className="flex-1 flex items-center justify-center p-4 md:p-6 h-full min-h-0">
      <div className="w-full max-w-7xl mx-auto space-y-8 h-full flex flex-col justify-center">
        {/* Hero Compacto */}
        <div className="relative text-center space-y-3 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/20 rounded-full blur-[50px] pointer-events-none"></div>
          <div className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
            <span className="text-xs font-semibold text-blue-400">Como Funciona</span>
          </div>
          <h1 className="relative text-4xl md:text-5xl font-black">
            Simples em <span className="gradient-text">3 passos</span>
          </h1>
          <p className="relative text-sm text-gray-400 max-w-2xl mx-auto">
            Do formulário ao recebimento instantâneo, tudo acontece em segundos.
          </p>
        </div>

        {/* Grid 3 Passos */}
        <div className="grid md:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Passo 1 */}
          <div
            className="relative group opacity-0 animate-[slideDown_0.5s_ease-out_0.2s_forwards]"
            style={{ animationFillMode: 'forwards' }}
          >
            <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative h-full p-6 rounded-2xl bg-white/[0.02] border border-white/10 group-hover:border-blue-500/30 group-hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-500/50 mb-4 group-hover:scale-110 transition-transform duration-300">
                1
              </div>
              <h3 className="text-2xl font-black mb-2">Crie o Link</h3>
              <p className="text-sm text-gray-400 mb-4">
                Preencha nome, wallet e valor desejado em USDC ou EURC.
              </p>
              <div className="space-y-2 mt-auto">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-blue-400">✓</span>
                  <span className="text-gray-300">Formulário intuitivo</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-blue-400">✓</span>
                  <span className="text-gray-300">Validação automática</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-blue-400">✓</span>
                  <span className="text-gray-300">Link em segundos</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-blue-400">✓</span>
                  <span className="text-gray-300">Válido por 24h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Passo 2 */}
          <div
            className="relative group opacity-0 animate-[slideDown_0.5s_ease-out_0.4s_forwards]"
            style={{ animationFillMode: 'forwards' }}
          >
            <div className="absolute inset-0 bg-cyan-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative h-full p-6 rounded-2xl bg-white/[0.02] border border-white/10 group-hover:border-cyan-500/30 group-hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-2xl font-black shadow-lg shadow-cyan-500/50 mb-4 group-hover:scale-110 transition-transform duration-300">
                2
              </div>
              <h3 className="text-2xl font-black mb-2">Compartilhe</h3>
              <p className="text-sm text-gray-400 mb-4">
                Envie o link gerado para seu cliente via WhatsApp, Telegram, email ou redes sociais.
              </p>
              <div className="space-y-2 mt-auto">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-cyan-400">✓</span>
                  <span className="text-gray-300">Link único e seguro</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-cyan-400">✓</span>
                  <span className="text-gray-300">Compartilhe onde quiser</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-cyan-400">✓</span>
                  <span className="text-gray-300">QR Code para mobile</span>
                </div>
              </div>
            </div>
          </div>

          {/* Passo 3 */}
          <div
            className="relative group opacity-0 animate-[slideDown_0.5s_ease-out_0.6s_forwards]"
            style={{ animationFillMode: 'forwards' }}
          >
            <div className="absolute inset-0 bg-green-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative h-full p-6 rounded-2xl bg-white/[0.02] border border-white/10 group-hover:border-green-500/30 group-hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-2xl font-black shadow-lg shadow-green-500/50 mb-4 group-hover:scale-110 transition-transform duration-300">
                3
              </div>
              <h3 className="text-2xl font-black mb-2">Receba na Hora</h3>
              <p className="text-sm text-gray-400 mb-4">
                Cliente paga e você recebe USDC/EURC direto na sua wallet em menos de 1 segundo.
              </p>
              <div className="space-y-2 mt-auto">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Confirmação &lt; 1s</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Notificação automática</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Taxa mínima ($0.001)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Sem chargebacks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
