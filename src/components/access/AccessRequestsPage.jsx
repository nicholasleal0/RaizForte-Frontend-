import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useAuth } from '../../contexts/AuthContext'

export default function AccessRequestsPage() {
  const { API_BASE, apiFetch } = useAuth()
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] })
  const [form, setForm] = useState({ subject_id: '', scope: 'written', reason: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const loadRequests = async () => {
    const response = await apiFetch(`${API_BASE}/access/requests`)
    if (response.ok) setRequests(await response.json())
  }

  useEffect(() => {
    loadRequests()
    // API_BASE é a dependência efetiva; apiFetch vem do contexto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE])

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true); setError(''); setMessage('')
    const response = await apiFetch(`${API_BASE}/access/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, subject_id: Number(form.subject_id) })
    })
    const data = await response.json()
    if (response.ok) {
      setMessage('Solicitação enviada. A outra pessoa precisa decidir; nenhum dado foi liberado agora.')
      setForm({ subject_id: '', scope: 'written', reason: '' })
      await loadRequests()
    } else setError(data.error || 'Não foi possível enviar a solicitação.')
    setLoading(false)
  }

  const decide = async (id, status) => {
    setLoading(true); setError('')
    const response = await apiFetch(`${API_BASE}/access/requests/${id}/decision`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    const data = await response.json()
    if (response.ok) { setMessage(status === 'approved' ? 'Acesso mínimo aprovado.' : 'Solicitação recusada.'); await loadRequests() }
    else setError(data.error || 'Não foi possível decidir.')
    setLoading(false)
  }

  const revoke = async (id) => {
    setLoading(true); setError('')
    const response = await apiFetch(`${API_BASE}/access/requests/${id}/revoke`, { method: 'POST' })
    const data = await response.json()
    if (response.ok) { setMessage('Acesso revogado imediatamente.'); await loadRequests() }
    else setError(data.error || 'Não foi possível revogar.')
    setLoading(false)
  }

  const RequestCard = ({ item, incoming }) => (
    <div className="rounded-lg border p-4">
      <p className="text-sm"><strong>{incoming ? 'Solicitante' : 'Destinatário'}:</strong> #{incoming ? item.requester_id : item.subject_id}</p>
      <p className="text-sm"><strong>Escopo:</strong> {item.scope === 'written' ? 'Dados escritos' : 'Descrição de imagem'}</p>
      <p className="mt-2 text-sm text-gray-700"><strong>Motivo:</strong> {item.reason}</p>
      <p className="mt-2 text-xs text-gray-500">Status: {item.status} · Acesso a arquivos brutos: não</p>
      {incoming && item.status === 'pending' && <div className="mt-3 flex gap-2"><Button size="sm" onClick={() => decide(item.id, 'approved')} disabled={loading}>Aprovar escopo mínimo</Button><Button size="sm" variant="outline" onClick={() => decide(item.id, 'denied')} disabled={loading}>Recusar</Button></div>}
      {!incoming && item.status === 'approved' && <Button size="sm" variant="outline" className="mt-3" onClick={() => revoke(item.id)} disabled={loading}>Revogar acesso</Button>}
    </div>
  )

  return (
    <div className="space-y-6 pb-8">
      <div><h1 className="text-3xl font-bold text-gray-900">Permissões de acesso</h1><p className="mt-1 text-gray-600">Ninguém acessa dados de outra pessoa sem solicitação, motivo e decisão explícita.</p></div>
      <Card className="border-amber-200 bg-amber-50"><CardContent className="pt-5 text-sm text-amber-950">O Raiz Forte não libera vídeos, fotos, documentos ou arquivos brutos. Os únicos escopos possíveis são texto escrito e descrição de imagem.</CardContent></Card>
      <Card><CardHeader><CardTitle>Solicitar acesso mínimo</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="space-y-4"><div><Label htmlFor="subject-id">ID interno da pessoa</Label><Input id="subject-id" type="number" min="1" value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} required /></div><div><Label htmlFor="scope">Escopo</Label><select id="scope" value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="written">Somente dados escritos</option><option value="image_description">Somente descrição de imagem</option></select></div><div><Label htmlFor="reason">Motivo obrigatório</Label><Textarea id="reason" minLength={20} maxLength={1000} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Explique por que esse acesso mínimo é necessário" required /></div><Button type="submit" disabled={loading}>Enviar solicitação</Button></form></CardContent></Card>
      <Card><CardHeader><CardTitle>Recebidas</CardTitle></CardHeader><CardContent className="space-y-3">{requests.incoming.length ? requests.incoming.map((item) => <RequestCard key={item.id} item={item} incoming />) : <p className="text-sm text-gray-600">Nenhuma solicitação recebida.</p>}</CardContent></Card>
      <Card><CardHeader><CardTitle>Enviadas</CardTitle></CardHeader><CardContent className="space-y-3">{requests.outgoing.length ? requests.outgoing.map((item) => <RequestCard key={item.id} item={item} />) : <p className="text-sm text-gray-600">Nenhuma solicitação enviada.</p>}</CardContent></Card>
      {(message || error) && <p className={`rounded-md p-3 text-sm ${error ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>{error || message}</p>}
    </div>
  )
}
