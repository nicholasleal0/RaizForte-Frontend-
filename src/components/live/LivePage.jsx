import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LivePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Live</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Transmissão ao Vivo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Sistema de lives em desenvolvimento...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
