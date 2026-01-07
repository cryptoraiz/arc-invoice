import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import AnimatedBackground from './AnimatedBackground'
import { Toaster } from 'sonner'

export default function Layout({ children }) {
  return (
    <div className="bg-slate-950 text-white flex flex-col relative w-full min-h-screen">
      <Toaster position="bottom-right" theme="dark" richColors />
      <AnimatedBackground />
      <div className="flex-none z-50">
        <Navbar />
      </div>
      <main className="flex-1 relative z-10 w-full flex flex-col">
        {children}
      </main>
      <div className="flex-none z-40">
        <Footer />
      </div>
    </div>
  )
}
