# To-Do List - Desafio de Estágio

## Descrição do Projeto

Aplicação web para gerenciamento de tarefas, desenvolvida como parte de um desafio de estágio proposto pelo IFPR em parceria com a Nextage. O objetivo é permitir ao usuário criar, visualizar, editar, marcar como concluídas e excluir tarefas, além de oferecer autenticação e recuperação de senha.

## Funcionalidades

- [ ] Criação de Tarefas
- [ ] Visualização de Tarefas
# To-Do List - Desafio de Estágio

## Descrição do Projeto

Aplicação fullstack para gerenciamento de tarefas (to-do list) desenvolvida como parte de um desafio de estágio. Permite criar, visualizar, editar, marcar como concluída e excluir tarefas. Possui autenticação de usuário, edição de perfil (nome, senha e foto de perfil) e separação entre frontend (Vite + React) e backend (NestJS + Prisma).

## Funcionalidades

- [x] Criação de Tarefas
- [x] Visualização de Tarefas (quadro kanban)
- [x] Edição de Tarefas
- [x] Marcação de Conclusão
- [x] Exclusão de Tarefas
- [x] Autenticação de Usuário (login / registro)
- [x] Edição de Perfil (nome, senha, foto de perfil)
- [x] Filtros e Ordenação (Opcional)
- [ ] Outras funcionalidades (descrever)

> Observação: no repositório as imagens de perfil são suportadas como `Bytes` no banco (campo `avatar` no Prisma). Para produção é recomendado usar um storage de objetos (S3 / Supabase Storage) e salvar apenas a URL.

## Tecnologias Utilizadas

- Frontend: React, Vite, TypeScript, TailwindCSS, PrimeReact
- Backend: NestJS, TypeScript, Express adapter
- Banco de Dados: Prisma ORM (schema em `server/prisma/schema.prisma`) — em desenvolvimento usa SQLite; em produção recomendo Postgres (Supabase/Neon/Planetscale)
- Outras: hello-pangea/dnd (drag & drop), lucide-react (ícones)

## Como Configurar e Executar o Projeto (local)

Instruções para Windows PowerShell. Presume Node.js (>=16) e npm.

1. Clone o repositório

```powershell
git clone https://github.com/<seu-usuario>/<seu-repo>.git
cd to-do-list
```

2. Instale dependências

```powershell
# Instalar no root (opcional)
npm install

# Backend
cd server
npm install
npx prisma generate

# Frontend
cd ..\src\frontend
npm install
```

3. Configurar o banco de dados

- Em desenvolvimento o projeto inclui um arquivo SQLite (`server/prisma/todo.db`). Para usar Postgres, defina a variável de ambiente `DATABASE_URL` e rode as migrações:

```powershell
cd server
npx prisma migrate dev --name init
```

4. Iniciar backend e frontend (em terminais separados)

```powershell
# Terminal 1 - backend
cd server
npm run start:dev

# Terminal 2 - frontend
cd src\frontend
npm run dev
```

Observações:
- Ajuste `VITE_API_URL` no frontend para apontar para a URL da API (ex.: `http://localhost:3000`).
- Se ocorrer `413 Request Entity Too Large` ao enviar imagens base64, aumente o limite no backend (`express.json({ limit: '8mb' })`) ou faça upload para um storage externo.

## Decisões de Design e Arquitetura

- Separação clara entre frontend (SPA) e backend (API RESTful) para facilitar deploy e escalabilidade.
- Prisma como ORM para modelagem e migrações; migrar para Postgres em produção.
- Upload de avatar implementado via base64 → convertido para bytes e salvo no banco (campo `avatar`). Em produção, recomendo storage dedicado.
- Autenticação via JWT; proteger endpoints com guards e checar ownership para operações sensíveis.

## Testes e Lint

```powershell
# Verificar tipos TypeScript
npx tsc --noEmit

# Rodar linters/tests (se configurados)
npm run lint
npm test
```
