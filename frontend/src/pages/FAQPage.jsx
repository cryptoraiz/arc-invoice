import { useState } from 'react'
import FAQItem from '../components/ui/FAQItem'

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: 'O que é USDC/EURC?',
      answer: 'Stablecoins (moedas estáveis) emitidas pela Circle. 1 USDC = $1 USD e 1 EURC = €1 EUR. Mantêm valor estável 1:1 com moedas tradicionais.'
    },
    {
      question: 'Quanto custa usar o Arc Invoice?',
      answer: 'Grátis para criar links! Você paga apenas a taxa de rede da Arc: ~$0.001 USDC (um décimo de centavo) por transação. Sem mensalidades ou taxas escondidas.'
    },
    {
      question: 'Preciso de uma wallet cripto?',
      answer: 'Sim, você precisa de uma wallet Web3 compatível com Arc Network (ex: MetaMask, Rabby, Coinbase Wallet) para receber os pagamentos.'
    },
    {
      question: 'Como meu cliente paga?',
      answer: 'O cliente pode pagar de 2 formas:\n\n• Desktop: Clica no link e conecta sua wallet (MetaMask, Rabby, etc)\n\n• Mobile: Escaneia o QR Code com app de carteira mobile\n\nConfirmação instantânea em ambos os casos!'
    },
    {
      question: 'É seguro?',
      answer: 'Totalmente! Transações verificadas on-chain na Arc Network. Você tem controle total dos seus fundos. Sem intermediários, sem custódia.'
    },
    {
      question: 'Os links de pagamento expiram?',
      answer: 'Sim! Por segurança, cada link expira em 24 horas após criação. Você pode criar novos links a qualquer momento, de forma grátis e instantânea.'
    },
    {
      question: 'Onde vejo meu histórico?',
      answer: 'Na aba "Histórico" você vê todos os links criados, pagamentos recebidos e enviados. Pode baixar comprovantes em PDF e limpar dados quando quiser.'
    },
    {
      question: 'Quanto tempo leva?',
      answer: 'Criar o link: ~5 segundos. Pagamento confirmado: < 1 segundo após o cliente aprovar. É instantâneo!'
    },
    {
      question: 'Tem limite de valor?',
      answer: 'Não há limite mínimo ou máximo imposto pelo Arc Invoice. Os limites dependem apenas da sua wallet e saldo do cliente.'
    }
  ]

  return (
    <section className="flex-1 flex items-center justify-center p-4 md:p-6 h-full min-h-0">
      <div className="w-full max-w-6xl mx-auto space-y-6 h-full flex flex-col justify-center">
        {/* Hero Compacto */}
        <div className="relative text-center space-y-2 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/20 rounded-full blur-[50px] pointer-events-none"></div>
          <h1 className="relative text-3xl md:text-4xl font-black">
            Dúvidas? <span className="gradient-text">Respondemos aqui</span>
          </h1>
        </div>

        {/* FAQs em Coluna Única */}
        <div
          className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent opacity-0 animate-[slideDown_0.5s_ease-out_0.2s_forwards] space-y-4 max-w-3xl mx-auto w-full"
          style={{ animationFillMode: 'forwards' }}
        >
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        {/* Call to Action Compacto */}
        <div className="text-center py-3 border-t border-white/5 opacity-0 animate-[fadeIn_0.5s_ease-out_0.4s_forwards]" style={{ animationFillMode: 'forwards' }}>
          <p className="text-xs text-gray-400">
            Ainda tem dúvidas? Fale conosco pelos canais oficiais.
          </p>
        </div>
      </div>
    </section>
  )
}
