import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, HeartHandshake, Lock, ShieldAlert } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const supportOptions = [
  ['spiritual', 'Apoio espiritual', 'Quero conversar com alguém da fé, sem julgamento.'],
  ['psychological', 'Apoio psicológico', 'Preciso encontrar orientação de saúde mental.'],
  ['medical', 'Apoio médico', 'Preciso de ajuda para encontrar atendimento de saúde.'],
  ['legal', 'Orientação jurídica', 'Quero entender caminhos de proteção e orientação jurídica.'],
  ['social', 'Apoio social', 'Preciso de ajuda com proteção, família ou serviços sociais.'],
  ['abuse', 'Situação de abuso', 'Quero relatar ou buscar apoio em uma situação de abuso.'],
  ['urgent', 'Preciso de ajuda urgente', 'Estou com medo ou em uma situação que exige atenção.']
]

const reportOptions = [
  ['harassment', 'Assédio'],
  ['abuse', 'Abuso'],
  ['grooming', 'Aproximação inadequada'],
  ['self_harm', 'Risco de autoagressão'],
  ['privacy', 'Privacidade'],
  ['other', 'Outro']
]

export default function SupportCenterPage() {
  const { API_BASE } = useAuth()
  const [status, setStatus] = useState(null)
  const [supportForm, setSupportForm] = useState({
    category: 'spiritual',
    urgency: 'normal',
    message: '',
    consent_to_share: false
  })
  const [reportForm, setReportForm] = useState({
    category: 'other',
    urgency: 'normal',
    description: ''
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/safety/status`)
        if (response.ok) setStatus(await response.json())
      } catch {
        setError('Não foi possível carregar as orientações de proteção.')
      }
    }
    loadStatus()
  }, [API_BASE])

  const submit = async (endpoint, body, successMessage, reset) => {
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch(`${API_BASE}/safety/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Não foi possível enviar agora.')
        return
      }
      setMessage(successMessage)
      reset()
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const submitSupport = (event) => {
    event.preventDefault()
    submit(
      'support-requests',
      supportForm,
      'Seu pedido foi recebido. Você não precisa enfrentar isso sozinho.',
      () => setSupportForm({ ...supportForm, message: '' })
    )
  }

  const submitReport = (event) => {
    event.preventDefault()
    submit(
      'reports',
      reportForm,
      'Sua denúncia foi recebida pela equipe de proteção.',
      () => setReportForm({ ...reportForm, description: '' })
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-start gap-3">
        <HeartHandshake className="mt-1 h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Central de Acolhimento</h1>
          <p className="mt-1 text-gray-600">Você pode pedir ajuda sem julgamento e no seu tempo.</p>
        </div>
      </div>

      <Card className="border-amber-300 bg-amber-50">
        <CardContent className="flex gap-3 pt-6 text-amber-950">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm">
            {status?.emergency_notice || 'Se houver perigo imediato, procure ajuda local de emergência, um adulto de confiança ou uma autoridade de proteção. A plataforma não substitui emergência.'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Como podemos acolher você?</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {supportOptions.map(([value, title, description]) => (
            <button
              key={value}
              type="button"
              onClick={() => setSupportForm((current) => ({ ...current, category: value }))}
              className={`rounded-lg border p-4 text-left transition ${supportForm.category === value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
            >
              <strong className="block text-gray-900">{title}</strong>
              <span className="mt-1 block text-sm text-gray-600">{description}</span>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fazer um pedido de acolhimento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitSupport} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="support-category">Categoria</Label>
                <select id="support-category" value={supportForm.category} onChange={(event) => setSupportForm({ ...supportForm, category: event.target.value })} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {supportOptions.map(([value, title]) => <option key={value} value={value}>{title}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="support-urgency">Urgência</Label>
                <select id="support-urgency" value={supportForm.urgency} onChange={(event) => setSupportForm({ ...supportForm, urgency: event.target.value })} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="normal">Posso aguardar</option>
                  <option value="high">Preciso de atenção em breve</option>
                  <option value="critical">Estou em risco ou com muito medo</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="support-message">Conte apenas o que se sentir confortável em compartilhar</Label>
              <Textarea id="support-message" value={supportForm.message} onChange={(event) => setSupportForm({ ...supportForm, message: event.target.value })} placeholder="Escreva como podemos ajudar..." required minLength={10} maxLength={5000} />
            </div>
            <label className="flex items-start gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={supportForm.consent_to_share} onChange={(event) => setSupportForm({ ...supportForm, consent_to_share: event.target.checked })} />
              Autorizo o compartilhamento mínimo dessas informações com uma rede de apoio verificada quando isso for necessário para o encaminhamento.
            </label>
            <Button type="submit" disabled={loading}>Enviar pedido com segurança</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5" /> Denunciar uma situação</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitReport} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="report-category">Tipo de situação</Label>
                <select id="report-category" value={reportForm.category} onChange={(event) => setReportForm({ ...reportForm, category: event.target.value })} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {reportOptions.map(([value, title]) => <option key={value} value={value}>{title}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="report-urgency">Urgência</Label>
                <select id="report-urgency" value={reportForm.urgency} onChange={(event) => setReportForm({ ...reportForm, urgency: event.target.value })} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="report-description">O que aconteceu?</Label>
              <Textarea id="report-description" value={reportForm.description} onChange={(event) => setReportForm({ ...reportForm, description: event.target.value })} placeholder="Descreva a situação sem incluir dados desnecessários." required minLength={10} maxLength={5000} />
            </div>
            <Button type="submit" variant="destructive" disabled={loading}>Enviar denúncia</Button>
          </form>
        </CardContent>
      </Card>

      {(message || error) && <div className={`rounded-md border px-4 py-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'}`}>{error || message}</div>}

      <Card className="bg-slate-50">
        <CardContent className="flex gap-3 pt-6 text-sm text-gray-700">
          <Lock className="h-5 w-5 shrink-0 text-slate-600" />
          <p>Não compartilhe senhas, endereço completo ou localização exata. O Raiz Forte conecta você a apoio, mas não substitui atendimento médico, psicológico, jurídico ou serviços de emergência.</p>
        </CardContent>
      </Card>

      <Link to="/home" className="block text-center text-sm text-blue-600 hover:underline">Voltar para o início</Link>
    </div>
  )
}
