import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import LoginPage from './components/auth/LoginPage'
import RegisterPage from './components/auth/RegisterPage'
import HomePage from './components/home/HomePage'
import ChatPage from './components/chat/ChatPage'
import ProfilePage from './components/profile/ProfilePage'
import AdminPage from './components/admin/AdminPage'
import LivePage from './components/live/LivePage'
import SupportCenterPage from './components/safety/SupportCenterPage'
import AccessRequestsPage from './components/access/AccessRequestsPage'
import PairingPage from './components/access/PairingPage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Rotas protegidas */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/home" replace />} />
              <Route path="home" element={<HomePage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="admin" element={<AdminPage />} />
              <Route path="live/:roomName" element={<LivePage />} />
              <Route path="support" element={<SupportCenterPage />} />
              <Route path="access-requests" element={<AccessRequestsPage />} />
              <Route path="pairing" element={<PairingPage />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
