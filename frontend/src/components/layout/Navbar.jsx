import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useInvoiceNotifications } from '../../hooks/useInvoiceNotifications'

export default function Navbar() {
  const location = useLocation()
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { count: notificationCount } = useInvoiceNotifications()


  const isActive = (path) => location.pathname === path

  return (
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
                  }`}
              >
                Início
              </Link>
              <Link
                to="/como-funciona"
                className={`text-sm font-medium transition ${isActive('/como-funciona') ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
              >
                Como Funciona
              </Link>
              <Link
                to="/faq"
                className={`text-sm font-medium transition ${isActive('/faq') ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
              >
                FAQ
              </Link>
              {isConnected && (
                <Link
                  to="/history"
                  className={`text-sm font-medium transition relative ${isActive('/history') ? 'text-white' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  Histórico
                  {notificationCount > 0 && (
                    <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 animate-pulse">
                      {notificationCount}
                    </span>
                  )}
                </Link>
              )}
            </div>
          </div>

          {/* Botões Direita */}
          <div className="flex items-center gap-3">
            {/* Faucet Button (Agora na Esquerda) */}
            <div className="relative">
              <a
                href="https://faucet.circle.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition flex items-center gap-2"
              >
                💧 Faucet
              </a>
            </div>

            {/* Wallet Button (Agora na Direita) */}
            {isConnected ? (
              <button
                onClick={() => disconnect()}
                className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition"
              >
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </button>
            ) : (
              <button
                onClick={() => connect({ connector: connectors[0] })}
                className="hidden md:block px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition"
              >
                Conectar Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
