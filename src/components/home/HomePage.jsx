import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default function HomePage() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bem-vindo ao Projeto Raiz Forte
        </h1>
        <p className="text-gray-600">
          Olá, {user?.display_name || user?.email}!
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seu Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Tipo:</strong> {user?.user_type}</p>
            <p><strong>Status:</strong> {user?.is_active ? 'Ativo' : 'Inativo'}</p>
            {user?.user_type === 'mentor' && (
              <p><strong>Aprovado:</strong> {user?.mentor_profile?.is_approved ? 'Sim' : 'Pendente'}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button onClick={handleLogout} variant="outline">
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  )
}

