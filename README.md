# To-Do List - Desafio de Estágio

## Descrição do Projeto

Aplicação web para gerenciamento de tarefas, desenvolvida como parte de um desafio de estágio de estágio proposto pelo IFPR em parceria com a Nextage. O objetivo é permitir ao usuário criar, visualizar, editar, marcar como concluídas e excluir tarefas, além de oferecer autenticação e recuperação de senha.

## Funcionalidades

- [ ] Criação de Tarefas
- [ ] Visualização de Tarefas
- [ ] Edição de Tarefas
- [ ] Marcação de Conclusão
- [ ] Exclusão de Tarefas
- [x] Autenticação de Usuário (Tela de Login)
- [x] Recuperação de Senha (Modal)
- [ ] Filtros e Ordenação
- [ ] Outras funcionalidades (descrever)

## Tecnologias Utilizadas

- **Frontend:** React, TypeScript, TailwindCSS, Vite
- **Backend:** (a implementar)
- **Banco de Dados:** (a implementar)
- **Outras:** SVG Icons, CSS Modules

## Como Configurar e Executar o Projeto

### Pré-requisitos

- Node.js >= 18.x
- npm >= 9.x

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/to-do-list.git
cd to-do-list

# 2. Instale as dependências do frontend
cd src
npm install

# 3. Inicie o frontend
npm run dev
```

> O backend e o banco de dados ainda não foram implementados. O frontend pode ser testado normalmente.

## Decisões de Design e Arquitetura

- **Frontend em React + Vite:** Escolhido pela velocidade de desenvolvimento e facilidade de configuração.
- **TailwindCSS:** Utilizado para estilização rápida e responsiva.
- **Componentização:** Telas e modais são componentes independentes para facilitar manutenção e reuso.
- **Persistência:** Ainda não implementada; será feita no backend futuramente.
- **Desafios:** Implementação do modal de recuperação de senha e responsividade das telas.

## Considerações Finais

Este projeto está em desenvolvimento e novas funcionalidades serão adicionadas em breve. Sinta-se à vontade para contribuir ou sugerir melhorias.
