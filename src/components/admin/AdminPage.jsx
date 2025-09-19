import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Users, 
  UserPlus, 
  Shield, 
  Eye, 
  EyeOff, 
  Ban, 
  UserX, 
  CheckCircle, 
  XCircle,
  Settings,
  Key,
  UserCheck,
  AlertTriangle
} from 'lucide-react'

export default function AdminPage() {
  const { user, API_BASE } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Estados para diferentes seções
  const [admins, setAdmins] = useState([])
  const [users, setUsers] = useState([])
  const [mentors, setMentors] = useState([])
  const [pendingMentors, setPendingMentors] = useState([])
  const [logs, setLogs] = useState([])
  
  // Estados para formulários
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminName, setNewAdminName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [actionReason, setActionReason] = useState('')

  useEffect(() => {
    if (user?.user_type === 'admin') {
      loadAdmins()
      loadUsers()
      loadMentors()
      loadLogs()
    }
  }, [user])

  const loadAdmins = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/admins`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setAdmins(data.admins)
      }
    } catch (error) {
      console.error('Erro ao carregar admins:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/users`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    }
  }

  const loadMentors = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/mentors`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setPendingMentors(data.pending_mentors || [])
      }
    } catch (error) {
      console.error('Erro ao carregar mentores:', error)
    }
  }

  const loadLogs = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/logs`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
    }
  }

  const createAdmin = async () => {
    if (!newAdminEmail) {
      setError('Email é obrigatório')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_BASE}/admin/create-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: newAdminEmail,
          display_name: newAdminName || 'Administrador'
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Administrador criado com sucesso! Senha padrão: 1234')
        setNewAdminEmail('')
        setNewAdminName('')
        loadAdmins()
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Erro ao criar administrador')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async () => {
    if (!newPassword) {
      setError('Nova senha é obrigatória')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_BASE}/admin/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          new_password: newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Senha redefinida com sucesso!')
        setNewPassword('')
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Erro ao redefinir senha')
    } finally {
      setLoading(false)
    }
  }

  const switchProfile = async (userType) => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_BASE}/admin/switch-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          user_type: userType
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`Perfil alterado para ${userType}`)
        // Recarregar a página para atualizar o contexto
        window.location.reload()
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Erro ao alterar perfil')
    } finally {
      setLoading(false)
    }
  }

  const restoreAdmin = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_BASE}/admin/restore-admin`, {
        method: 'POST',
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Perfil de administrador restaurado')
        // Recarregar a página para atualizar o contexto
        window.location.reload()
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Erro ao restaurar perfil de admin')
    } finally {
      setLoading(false)
    }
  }

  const blockUser = async (userId) => {
    if (!actionReason) {
      setError('Motivo é obrigatório')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_BASE}/admin/block-user/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          reason: actionReason
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Usuário bloqueado com sucesso')
        setActionReason('')
        setSelectedUser(null)
        loadUsers()
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Erro ao bloquear usuário')
    } finally {
      setLoading(false)
    }
  }

  const suspendUser = async (userId) => {
    if (!actionReason) {
      setError('Motivo é obrigatório')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_BASE}/admin/suspend-user/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          reason: actionReason
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Usuário suspenso com sucesso')
        setActionReason('')
        setSelectedUser(null)
        loadUsers()
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Erro ao suspender usuário')
    } finally {
      setLoading(false)
    }
  }

  const approveMentor = async (mentorId) => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_BASE}/admin/approve-mentor/${mentorId}`, {
        method: 'POST',
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Mentor aprovado com sucesso')
        loadMentors()
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Erro ao aprovar mentor')
    } finally {
      setLoading(false)
    }
  }

  const rejectMentor = async (mentorId) => {
    if (!actionReason) {
      setError('Motivo é obrigatório')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_BASE}/admin/reject-mentor/${mentorId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          reason: actionReason
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Mentor rejeitado')
        setActionReason('')
        setSelectedUser(null)
        loadMentors()
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Erro ao rejeitar mentor')
    } finally {
      setLoading(false)
    }
  }

  if (user?.user_type !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
              <p className="text-gray-600">
                Você não tem permissão para acessar esta página.
              </p>
              {user?.user_type && user.user_type !== 'admin' && (
                <Button 
                  onClick={restoreAdmin}
                  className="mt-4"
                  disabled={loading}
                >
                  Restaurar Perfil de Admin
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Administração</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => switchProfile('mentor')}
            disabled={loading}
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Ver como Mentor
          </Button>
          <Button 
            variant="outline" 
            onClick={() => switchProfile('young')}
            disabled={loading}
          >
            <Users className="w-4 h-4 mr-2" />
            Ver como Jovem
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="admins">Administradores</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="mentors">Mentores</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mentores Pendentes</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingMentors.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Administradores</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{admins.length}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Administrador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="admin@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="admin-name">Nome de Exibição</Label>
                <Input
                  id="admin-name"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="Nome do Administrador"
                />
              </div>
              <Button onClick={createAdmin} disabled={loading}>
                <UserPlus className="w-4 h-4 mr-2" />
                Criar Administrador
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Administradores Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {admins.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{admin.display_name}</div>
                      <div className="text-sm text-gray-500">{admin.email}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={admin.is_online ? "default" : "secondary"}>
                        {admin.is_online ? "Online" : "Offline"}
                      </Badge>
                      {admin.email === 'nicholasleal.nl@gmail.com' && (
                        <Badge variant="outline">Principal</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuários Registrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {users.filter(u => u.user_type !== 'admin').map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{user.display_name || user.email}</div>
                      <div className="text-sm text-gray-500">
                        {user.email} • {user.user_type}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.is_online ? "default" : "secondary"}>
                        {user.is_online ? "Online" : "Offline"}
                      </Badge>
                      {user.is_blocked && <Badge variant="destructive">Bloqueado</Badge>}
                      {user.is_suspended && <Badge variant="destructive">Suspenso</Badge>}
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            Ações
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Ações para {user.display_name || user.email}</DialogTitle>
                            <DialogDescription>
                              Selecione uma ação para este usuário
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="reason">Motivo</Label>
                              <Textarea
                                id="reason"
                                value={actionReason}
                                onChange={(e) => setActionReason(e.target.value)}
                                placeholder="Descreva o motivo da ação"
                              />
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="destructive" 
                                onClick={() => blockUser(user.id)}
                                disabled={loading}
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                Bloquear
                              </Button>
                              <Button 
                                variant="destructive" 
                                onClick={() => suspendUser(user.id)}
                                disabled={loading}
                              >
                                <UserX className="w-4 h-4 mr-2" />
                                Suspender
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mentors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mentores Pendentes de Aprovação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingMentors.map((mentor) => (
                  <div key={mentor.id} className="p-4 border rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{mentor.full_name}</div>
                        <div className="text-sm text-gray-500">{mentor.email}</div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => approveMentor(mentor.id)}
                          disabled={loading}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Aprovar
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => setSelectedUser(mentor)}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Rejeitar
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Rejeitar Mentor</DialogTitle>
                              <DialogDescription>
                                Informe o motivo da rejeição
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="reject-reason">Motivo</Label>
                                <Textarea
                                  id="reject-reason"
                                  value={actionReason}
                                  onChange={(e) => setActionReason(e.target.value)}
                                  placeholder="Descreva o motivo da rejeição"
                                />
                              </div>
                              <Button 
                                variant="destructive" 
                                onClick={() => rejectMentor(mentor.id)}
                                disabled={loading}
                              >
                                Confirmar Rejeição
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    {mentor.bio && (
                      <div className="text-sm text-gray-600">
                        <strong>Bio:</strong> {mentor.bio}
                      </div>
                    )}
                    {mentor.church && (
                      <div className="text-sm text-gray-600">
                        <strong>Igreja:</strong> {mentor.church}
                      </div>
                    )}
                  </div>
                ))}
                {pendingMentors.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Nenhum mentor pendente de aprovação
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Redefinir Senha</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                />
              </div>
              <Button onClick={resetPassword} disabled={loading}>
                <Key className="w-4 h-4 mr-2" />
                Redefinir Senha
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Ações Administrativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logs.slice(0, 20).map((log) => (
                  <div key={log.id} className="p-3 border rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{log.action_type}</div>
                        <div className="text-sm text-gray-500">{log.description}</div>
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
                {logs.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Nenhum log encontrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

