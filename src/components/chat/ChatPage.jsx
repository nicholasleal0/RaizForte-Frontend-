import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Chat</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Sistema de Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Funcionalidade de chat em desenvolvimento...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

