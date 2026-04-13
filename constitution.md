## constituição do projeto: kanban ágil (typescript fullstack)

## 1. stack tecnológica base e deploy
* Backend: Node.js com TypeScript e framework Express (ou NestJS, se o agente julgar estritamente necessário para injeção de dependência).
* Frontend: React estruturado com Vite e TypeScript.
* Banco de Dados: PostgreSQL hospedado no Neon. O ORM obrigatório é o Prisma (devido à sua tipagem forte e facilidade de migração no Neon).
* Deploy: O código deve ser estruturado para facilitar o deploy no Render (Web Service para o Backend, Static Site para o Frontend). Utilize variáveis de ambiente (`.env`) para todas as conexões e segredos.

## 2. padrões arquiteturais (clean architecture)
* O Backend deve seguir a Clean Architecture. A lógica de negócio (Casos de Uso/Domínio) não pode ter dependências diretas do Express ou do Prisma.
* O Frontend deve separar a camada de UI (Componentes React) da camada de estado e requisições à API (ex: usando hooks customizados e bibliotecas como Zustand ou React Query).

## 3. segurança e autenticação
* Segurança de API: O backend deve implementar proteção contra CORS (restrito ao domínio do frontend), Rate Limiting e sanitização de inputs.
* Autenticação (OAuth e JWT):login local. O gerenciamento de sessão deve ser feito via JWT (JSON Web Tokens), preferencialmente armazenados em cookies `HttpOnly` para evitar ataques XSS, ou manipulados com máxima segurança no header `Authorization`.
* Senhas locais devem ser obrigatoriamente hasheadas usando `bcrypt` antes de salvar no banco.

## 4. padrões de frontend e ui/ux
* Estilização: O uso de Tailwind CSS é obrigatório.
* Tema Escuro: A aplicação deve ser desenvolvida de forma nativa (Default) no Tema Escuro (Dark Mode).
* Clean Code: Componentes React devem ser pequenos, modulares e não devem ultrapassar 150 linhas. Extraia a lógica complexa para hooks.

## 5. tratamento de exceções
* O backend deve possuir um middleware global de captura de erros. Erros de validação (Zod ou Joi) devem retornar HTTP 400. Erros de transição de estado do Kanban ou permissão retornam HTTP 403/422. Erros de sistema nunca devem vazar o stack trace para o cliente.