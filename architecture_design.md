# Arquitetura e Estrutura do Banco de Dados

## Visão Geral da Arquitetura

A arquitetura proposta para o site de setups de carros de corrida virtual seguirá um padrão moderno de aplicação web com separação clara entre frontend e backend, permitindo escalabilidade e manutenibilidade. A aplicação será estruturada como uma Single Page Application (SPA) no frontend comunicando-se com uma API RESTful no backend.

### Componentes Principais

**Frontend (React.js):**
- Interface de usuário responsiva e interativa
- Gerenciamento de estado com Redux ou Context API
- Visualização de dados de telemetria com bibliotecas como Chart.js ou D3.js
- Comunicação com backend via API REST

**Backend (Flask/Python):**
- API RESTful para todas as operações
- Autenticação e autorização de usuários
- Integração com APIs de jogos para coleta de telemetria
- Processamento e análise de dados de telemetria
- Sistema de notificações e mensagens

**Banco de Dados (PostgreSQL):**
- Armazenamento de dados de usuários, setups e telemetria
- Índices otimizados para consultas de performance
- Backup e replicação para alta disponibilidade

**Cache (Redis):**
- Cache de dados de telemetria frequentemente acessados
- Sessões de usuário
- Cache de rankings e leaderboards

**Armazenamento de Arquivos (AWS S3 ou similar):**
- Arquivos de setup
- Imagens de perfil de usuários
- Arquivos de replay e dados de telemetria



## Estrutura do Banco de Dados

### Tabela: users
Armazena informações dos usuários registrados na plataforma.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    profile_image_url VARCHAR(255),
    bio TEXT,
    country VARCHAR(2), -- ISO country code
    preferred_games TEXT[], -- Array of game names
    skill_level VARCHAR(20) DEFAULT 'beginner', -- beginner, intermediate, advanced, professional
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP
);
```

### Tabela: games
Catálogo de jogos suportados pela plataforma.

```sql
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    developer VARCHAR(100),
    api_endpoint VARCHAR(255), -- Endpoint for game API if available
    telemetry_support BOOLEAN DEFAULT FALSE,
    icon_url VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

### Tabela: tracks
Informações sobre pistas disponíveis nos jogos.

```sql
CREATE TABLE tracks (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id),
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    country VARCHAR(2),
    length_meters INTEGER,
    turns_count INTEGER,
    track_type VARCHAR(50), -- circuit, street, oval, etc.
    weather_conditions TEXT[], -- Array of supported weather conditions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

### Tabela: cars
Catálogo de carros disponíveis nos jogos.

```sql
CREATE TABLE cars (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id),
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(50),
    category VARCHAR(50), -- GT3, GT4, Formula, etc.
    year INTEGER,
    power_hp INTEGER,
    weight_kg INTEGER,
    drivetrain VARCHAR(10), -- FWD, RWD, AWD
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

### Tabela: setups
Armazena os setups de carros criados pelos usuários.

```sql
CREATE TABLE setups (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    car_id INTEGER REFERENCES cars(id),
    track_id INTEGER REFERENCES tracks(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    setup_data JSONB NOT NULL, -- JSON with all setup parameters
    weather_condition VARCHAR(50),
    session_type VARCHAR(50), -- practice, qualifying, race
    is_public BOOLEAN DEFAULT TRUE,
    is_premium BOOLEAN DEFAULT FALSE,
    price DECIMAL(10,2), -- For paid setups
    download_count INTEGER DEFAULT 0,
    rating_average DECIMAL(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1
);
```

### Tabela: setup_ratings
Sistema de avaliação de setups pelos usuários.

```sql
CREATE TABLE setup_ratings (
    id SERIAL PRIMARY KEY,
    setup_id INTEGER REFERENCES setups(id),
    user_id INTEGER REFERENCES users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(setup_id, user_id)
);
```

### Tabela: telemetry_sessions
Sessões de telemetria coletadas durante o jogo.

```sql
CREATE TABLE telemetry_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    setup_id INTEGER REFERENCES setups(id),
    car_id INTEGER REFERENCES cars(id),
    track_id INTEGER REFERENCES tracks(id),
    session_name VARCHAR(100),
    session_type VARCHAR(50), -- practice, qualifying, race
    weather_condition VARCHAR(50),
    track_temperature DECIMAL(5,2),
    air_temperature DECIMAL(5,2),
    session_duration INTEGER, -- in seconds
    total_laps INTEGER,
    best_lap_time DECIMAL(8,3), -- in seconds
    average_lap_time DECIMAL(8,3),
    fuel_used DECIMAL(6,2),
    tire_compound VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    telemetry_file_url VARCHAR(255) -- Link to stored telemetry file
);
```

### Tabela: lap_times
Tempos de volta individuais com dados detalhados.

```sql
CREATE TABLE lap_times (
    id SERIAL PRIMARY KEY,
    telemetry_session_id INTEGER REFERENCES telemetry_sessions(id),
    user_id INTEGER REFERENCES users(id),
    setup_id INTEGER REFERENCES setups(id),
    car_id INTEGER REFERENCES cars(id),
    track_id INTEGER REFERENCES tracks(id),
    lap_number INTEGER,
    lap_time DECIMAL(8,3) NOT NULL, -- in seconds
    sector_1_time DECIMAL(8,3),
    sector_2_time DECIMAL(8,3),
    sector_3_time DECIMAL(8,3),
    top_speed DECIMAL(6,2), -- km/h
    average_speed DECIMAL(6,2), -- km/h
    fuel_remaining DECIMAL(6,2),
    tire_wear_fl DECIMAL(5,2), -- Front Left tire wear percentage
    tire_wear_fr DECIMAL(5,2), -- Front Right tire wear percentage
    tire_wear_rl DECIMAL(5,2), -- Rear Left tire wear percentage
    tire_wear_rr DECIMAL(5,2), -- Rear Right tire wear percentage
    is_valid BOOLEAN DEFAULT TRUE, -- Invalid if penalties, off-track, etc.
    weather_condition VARCHAR(50),
    track_temperature DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: leaderboards
Rankings e tabelas de classificação.

```sql
CREATE TABLE leaderboards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    game_id INTEGER REFERENCES games(id),
    car_id INTEGER REFERENCES cars(id),
    track_id INTEGER REFERENCES tracks(id),
    leaderboard_type VARCHAR(50), -- overall, weekly, monthly, seasonal
    weather_condition VARCHAR(50),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: leaderboard_entries
Entradas individuais nos rankings.

```sql
CREATE TABLE leaderboard_entries (
    id SERIAL PRIMARY KEY,
    leaderboard_id INTEGER REFERENCES leaderboards(id),
    user_id INTEGER REFERENCES users(id),
    lap_time_id INTEGER REFERENCES lap_times(id),
    position INTEGER,
    lap_time DECIMAL(8,3) NOT NULL,
    setup_id INTEGER REFERENCES setups(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(leaderboard_id, user_id)
);
```

### Tabela: forums
Estrutura de fóruns para discussões da comunidade.

```sql
CREATE TABLE forums (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    game_id INTEGER REFERENCES games(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: forum_topics
Tópicos de discussão nos fóruns.

```sql
CREATE TABLE forum_topics (
    id SERIAL PRIMARY KEY,
    forum_id INTEGER REFERENCES forums(id),
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    last_reply_at TIMESTAMP,
    last_reply_user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: forum_posts
Respostas aos tópicos dos fóruns.

```sql
CREATE TABLE forum_posts (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER REFERENCES forum_topics(id),
    user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    parent_post_id INTEGER REFERENCES forum_posts(id), -- For nested replies
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: user_follows
Sistema de seguir outros usuários.

```sql
CREATE TABLE user_follows (
    id SERIAL PRIMARY KEY,
    follower_id INTEGER REFERENCES users(id),
    following_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id)
);
```

### Tabela: notifications
Sistema de notificações para usuários.

```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- new_setup, new_comment, new_follower, etc.
    title VARCHAR(200) NOT NULL,
    message TEXT,
    related_id INTEGER, -- ID of related object (setup, comment, etc.)
    related_type VARCHAR(50), -- Type of related object
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: setup_downloads
Rastreamento de downloads de setups.

```sql
CREATE TABLE setup_downloads (
    id SERIAL PRIMARY KEY,
    setup_id INTEGER REFERENCES setups(id),
    user_id INTEGER REFERENCES users(id),
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(setup_id, user_id)
);
```

### Tabela: user_achievements
Sistema de conquistas e badges para usuários.

```sql
CREATE TABLE user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    achievement_type VARCHAR(50) NOT NULL, -- first_setup, speed_demon, community_helper, etc.
    achievement_name VARCHAR(100) NOT NULL,
    description TEXT,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_type)
);
```


## Índices e Otimizações

Para garantir performance adequada, os seguintes índices devem ser criados:

```sql
-- Índices para consultas frequentes de setups
CREATE INDEX idx_setups_car_track ON setups(car_id, track_id);
CREATE INDEX idx_setups_user_public ON setups(user_id, is_public);
CREATE INDEX idx_setups_rating ON setups(rating_average DESC);
CREATE INDEX idx_setups_downloads ON setups(download_count DESC);

-- Índices para telemetria e lap times
CREATE INDEX idx_lap_times_user_car_track ON lap_times(user_id, car_id, track_id);
CREATE INDEX idx_lap_times_best_times ON lap_times(car_id, track_id, lap_time ASC) WHERE is_valid = TRUE;
CREATE INDEX idx_telemetry_sessions_user ON telemetry_sessions(user_id, created_at DESC);

-- Índices para leaderboards
CREATE INDEX idx_leaderboard_entries_position ON leaderboard_entries(leaderboard_id, position);
CREATE INDEX idx_leaderboard_entries_time ON leaderboard_entries(leaderboard_id, lap_time ASC);

-- Índices para fóruns
CREATE INDEX idx_forum_topics_forum_updated ON forum_topics(forum_id, updated_at DESC);
CREATE INDEX idx_forum_posts_topic ON forum_posts(topic_id, created_at ASC);

-- Índices para notificações
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);
```

## Relacionamentos e Constraints

### Chaves Estrangeiras e Integridade Referencial

Todos os relacionamentos entre tabelas são mantidos através de chaves estrangeiras com constraints de integridade referencial. As principais relações incluem:

- **Usuários → Setups**: Um usuário pode criar múltiplos setups
- **Carros/Pistas → Setups**: Cada setup é específico para uma combinação carro-pista
- **Setups → Telemetria**: Sessões de telemetria são vinculadas aos setups utilizados
- **Usuários → Lap Times**: Tempos de volta são associados aos usuários que os registraram
- **Leaderboards → Entries**: Rankings contêm múltiplas entradas de usuários

### Triggers e Procedures

```sql
-- Trigger para atualizar rating médio dos setups
CREATE OR REPLACE FUNCTION update_setup_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE setups 
    SET rating_average = (
        SELECT AVG(rating)::DECIMAL(3,2) 
        FROM setup_ratings 
        WHERE setup_id = NEW.setup_id
    ),
    rating_count = (
        SELECT COUNT(*) 
        FROM setup_ratings 
        WHERE setup_id = NEW.setup_id
    )
    WHERE id = NEW.setup_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_setup_rating
    AFTER INSERT OR UPDATE OR DELETE ON setup_ratings
    FOR EACH ROW EXECUTE FUNCTION update_setup_rating();

-- Trigger para atualizar contadores de tópicos do fórum
CREATE OR REPLACE FUNCTION update_topic_counters()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE forum_topics 
    SET reply_count = (
        SELECT COUNT(*) 
        FROM forum_posts 
        WHERE topic_id = NEW.topic_id AND is_deleted = FALSE
    ),
    last_reply_at = NEW.created_at,
    last_reply_user_id = NEW.user_id
    WHERE id = NEW.topic_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_topic_counters
    AFTER INSERT ON forum_posts
    FOR EACH ROW EXECUTE FUNCTION update_topic_counters();
```

## Considerações de Segurança

### Autenticação e Autorização

- **Hashing de Senhas**: Utilização de bcrypt ou Argon2 para hash de senhas
- **JWT Tokens**: Implementação de JSON Web Tokens para autenticação stateless
- **Rate Limiting**: Limitação de requisições por IP/usuário para prevenir abuso
- **Validação de Entrada**: Sanitização e validação rigorosa de todos os dados de entrada

### Proteção de Dados

- **Criptografia**: Dados sensíveis criptografados em repouso
- **HTTPS**: Comunicação exclusivamente via HTTPS
- **Backup Seguro**: Backups regulares com criptografia
- **Logs de Auditoria**: Registro de ações críticas para auditoria

## Escalabilidade e Performance

### Estratégias de Cache

- **Redis Cache**: Cache de dados frequentemente acessados como rankings e perfis de usuário
- **CDN**: Distribuição de conteúdo estático via CDN
- **Database Connection Pooling**: Pool de conexões para otimizar acesso ao banco

### Particionamento de Dados

Para grandes volumes de dados de telemetria, considerar particionamento por:
- **Data**: Partições mensais ou trimestrais para dados históricos
- **Jogo**: Separação por jogo para otimizar consultas específicas
- **Usuário**: Distribuição baseada em hash do user_id para balanceamento

### Monitoramento e Métricas

- **Application Performance Monitoring (APM)**: Monitoramento de performance da aplicação
- **Database Monitoring**: Métricas de performance do banco de dados
- **Error Tracking**: Rastreamento e alertas de erros em tempo real
- **Usage Analytics**: Análise de uso para otimização contínua

