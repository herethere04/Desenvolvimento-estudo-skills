# Kanban Ágil 🚀

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

**Sistema de gestão de projetos com quadros Kanban colaborativos**

</div>

---

## 📋 Sobre o Projeto

O **Kanban Ágil** é um sistema fullstack completo de quadros Kanban para gestão ágil de projetos. Ele permite que equipes criem quadros, adicionem membros através de convites, e gerenciem tarefas com um fluxo visual de colunas coloridas.

### ✨ Funcionalidades

- 🔐 **Autenticação segura** — Registro rápido e login imediato via JWT.
- 📊 **Dashboard de Quadros** — Crie quadros, entre com código de convite, gerencie múltiplos projetos
- 🎯 **Kanban Board** — Drag & drop de cartões entre colunas com validação em tempo real
- 🔒 **Máquina de Estados** — Fluxo estritamente forward: `Backlog → To-Do → In Progress → Done`
- ⚡ **Confirmação de Movimentação** — Modal de confirmação antes de avançar cartões
- 👥 **Colaboração** — Convide membros com código único, permissões Admin/Membro
- 🌙 **Dark Mode nativo** — Interface moderna com glassmorphism e micro-animações

---

## 🏗️ Arquitetura

### Backend — Clean Architecture

```
backend/
├── prisma/schema.prisma              # Modelos de dados (Prisma ORM)
├── src/
│   ├── domain/                        # 🧠 Regras de negócio puras
│   │   ├── errors/AppError.ts         #    Hierarquia de erros
│   │   ├── rules/KanbanStateMachine.ts#    State machine (forward-only)
│   │   └── constants/columns.ts       #    Configuração das colunas
│   ├── application/                   # 📦 Casos de uso
│   │   ├── ports/                     #    Interfaces (abstrações)
│   │   └── usecases/                  #    RegisterUser, LoginUser, MoveCard...
│   ├── infrastructure/                # 🔧 Implementações concretas
│   │   ├── repositories/             #    Prisma repositories
│   │   └── services/                  #    JWT, Bcrypt
│   └── interfaces/                    # 🌐 Camada HTTP
│       ├── controllers/              #    Request handlers
│       ├── middlewares/              #    Auth, ErrorHandler, RateLimit
│       └── routes/                    #    Express routes
```

### Frontend — React + Zustand

```
frontend/
├── src/
│   ├── components/                    # 🧩 Componentes reutilizáveis (<150 linhas)
│   ├── pages/                         # 📄 AuthPage, DashboardPage, BoardPage
│   ├── services/                      # 🔌 API client (Axios)
│   ├── stores/                        # 🏪 Estado global (Zustand)
│   └── types/                         # 📝 TypeScript interfaces
```

---

## 🎨 Visual do Pipeline

| Coluna | Cor | Significado |
|--------|-----|-------------|
| **Backlog** | ⬛ Cinza `#3a3a4a` | Tarefas não priorizadas |
| **To-Do** | 🟡 Âmbar `#f59e0b` | Priorizadas para execução |
| **In Progress** | 🟣 Roxo `#8b5cf6` | Em andamento |
| **Done** | 🟢 Verde `#10b981` | Concluídas |

---

## 🚀 Como Rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) (ou conta no [Neon](https://neon.tech/))

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/kanban-agil.git
cd kanban-agil
```

### 2. Configurar o Backend

```bash
cd backend
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais:
#   DATABASE_URL  → URL do Postgres/Neon
#   JWT_SECRET    → Uma chave secreta forte

# Criar tabelas no banco
npx prisma migrate dev --name init

# Iniciar servidor de desenvolvimento
npm run dev
```

O backend estará rodando em `http://localhost:3001`

### 3. Configurar o Frontend

```bash
cd frontend
npm install

# Configurar variáveis de ambiente (opcional, usa localhost por padrão)
cp .env.example .env

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

---

## 🔐 Segurança

| Recurso | Implementação |
|---------|---------------|
| **Senhas** | Hash bcrypt (12 salt rounds) |
| **Sessão** | JWT com expiração configurável |
| **API** | CORS restrito, Helmet, Rate Limiting (20 req/15min para auth) |
| **Validação** | Zod schemas em todos os endpoints |
| **Erros** | Stack traces nunca expostos ao cliente |

---

## 📡 API Endpoints

### Auth (`/api/auth`)
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/register` | Criar conta e liberar acesso |
| `POST` | `/login` | Login (retorna JWT) |

### Boards (`/api/boards`) — 🔒 Autenticado
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/` | Criar novo quadro |
| `GET` | `/` | Listar quadros do usuário |
| `GET` | `/:id` | Detalhes do quadro (colunas + cards) |
| `POST` | `/join` | Entrar com código de convite |

### Cards (`/api/boards`) — 🔒 Autenticado
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/:boardId/cards` | Criar cartão (no Backlog) |
| `PATCH` | `/:boardId/cards/:cardId/move` | Mover cartão (validação state machine) |

---

## 🌐 Deploy (Render + Neon)

### Backend → Render Web Service
- **Build Command:** `npm run build`
- **Start Command:** `npm run start`
- **Environment Variables:** `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`

### Frontend → Render Static Site
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Environment Variable:** `VITE_API_URL=https://seu-backend.onrender.com/api`

### Banco de Dados → Neon PostgreSQL
- Crie um projeto gratuito em [neon.tech](https://neon.tech/)
- Copie a connection string para `DATABASE_URL`

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | React 19, Vite 8, TypeScript 6, TailwindCSS 3, Zustand, @dnd-kit |
| **Backend** | Node.js, Express 5, TypeScript 6, Prisma 7 |
| **Banco de Dados** | PostgreSQL (Neon) — produção |
| **Autenticação** | JWT, bcrypt |
| **Validação** | Zod |
| **Segurança** | Helmet, CORS, express-rate-limit |

---

## 📄 Modelo de Dados

```
User ──< BoardMember >── Board ──< Column ──< Card
```

- **User** — id, email, name, password (hash)
- **Board** — id, name, description, inviteCode (único)
- **BoardMember** — userId, boardId, role (admin/member) — Relação N:N
- **Column** — id, name, position, color, boardId
- **Card** — id, title, description, position, columnId

---

## 📝 Licença

Este projeto foi desenvolvido como trabalho acadêmico.

---

<div align="center">
  <sub>Feito com 💜 usando TypeScript Fullstack</sub>
</div>
