import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '../../contexts/AuthContext'

export default function ProfilePage() {
  const { user, apiFetch, API_BASE } = useAuth()
  const [displayName, setDisplayName] = useState(user?.display_name || '')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const saveName = async () => {
    setLoading(true)
    const response = await apiFetch(`${API_BASE}/auth/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: displayName })
    })
    const data = await response.json()
    setMessage(response.ok ? 'Nome salvo. Você continua anônimo.' : data.error)
    setLoading(false)
  }

  const changeExposure = async (expose) => {
    if (expose && !window.confirm('Ao sair do anonimato, seu nome e e-mail poderão ser exibidos conforme as regras da plataforma. Deseja continuar?')) return
    setLoading(true)
    const response = await apiFetch(`${API_BASE}/auth/identity-exposure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expose ? { expose: true, confirmation: 'EXPOSE_IDENTITY' } : { expose: false })
    })
    const data = await response.json()
    setMessage(response.ok ? (expose ? 'Você saiu do anonimato.' : 'Seu anonimato foi restaurado.') : data.error)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Perfil</h1>
      <Card>
        <CardHeader><CardTitle>Meu perfil</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
            <strong>{user?.is_anonymous ? 'Anonimato ativo' : 'Identidade exposta por escolha'}</strong>
            <p className="mt-1">O anonimato é a configuração padrão. Você pode restaurá-lo a qualquer momento.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="display-name">Nome de exibição</Label>
            <Input id="display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Escolha como quer ser chamado" />
            <Button onClick={saveName} disabled={loading || displayName.trim().length < 2}>Salvar nome sem sair do anonimato</Button>
          </div>
          <div className="flex flex-wrap gap-3">
            {user?.is_anonymous ? (
              <Button variant="outline" onClick={() => changeExposure(true)} disabled={loading || displayName.trim().length < 2}>Sair do anonimato</Button>
            ) : (
              <Button variant="outline" onClick={() => changeExposure(false)} disabled={loading}>Voltar ao anonimato</Button>
            )}
          </div>
          {message && <p className="text-sm text-gray-700" role="status">{message}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
