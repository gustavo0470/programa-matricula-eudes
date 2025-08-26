# 🎓 Sistema de Matrículas - ONG Grupo Ação Solidária de Indiaporã

Sistema completo de gestão de matrículas para ONGs, desenvolvido com Next.js, Prisma e Supabase.

## ⚡ Início Rápido

```bash
# 1. Configurar tudo automaticamente
npm run setup:database

# 2. Iniciar o sistema
npm run dev

# 3. Acessar
http://localhost:3000
```

## ✨ Funcionalidades

### 👥 Gestão de Alunos
- ✅ Cadastro completo de alunos
- ✅ Matrícula automática (formato: GASI 001/2025)
- ✅ Dados pessoais e responsáveis
- ✅ Controle de documentos (física + digital)
- ✅ Status de matrícula (Ativo/Inativo/Cancelado)

### 📚 Gestão de Cursos
- ✅ Criação e edição de cursos
- ✅ Controle de matrículas por curso
- ✅ Horários e dias da semana
- ✅ Relatórios por curso

### 📄 Relatórios PDF
- ✅ Relatório individual do aluno
- ✅ Relatório de alunos por curso
- ✅ Logo da ONG nos relatórios
- ✅ Dados completos em português
- ✅ Download automático

### 📁 Gestão de Documentos
- ✅ Checkbox para cópia física
- ✅ Upload opcional de arquivos
- ✅ Três tipos: Certidão, Responsável, Comprovante
- ✅ Funciona com ou sem Supabase

### 📊 Dashboard
- ✅ Estatísticas em tempo real
- ✅ Ações rápidas
- ✅ Interface limpa e intuitiva

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Banco**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage (opcional)
- **PDF**: jsPDF
- **Validação**: Zod + React Hook Form
- **Animações**: Framer Motion
- **Ícones**: Lucide React

## 📋 Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev                 # Iniciar servidor de desenvolvimento
npm run build              # Build para produção
npm run start              # Iniciar servidor de produção

# Banco de Dados
npm run setup:database     # Configurar tudo automaticamente
npm run db:push            # Sincronizar schema
npm run db:studio          # Abrir Prisma Studio

# Supabase
npm run setup:supabase     # Configurar apenas Supabase
npm run test:system        # Testar configurações

# Outros
npm run lint               # Verificar código
```

## 🔧 Configuração do Supabase (Opcional)

Para ativar upload de arquivos:

1. **Criar projeto no Supabase**
2. **Configurar .env.local**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://seuprojeto.supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="sua_service_key_aqui"
   ```
3. **Executar configuração**:
   ```bash
   npm run setup:supabase
   ```

Ver `SUPABASE_SETUP.md` para instruções detalhadas.

## 📁 Estrutura do Projeto

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── students/      # CRUD de alunos
│   │   ├── courses/       # CRUD de cursos
│   │   ├── enrollments/   # Sistema de matrículas
│   │   ├── documents/     # Gestão de documentos
│   │   ├── reports/       # Geração de PDFs
│   │   └── upload/        # Upload de arquivos
│   ├── components/        # Componentes React
│   │   ├── StudentForm.tsx    # Formulário de aluno
│   │   ├── StudentList.tsx    # Lista de alunos
│   │   ├── CourseManager.tsx  # Gestão de cursos
│   │   ├── Reports.tsx        # Relatórios
│   │   └── ...
│   └── page.tsx          # Dashboard principal
├── prisma/               # Schema e migrações
├── scripts/              # Scripts de configuração
├── public/               # Arquivos estáticos
└── lib/                  # Utilitários
```

## 🎯 Principais Recursos

### Matrículas Automáticas
- Formato: **GASI 001/2025**
- Numeração sequencial por ano
- Geração automática

### Documentos Flexíveis
- **Cópia física**: Checkbox para controle
- **Upload digital**: Opcional via Supabase
- **Tipos**: Certidão, Responsável, Comprovante

### Relatórios Profissionais
- **Cabeçalho**: Logo + dados da ONG
- **Conteúdo**: Dados completos em português
- **Formato**: PDF para download

### Interface Intuitiva
- **Dashboard**: Estatísticas e ações rápidas
- **Formulários**: Validação em tempo real
- **Listas**: Filtros e busca avançada
- **Modais**: Edição inline

## 🚨 Solução de Problemas

### Banco não conecta
```bash
npm run test:system  # Verificar conexões
```

### Upload não funciona
```bash
npm run setup:supabase  # Configurar storage
```

### Erro no Prisma
```bash
npm run db:push  # Sincronizar schema
```

## 📞 Suporte

- **Documentação**: Ver arquivos `.md` na raiz
- **Logs**: Console do navegador + terminal
- **Testes**: `npm run test:system`

---

## 🎉 Sistema Completo e Funcional!

✅ **Cadastro de alunos** com numeração GASI  
✅ **Gestão de cursos** e matrículas  
✅ **Relatórios PDF** profissionais  
✅ **Upload de documentos** (opcional)  
✅ **Interface moderna** e responsiva  

**Desenvolvido especialmente para a ONG Grupo Ação Solidária de Indiaporã** 🏆