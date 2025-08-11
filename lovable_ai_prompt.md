# Prompt para Lovable AI: RaceSetup Pro - Plataforma de Setups para Corridas Virtuais

## Objetivo Geral

Crie uma plataforma web completa e responsiva chamada "RaceSetup Pro" para entusiastas de corridas virtuais. O site deve permitir que os usuários criem, compartilhem (gratuitamente ou vendam), testem e analisem setups de carros para diversos jogos de simulação de corrida (F1, iRacing, Assetto Corsa, etc.). A plataforma deve incluir funcionalidades avançadas de telemetria, rankings globais e um sistema de comunidade robusto.

## Funcionalidades Essenciais

1.  **Gerenciamento de Usuários**: Registro, login, perfis de usuário com informações como jogos preferidos, nível de habilidade, biografia e imagem de perfil.
2.  **Biblioteca de Setups**: Usuários podem navegar, buscar, filtrar, baixar, avaliar e comentar setups de carros.
3.  **Criação e Edição de Setups**: Interface intuitiva para usuários criarem e modificarem setups detalhados para carros específicos em pistas e condições climáticas variadas.
4.  **Análise de Telemetria**: Coleta, armazenamento e visualização de dados de telemetria de sessões de corrida, permitindo análise de tempos de volta, setores, velocidades, desgaste de pneus, etc.
5.  **Rankings e Leaderboards**: Tabelas de classificação para comparar tempos de volta entre usuários para combinações específicas de carro/pista/condição climática.
6.  **Sistema de Comunidade**: Fóruns de discussão, sistema de seguir usuários, notificações e conquistas.
7.  **Monetização (Opcional)**: Capacidade de usuários venderem seus setups premium.

## Arquitetura e Tecnologias

O projeto deve seguir uma arquitetura de aplicação web moderna, com backend e frontend separados, comunicando-se via API RESTful.

### Backend (Python/Flask)

**Tecnologias:**
-   **Linguagem**: Python 3.11+
-   **Framework**: Flask
-   **ORM**: SQLAlchemy
-   **Banco de Dados**: SQLite (para desenvolvimento/teste inicial, com compatibilidade para PostgreSQL em produção)
-   **Autenticação**: JWT (JSON Web Tokens) para autenticação stateless.
-   **CORS**: Habilitado para permitir comunicação com o frontend.

**Modelos de Banco de Dados (SQLAlchemy):**
Crie os seguintes modelos (tabelas) com seus respectivos campos e relacionamentos:

-   **User**: `id`, `username`, `email`, `password_hash`, `first_name`, `last_name`, `profile_image_url`, `bio`, `country`, `preferred_games` (JSON), `skill_level`, `created_at`, `updated_at`, `is_active`, `is_verified`, `last_login`.
-   **Game**: `id`, `name`, `display_name`, `developer`, `api_endpoint`, `telemetry_support`, `icon_url`, `description`, `created_at`, `is_active`.
-   **Track**: `id`, `game_id` (FK), `name`, `display_name`, `country`, `length_meters`, `turns_count`, `track_type`, `weather_conditions` (JSON), `created_at`, `is_active`.
-   **Car**: `id`, `game_id` (FK), `name`, `display_name`, `manufacturer`, `category`, `year`, `power_hp`, `weight_kg`, `drivetrain`, `image_url`, `created_at`, `is_active`.
-   **Setup**: `id`, `user_id` (FK), `car_id` (FK), `track_id` (FK), `name`, `description`, `setup_data` (JSON), `weather_condition`, `session_type`, `is_public`, `is_premium`, `price`, `download_count`, `rating_average`, `rating_count`, `created_at`, `updated_at`, `version`.
-   **SetupRating**: `id`, `setup_id` (FK), `user_id` (FK), `rating`, `comment`, `created_at` (com `UNIQUE(setup_id, user_id)`).
-   **TelemetrySession**: `id`, `user_id` (FK), `setup_id` (FK), `car_id` (FK), `track_id` (FK), `session_name`, `session_type`, `weather_condition`, `track_temperature`, `air_temperature`, `session_duration`, `total_laps`, `best_lap_time`, `average_lap_time`, `fuel_used`, `tire_compound`, `created_at`, `telemetry_file_url`.
-   **LapTime**: `id`, `telemetry_session_id` (FK), `user_id` (FK), `setup_id` (FK), `car_id` (FK), `track_id` (FK), `lap_number`, `lap_time`, `sector_1_time`, `sector_2_time`, `sector_3_time`, `top_speed`, `average_speed`, `fuel_remaining`, `tire_wear_fl`, `tire_wear_fr`, `tire_wear_rl`, `tire_wear_rr`, `is_valid`, `weather_condition`, `track_temperature`, `created_at`.
-   **Forum**: `id`, `name`, `description`, `category`, `game_id` (FK), `is_active`, `created_at`.
-   **ForumTopic**: `id`, `forum_id` (FK), `user_id` (FK), `title`, `content`, `is_pinned`, `is_locked`, `view_count`, `reply_count`, `last_reply_at`, `last_reply_user_id` (FK), `created_at`, `updated_at`.
-   **ForumPost**: `id`, `topic_id` (FK), `user_id` (FK), `content`, `parent_post_id` (FK), `is_deleted`, `created_at`, `updated_at`.
-   **UserFollow**: `id`, `follower_id` (FK), `following_id` (FK), `created_at` (com `UNIQUE(follower_id, following_id)`).
-   **Notification**: `id`, `user_id` (FK), `type`, `title`, `message`, `related_id`, `related_type`, `is_read`, `created_at`.
-   **UserAchievement**: `id`, `user_id` (FK), `achievement_type`, `achievement_name`, `description`, `earned_at` (com `UNIQUE(user_id, achievement_type)`).

**Rotas da API (Flask Blueprints):**
Implemente as seguintes rotas RESTful:
-   `/api/users`: CRUD para usuários.
-   `/api/games`: Listar jogos, criar jogos.
-   `/api/games/<game_id>/cars`: Listar carros de um jogo.
-   `/api/games/<game_id>/tracks`: Listar pistas de um jogo.
-   `/api/cars`: Criar carros.
-   `/api/tracks`: Criar pistas.
-   `/api/setups`: CRUD para setups, com filtros por `car_id`, `track_id`, `user_id`, `weather_condition`, `session_type`, `is_public`, ordenação por `rating`, `downloads`, `created_at` e paginação.
-   `/api/setups/<setup_id>/rate`: Avaliar um setup.
-   `/api/setups/<setup_id>/download`: Registrar download de um setup.
-   `/api/telemetry/sessions`: CRUD para sessões de telemetria, com filtros e paginação.
-   `/api/telemetry/lap-times`: CRUD para tempos de volta, com filtros e paginação.
-   `/api/telemetry/leaderboard`: Obter leaderboard para uma combinação carro/pista/condição climática.
-   `/api/telemetry/stats`: Obter estatísticas de telemetria.
-   `/api/forums`: CRUD para fóruns.
-   `/api/forums/<forum_id>/topics`: Listar tópicos de um fórum.
-   `/api/topics`: CRUD para tópicos de fórum.
-   `/api/posts`: Criar posts em tópicos de fórum.
-   `/api/users/<user_id>/follow`: Seguir/deixar de seguir um usuário.
-   `/api/users/<user_id>/followers`: Listar seguidores de um usuário.
-   `/api/users/<user_id>/following`: Listar quem um usuário está seguindo.
-   `/api/users/<user_id>/notifications`: Listar notificações de um usuário.
-   `/api/notifications/<notification_id>/read`: Marcar notificação como lida.
-   `/api/achievements`: Criar/conceder conquistas.
-   `/api/users/<user_id>/achievements`: Listar conquistas de um usuário.

**Integração com APIs de Jogos (Exemplos de Conceito):**
-   **iRacing SDK**: Mencionar a capacidade de integração para coleta de telemetria em tempo real (ex: `irsdk` Python library).
-   **OpenF1 API**: Mencionar a capacidade de integração para dados históricos de telemetria da Fórmula 1 (ex: `requests` Python library).
-   **Assetto Corsa UDP**: Mencionar a capacidade de integração para receber dados de telemetria via UDP (ex: `socket` Python library).

### Frontend (React)

**Tecnologias:**
-   **Framework**: React.js
-   **Build Tool**: Vite
-   **Estilização**: Tailwind CSS
-   **Componentes UI**: shadcn/ui
-   **Ícones**: Lucide React
-   **Roteamento**: React Router DOM

**Páginas e Componentes:**
-   **Página Inicial (`/`)**: Hero section, destaque de funcionalidades, setups populares, rankings de exemplo.
-   **Página de Setups (`/setups`)**: Exibir lista de setups com filtros avançados (jogo, carro, pista, condição climática, busca), paginação e cards de setup detalhados.
-   **Componente `Header`**: Navegação principal (Home, Setups, Rankings, Telemetria, Comunidade, Login, Cadastrar).
-   **Componente `Footer`**: Informações de contato, links úteis, jogos suportados.
-   **Componente `SetupCard`**: Exibir informações de um setup (nome, carro, pista, jogo, autor, avaliação, downloads, condição climática, preço).

**Design e Responsividade:**
-   O design deve ser moderno, limpo e visualmente atraente, com foco na usabilidade.
-   Totalmente responsivo para desktop, tablet e mobile.
-   Utilize as classes do Tailwind CSS para layout e estilização.

## Dados de Exemplo (Seeding)

Inclua um script de `seed_data.py` no backend para popular o banco de dados com usuários, jogos, carros, pistas, setups, sessões de telemetria, tempos de volta, fóruns, tópicos, posts e conquistas de exemplo. Isso é crucial para testar a aplicação imediatamente após a configuração.

## Considerações Adicionais

-   **Estrutura de Pastas**: Organize o código de forma modular e clara, seguindo as melhores práticas para Flask e React.
-   **Tratamento de Erros**: Implemente tratamento de erros robusto no backend e feedback adequado no frontend.
-   **Performance**: Otimize consultas de banco de dados e carregamento de assets para uma experiência de usuário fluida.
-   **Documentação**: O código deve ser bem comentado e a estrutura do projeto intuitiva.

Este prompt fornece uma base sólida para o Lovable AI construir a plataforma RaceSetup Pro. Certifique-se de que o Lovable compreenda a necessidade de integrar as funcionalidades de backend e frontend para criar uma aplicação coesa e funcional.

