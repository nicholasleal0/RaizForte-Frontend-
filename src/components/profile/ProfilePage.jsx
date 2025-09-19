import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Perfil</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Meu Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Página de perfil em desenvolvimento...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
