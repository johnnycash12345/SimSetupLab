# RaceSetup Pro - Prompt Completo para Lovable AI

## Visão Geral do Projeto

Crie uma plataforma completa de setups para corridas virtuais (sim racing) chamada **RaceSetup Pro**, focada no mercado brasileiro. A plataforma deve ser similar aos sites https://simracingsetup.com/ e https://www.f1gamesetup.com/, mas com funcionalidades avançadas e inovadoras.

## Funcionalidades Principais

### 1. Sistema de Usuários e Autenticação
- Registro e login com email/senha
- Perfis de usuário com foto, bio, país, nível de habilidade
- Sistema de seguir outros usuários
- Histórico de atividades e conquistas
- Configurações de privacidade

### 2. Biblioteca de Setups
- CRUD completo para setups de carros
- Suporte para múltiplos jogos: F1 24, Assetto Corsa, iRacing, Gran Turismo, Forza
- Filtros avançados: jogo, carro, pista, clima, categoria
- Sistema de avaliação (1-5 estrelas) e comentários
- Download/upload de arquivos de setup
- Contador de downloads e visualizações
- Tags personalizáveis

### 3. Sistema de Telemetria
- Upload e análise de dados de telemetria
- Gráficos interativos de performance
- Comparação entre diferentes setups
- Análise de tempo por setor
- Dados de temperatura de pneus, combustível, etc.
- Exportação de relatórios

### 4. Rankings e Leaderboards
- Ranking global por tempo de volta
- Classificação por jogo, carro e pista
- Sistema de pontuação baseado em performance
- Histórico de recordes pessoais
- Competições sazonais

### 5. Sistema de Comunidade
- Fóruns de discussão organizados por tópicos
- Sistema de notificações
- Mensagens privadas entre usuários
- Grupos/equipes de usuários
- Sistema de reputação

## Funcionalidades Premium Avançadas

### 6. Pacotes de Setups de Pilotos Reais
- **Sistema de Assinaturas Mensais/Anuais**
- Categorias de pilotos:
  - **Rookie** (R$ 19,90/mês): Pilotos iniciantes, 5-10 setups/mês
  - **Professional** (R$ 39,90/mês): Pilotos nacionais, 15-20 setups/mês, vídeos explicativos
  - **Legend** (R$ 79,90/mês): Ex-pilotos F1, 25-30 setups/mês, masterclasses
  - **Superstar** (R$ 149,90/mês): Pilotos atuais F1, setups exclusivos, coaching virtual

- **Funcionalidades dos Pacotes:**
  - Setups exclusivos com notas do piloto
  - Vídeos explicativos personalizados
  - Dados de telemetria reais (quando disponível)
  - Análise comparativa antes/depois
  - Acesso prioritário a novos conteúdos
  - Sistema de avaliação e feedback

### 7. Sistema de Competições e Premiações
- **Tipos de Competições:**
  - Time Trial (contra-relógio)
  - Setup Battle (batalha de setups)
  - Championship Series (campeonatos longos)
  - Sponsored Challenges (desafios patrocinados)

- **Sistema de Patrocínios:**
  - Níveis: Bronze, Prata, Ouro, Platinum
  - Gestão de patrocinadores e prêmios
  - Analytics para patrocinadores
  - Integração com marcas de hardware

- **Funcionalidades:**
  - Inscrições com taxa opcional
  - Sistema de classificação automática
  - Distribuição de prêmios
  - Certificados digitais
  - Replay de competições

### 8. Guias Educacionais para Novatos
- **Guias Interativos por Nível:**
  - Iniciante: Conceitos básicos, problemas comuns
  - Intermediário: Otimização por pista, telemetria básica
  - Avançado: Microajustes, análise comparativa

- **Wizard de Criação de Setup:**
  - Questionário sobre estilo de pilotagem
  - Geração automática de setup baseada nas respostas
  - Explicações detalhadas de cada ajuste
  - Sistema de refinamento iterativo

- **Base de Conhecimento:**
  - Problemas comuns e soluções
  - Dicas rápidas categorizadas
  - Vídeos tutoriais integrados
  - Sistema de feedback da comunidade

## Estrutura Técnica

### Backend (Flask/Python)
```python
# Modelos principais
- User (usuários, perfis, autenticação)
- Game (jogos suportados)
- Car (carros disponíveis)
- Track (pistas/circuitos)
- Setup (configurações de carros)
- TelemetryData (dados de performance)
- LapTime (tempos de volta)
- ForumPost, ForumTopic (comunidade)
- DriverPack, DriverPackSubscription (pacotes premium)
- Competition, CompetitionParticipant (competições)
- SetupGuide, SetupProblem (educacional)
- Sponsor, Prize (patrocínios)

# APIs principais
- /api/setups (CRUD completo)
- /api/telemetry (upload/análise)
- /api/rankings (leaderboards)
- /api/community (fóruns)
- /api/driver-packs (assinaturas)
- /api/competitions (eventos)
- /api/setup-guides (educacional)
```

### Frontend (React/TypeScript)
```jsx
// Componentes principais
- HomePage (landing page atrativa)
- SetupLibrary (biblioteca com filtros)
- SetupDetail (visualização detalhada)
- TelemetryAnalysis (gráficos interativos)
- Rankings (leaderboards)
- Community (fóruns)
- DriverPacks (assinaturas premium)
- Competitions (eventos)
- EducationalHub (guias e wizard)
- UserProfile (perfil do usuário)

// Funcionalidades especiais
- Setup comparison tool
- Interactive setup wizard
- Real-time competition updates
- Advanced filtering system
- Mobile-responsive design
```

### Banco de Dados
```sql
-- Tabelas principais (PostgreSQL)
users, games, cars, tracks, setups, telemetry_data, lap_times
forum_topics, forum_posts, user_follows, notifications
driver_packs, driver_pack_subscriptions, driver_pack_ratings
competitions, competition_participants, competition_results
sponsors, prizes, setup_guides, setup_problems, setup_tips
wizard_sessions, guide_feedback
```

## Design e UX

### Identidade Visual
- **Cores:** Esquema escuro com acentos em azul/verde neon
- **Tipografia:** Moderna e legível, fonte sans-serif
- **Estilo:** Futurístico mas profissional, inspirado em F1/tecnologia
- **Layout:** Grid responsivo, mobile-first

### Páginas Principais
1. **Landing Page:** Hero section, features, testimonials, pricing
2. **Setup Library:** Grid de setups com filtros laterais
3. **Setup Detail:** Visualização completa com telemetria
4. **Driver Packs:** Showcase dos pilotos e planos
5. **Competitions:** Lista de eventos ativos e resultados
6. **Educational Hub:** Guias organizados por nível
7. **Community:** Fóruns com categorias
8. **Profile:** Dashboard pessoal do usuário

### Elementos Interativos
- Gráficos de telemetria com Chart.js/Recharts
- Sliders para ajustes de setup
- Comparação lado-a-lado de setups
- Sistema de drag-and-drop para uploads
- Notificações em tempo real
- Modais para ações rápidas

## Integrações e APIs

### APIs de Jogos (quando disponível)
- **iRacing SDK:** Telemetria em tempo real
- **OpenF1 API:** Dados da Fórmula 1
- **Assetto Corsa UDP:** Dados de telemetria
- **Custom APIs:** Para outros jogos via parsing

### Pagamentos
- **Stripe:** Pagamentos internacionais
- **PagSeguro/PagBank:** Mercado brasileiro
- **PIX:** Pagamentos instantâneos
- **Boleto:** Opção tradicional brasileira

### Outras Integrações
- **AWS S3:** Armazenamento de arquivos
- **SendGrid:** Emails transacionais
- **Google Analytics:** Métricas de uso
- **Sentry:** Monitoramento de erros

## Monetização

### Modelo de Receita
1. **Assinaturas Premium:** Pacotes de pilotos (70% da receita)
2. **Marketplace:** Comissão sobre vendas (20% da receita)
3. **Patrocínios:** Competições e eventos (10% da receita)

### Preços (em Reais)
- Pacotes de pilotos: R$ 19,90 - R$ 149,90/mês
- Funcionalidades premium: R$ 9,90 - R$ 29,90/mês
- Taxa de competições: R$ 5,00 - R$ 50,00/evento

## Requisitos Técnicos

### Performance
- Carregamento inicial < 3 segundos
- Gráficos de telemetria responsivos
- Paginação eficiente para grandes datasets
- Cache inteligente para dados frequentes

### Segurança
- Autenticação JWT
- Criptografia de dados sensíveis
- Compliance com LGPD
- Rate limiting nas APIs
- Validação rigorosa de inputs

### Escalabilidade
- Arquitetura modular
- Database indexing otimizado
- CDN para assets estáticos
- Load balancing preparado
- Monitoring e alertas

## Diferenciação Competitiva

### Vantagens sobre Concorrentes
1. **Preços em Reais:** Mais acessível que sites europeus
2. **Conteúdo Brasileiro:** Pilotos e comunidade local
3. **Educação Integrada:** Guias para todos os níveis
4. **Competições Regulares:** Engajamento contínuo
5. **Suporte Premium:** Atendimento em português

### Funcionalidades Únicas
- Wizard de setup para iniciantes
- Pacotes de pilotos brasileiros famosos
- Competições com prêmios reais
- Sistema educacional gamificado
- Integração com hardware nacional

## Roadmap de Desenvolvimento

### Fase 1 (MVP - 3 meses)
- Sistema básico de usuários e setups
- Interface web responsiva
- Funcionalidades core implementadas

### Fase 2 (Premium - 3 meses)
- Sistema de assinaturas
- Competições básicas
- Guias educacionais

### Fase 3 (Expansão - 6 meses)
- App mobile
- Integrações avançadas
- IA para recomendações

## Instruções Específicas para Implementação

### Prioridades de Desenvolvimento
1. **Primeiro:** Sistema de usuários e biblioteca de setups
2. **Segundo:** Interface atrativa e funcional
3. **Terceiro:** Sistema de pagamentos e assinaturas
4. **Quarto:** Funcionalidades de comunidade
5. **Quinto:** Recursos educacionais avançados

### Tecnologias Recomendadas
- **Frontend:** React 18+ com TypeScript, Tailwind CSS, Shadcn/UI
- **Backend:** Flask com SQLAlchemy, PostgreSQL
- **Deployment:** Vercel (frontend) + Railway/Heroku (backend)
- **Monitoring:** Sentry, Google Analytics

### Considerações Especiais
- Design mobile-first obrigatório
- Suporte a múltiplos idiomas (PT-BR prioritário)
- Otimização para SEO
- Acessibilidade (WCAG 2.1)
- Performance em conexões lentas

---

**Objetivo Final:** Criar a plataforma de setups de sim racing mais completa e acessível do Brasil, combinando tecnologia avançada com foco na comunidade local e educação dos usuários.

**Público-Alvo:** Entusiastas brasileiros de corridas virtuais, desde iniciantes até profissionais, com foco especial em tornar o hobby mais acessível para novatos.

**Proposta de Valor:** "A única plataforma que você precisa para dominar as corridas virtuais - com setups profissionais, educação de qualidade e uma comunidade vibrante, tudo em português e com preços justos."

