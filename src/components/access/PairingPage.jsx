import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '../../contexts/AuthContext'

export default function PairingPage() {
  const { API_BASE, apiFetch } = useAuth()
  const [pairings, setPairings] = useState([])
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const loadPairings = async () => {
    const response = await apiFetch(`${API_BASE}/pairing/pairings`)
    if (response.ok) setPairings((await response.json()).pairings)
  }

  useEffect(() => {
    loadPairings()
    // apiFetch é recriado pelo contexto; API_BASE é a dependência efetiva.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE])

  const sendInvite = async (event) => {
    event.preventDefault(); setLoading(true); setError(''); setMessage('')
    const response = await apiFetch(`${API_BASE}/pairing/invites`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recipient_email: email }) })
    const data = await response.json()
    if (response.ok) {
      setMessage(data.development_code ? `Convite criado para teste. Código: ${data.development_code}` : 'Convite enviado por e-mail. Ele expira em 15 minutos.')
      setEmail('')
    } else setError(data.error || 'Não foi possível enviar o convite.')
    setLoading(false)
  }

  const acceptInvite = async (event) => {
    event.preventDefault(); setLoading(true); setError(''); setMessage('')
    const response = await apiFetch(`${API_BASE}/pairing/invites/accept`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pairing_code: code.trim() }) })
    const data = await response.json()
    if (response.ok) { setMessage('Pareamento aceito. Nenhum dado foi compartilhado automaticamente.'); setCode(''); await loadPairings() }
    else setError(data.error || 'Código inválido ou expirado.')
    setLoading(false)
  }

  const changePairing = async (id, action) => {
    setLoading(true); setError('')
    const response = await apiFetch(`${API_BASE}/pairing/pairings/${id}/${action}`, { method: 'POST' })
    const data = await response.json()
    if (response.ok) { setMessage(action === 'block' ? 'Pareamento bloqueado.' : 'Pareamento revogado.'); await loadPairings() }
    else setError(data.error || 'Não foi possível atualizar o pareamento.')
    setLoading(false)
  }

  return (
    <div className="space-y-6 pb-8">
      <div><h1 className="text-3xl font-bold text-gray-900">Pareamento seguro</h1><p className="mt-1 text-gray-600">Conecte-se somente com uma pessoa que você conhece. O pareamento não libera dados automaticamente.</p></div>
      <Card className="border-blue-200 bg-blue-50"><CardContent className="pt-5 text-sm text-blue-950">O convite expira em 15 minutos, só pode ser usado uma vez e chega por e-mail. Mesmo depois de aceitar, qualquer acesso depende de outra solicitação, motivo e aprovação.</CardContent></Card>
      <Card><CardHeader><CardTitle>Enviar convite</CardTitle></CardHeader><CardContent><form onSubmit={sendInvite} className="space-y-3"><Label htmlFor="invite-email">E-mail da pessoa</Label><Input id="invite-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="pessoa@exemplo.com" /><Button type="submit" disabled={loading}>Enviar convite temporário</Button></form></CardContent></Card>
      <Card><CardHeader><CardTitle>Aceitar convite</CardTitle></CardHeader><CardContent><form onSubmit={acceptInvite} className="space-y-3"><Label htmlFor="pairing-code">Código recebido por e-mail</Label><Input id="pairing-code" value={code} onChange={(event) => setCode(event.target.value)} required autoComplete="one-time-code" /><Button type="submit" disabled={loading}>Aceitar pareamento</Button></form></CardContent></Card>
      <Card><CardHeader><CardTitle>Meus pareamentos</CardTitle></CardHeader><CardContent className="space-y-3">{pairings.length ? pairings.map((item) => <div key={item.id} className="rounded-lg border p-4"><p className="font-medium">{item.other_alias || 'Pessoa pareada'}</p><p className="text-sm text-gray-600">Status: {item.status} · Nenhum acesso automático a dados</p>{item.status === 'active' && <div className="mt-3 flex gap-2"><Button size="sm" variant="outline" onClick={() => changePairing(item.id, 'revoke')} disabled={loading}>Revogar</Button><Button size="sm" variant="destructive" onClick={() => changePairing(item.id, 'block')} disabled={loading}>Bloquear</Button></div>}</div>) : <p className="text-sm text-gray-600">Nenhum pareamento ativo.</p>}</CardContent></Card>
      {(message || error) && <p role="status" className={`rounded-md p-3 text-sm ${error ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>{error || message}</p>}
    </div>
  )
}
