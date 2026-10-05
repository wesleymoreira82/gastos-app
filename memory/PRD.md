# Controle Financeiro — PRD

## Visão Geral
App mobile de controle financeiro pessoal em **Português (BR)**, foco em simplicidade e velocidade. Filosofia: "Abriu → viu quanto gastou → clicou no + → registrou".

## Decisões Técnicas
- Framework: Expo + React Native (expo-router).
- Tema: **Dark Mode fixo** (tokens em `src/theme.ts`, derivados de `design_guidelines.json`).
- Persistência: 100% local via `@/src/utils/storage` (AsyncStorage). Nenhum backend/auth.
- Navegação: Stack raiz com `(tabs)` + modais (`add-expense`, `edit-expense/[id]`, `fixos-new`) + telas empilhadas (`categorias`, `fixos`).
- Tabs: Início, Gastos, Gráficos, Configurações. FAB flutuante com "+" acima do bottom tab.

## Funcionalidades
- **Início**: hero "Hoje — Você gastou R$ XX,XX" (destaque em vermelho), mini stats (mês, média diária, nº gastos hoje), lista de gastos de hoje, painel "Últimos 7 dias".
- **Novo/Editar gasto**: valor (teclado numérico em centavos), categoria (grid), data (±1 dia + "hoje"), descrição; salvar/excluir atualiza totais imediatamente.
- **Gastos**: filtros por período (Hoje, Ontem, 7d, 30d, Este mês, Mês anterior, Tudo) e por categoria, agrupados por data.
- **Gráficos**: barras diárias (7/14/30d), comparativo (dia/semana/mês com variação em %, verde=menos, vermelho=mais), donut por categoria com % e legenda, resumo (total, média/dia, maior gasto do dia, dia da semana que mais gasta).
- **Configurações**: resumo de fixos vs variáveis do mês, acesso a Gastos fixos e Categorias.
- **Categorias**: 12 padrão + CRUD (ícone emoji + cor); exclusão reatribui gastos para "Outros".
- **Gastos fixos**: nome, valor, categoria, frequência (mensal/semanal/anual), dia de vencimento, modo (lembrete/automático).

## Seed Inicial
Na primeira execução, o app semeia:
- 12 categorias padrão.
- 12 gastos de exemplo distribuídos nos últimos 7 dias.
- 3 gastos fixos (Aluguel, Internet, Netflix).

## Credenciais
Sem autenticação. Todos os dados vivem no dispositivo via AsyncStorage.
