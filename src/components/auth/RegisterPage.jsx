import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, ArrowRight, User, Users, CheckCircle, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const { register, user, API_BASE } = useAuth()
  const navigate = useNavigate()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [niches, setNiches] = useState([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    user_type: '',
    email: '',
    password: '',
    confirmPassword: '',
    is_anonymous: false,
    display_name: '',
    mentorship_group: 'neutral',
    mentor_profile: {
      full_name: '',
      age: '',
      phone: '',
      city: '',
      state: '',
      church: '',
      ministry_area: '',
      experience_years: '',
      bio: '',
      availability: '',
      preferred_contact: 'email',
      niches: []
    }
  })

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user) {
      navigate('/home')
    }
  }, [user, navigate])

  // Carregar nichos
  useEffect(() => {
    const fetchNiches = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/niches`)
        if (response.ok) {
          const data = await response.json()
          setNiches(data.niches)
        }
      } catch (error) {
        console.error('Erro ao carregar nichos:', error)
      }
    }
    fetchNiches()
  }, [API_BASE])

  const handleInputChange = (field, value) => {
    if (field.startsWith('mentor_profile.')) {
      const profileField = field.replace('mentor_profile.', '')
      setFormData(prev => ({
        ...prev,
        mentor_profile: {
          ...prev.mentor_profile,
          [profileField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleNicheToggle = (nicheId) => {
    setFormData(prev => ({
      ...prev,
      mentor_profile: {
        ...prev.mentor_profile,
        niches: prev.mentor_profile.niches.includes(nicheId)
          ? prev.mentor_profile.niches.filter(id => id !== nicheId)
          : [...prev.mentor_profile.niches, nicheId]
      }
    }))
  }

  const validateStep = () => {
    setError('')
    
    if (step === 1) {
      if (!formData.user_type) {
        setError('Selecione o tipo de usuário')
        return false
      }
    }
    
    if (step === 2) {
      if (formData.user_type === 'mentor' && formData.mentor_profile.niches.length === 0) {
        setError('Selecione pelo menos um nicho de mentoria')
        return false
      }
    }
    
    if (step === 3) {
      if (!formData.email || !formData.password) {
        setError('Email e senha são obrigatórios')
        return false
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem')
        return false
      }
      
      if (formData.password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres')
        return false
      }
      
      if (!formData.is_anonymous && !formData.display_name) {
        setError('Nome de exibição é obrigatório para usuários não anônimos')
        return false
      }
      
      if (formData.user_type === 'mentor' && !formData.mentor_profile.full_name) {
        setError('Nome completo é obrigatório para mentores')
        return false
      }
    }
    
    return true
  }

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    setStep(step - 1)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep()) return
    
    setLoading(true)
    setError('')
    
    try {
      const result = await register(formData)
      
      if (result.success) {
        if (result.needsApproval) {
          alert('Cadastro realizado! Seu perfil de mentor será analisado por nossa equipe.')
        }
        navigate('/home')
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError('Erro ao realizar cadastro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">RF</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Projeto Raiz Forte
          </CardTitle>
          <CardDescription>
            Etapa {step} de 3 - Criar sua conta
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Etapa 1: Tipo de usuário */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Você é:</Label>
                  <div className="grid grid-cols-1 gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => handleInputChange('user_type', 'young')}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        formData.user_type === 'young'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <User className="w-6 h-6 text-blue-600" />
                        <div>
                          <div className="font-medium">Jovem</div>
                          <div className="text-sm text-gray-500">
                            Busco orientação e mentoria
                          </div>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleInputChange('user_type', 'mentor')}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        formData.user_type === 'mentor'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Users className="w-6 h-6 text-blue-600" />
                        <div>
                          <div className="font-medium">Mentor</div>
                          <div className="text-sm text-gray-500">
                            Quero orientar e ajudar jovens
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="w-full"
                  disabled={!formData.user_type}
                >
                  Continuar <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Etapa 2: Grupo de mentoria e nichos */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mentorship_group">Grupo de Mentoria</Label>
                  <Select 
                    value={formData.mentorship_group} 
                    onValueChange={(value) => handleInputChange('mentorship_group', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="neutral">Neutro</SelectItem>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.user_type === 'mentor' && (
                  <div>
                    <Label className="text-base font-medium">Nichos de Mentoria</Label>
                    <p className="text-sm text-gray-500 mb-3">
                      Selecione as áreas em que você pode oferecer mentoria
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {niches.map((niche) => (
                        <div key={niche.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`niche-${niche.id}`}
                            checked={formData.mentor_profile.niches.includes(niche.id)}
                            onCheckedChange={() => handleNicheToggle(niche.id)}
                          />
                          <Label htmlFor={`niche-${niche.id}`} className="text-sm">
                            {niche.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                  </Button>
                  <Button type="button" onClick={nextStep} className="flex-1">
                    Continuar <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Etapa 3: Dados pessoais */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Digite a senha novamente"
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_anonymous"
                    checked={formData.is_anonymous}
                    onCheckedChange={(checked) => handleInputChange('is_anonymous', checked)}
                  />
                  <Label htmlFor="is_anonymous" className="text-sm">
                    Quero manter meu perfil anônimo
                  </Label>
                </div>

                {!formData.is_anonymous && (
                  <div>
                    <Label htmlFor="display_name">Nome de Exibição</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => handleInputChange('display_name', e.target.value)}
                      placeholder="Como você quer ser chamado"
                      required
                    />
                  </div>
                )}

                {formData.user_type === 'mentor' && (
                  <>
                    <div>
                      <Label htmlFor="full_name">Nome Completo</Label>
                      <Input
                        id="full_name"
                        value={formData.mentor_profile.full_name}
                        onChange={(e) => handleInputChange('mentor_profile.full_name', e.target.value)}
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="age">Idade</Label>
                        <Input
                          id="age"
                          type="number"
                          value={formData.mentor_profile.age}
                          onChange={(e) => handleInputChange('mentor_profile.age', e.target.value)}
                          placeholder="Sua idade"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={formData.mentor_profile.phone}
                          onChange={(e) => handleInputChange('mentor_profile.phone', e.target.value)}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          value={formData.mentor_profile.city}
                          onChange={(e) => handleInputChange('mentor_profile.city', e.target.value)}
                          placeholder="Sua cidade"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">Estado</Label>
                        <Input
                          id="state"
                          value={formData.mentor_profile.state}
                          onChange={(e) => handleInputChange('mentor_profile.state', e.target.value)}
                          placeholder="UF"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="church">Igreja</Label>
                      <Input
                        id="church"
                        value={formData.mentor_profile.church}
                        onChange={(e) => handleInputChange('mentor_profile.church', e.target.value)}
                        placeholder="Nome da sua igreja"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio">Biografia</Label>
                      <Textarea
                        id="bio"
                        value={formData.mentor_profile.bio}
                        onChange={(e) => handleInputChange('mentor_profile.bio', e.target.value)}
                        placeholder="Conte um pouco sobre você e sua experiência"
                        rows={3}
                      />
                    </div>
                  </>
                )}

                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Cadastrando...' : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" /> Finalizar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

