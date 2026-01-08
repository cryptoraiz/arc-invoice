import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import ComoFuncionaPage from './pages/ComoFuncionaPage'
import FAQPage from './pages/FAQPage'
import PayPage from './pages/PayPage'
import HistoryPage from './pages/HistoryPage'
import FaucetPage from './pages/FaucetPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/como-funciona" element={<ComoFuncionaPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/faucet" element={<FaucetPage />} />
        <Route path="/pay/:linkId" element={<PayPage />} />
      </Routes>
    </Layout>
  )
}

export default App
