# Variáveis de Ambiente para Vercel

No painel do Vercel, adicione estas variáveis de ambiente:

## Banco de Dados (Supabase)
```
DATABASE_URL=postgresql://postgres.pdnrcullrztadtutmlmb:live2017G!@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
```

## Configuração Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://pdnrcullrztadtutmlmb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbnJjdWxscnp0YWR0dXRtbG1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3OTkzMzksImV4cCI6MjA3MTM3NTMzOX0.VvX2EcG3pzHH6x3tWhaOyx7V-sp56wbzD-A6UvpnZMw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbnJjdWxscnp0YWR0dXRtbG1iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTc5OTMzOSwiZXhwIjoyMDcxMzc1MzM5fQ.E0Hq0ZnEVNVnqd9NVTr7CrdHaVlcxq3sEhttkUivPTo
```

## Configuração de Produção
```
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## Como adicionar no Vercel:
1. Acesse seu projeto no Vercel
2. Vá em Settings > Environment Variables
3. Adicione cada variável acima
4. Clique em "Redeploy" para aplicar as mudanças

⚠️ **Importante:** Essas credenciais são sensíveis. Mantenha-as seguras!
