// Rota de fallback para quando APIs não estão disponíveis
export const dynamic = 'force-static'

export async function GET() {
  return new Response(JSON.stringify({ 
    message: 'APIs não disponíveis no modo Electron',
    mode: 'offline' 
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}