# Documentação e Guia de Implementação do Sistema de Telemetria

---

## 1. Visão Geral

Este documento detalha a arquitetura e o processo de implementação do novo sistema de telemetria para o **SimSetupLab.com**. O sistema foi projetado para ser robusto, escalável e fácil de integrar com a infraestrutura existente, oferecendo uma experiência de usuário rica e responsiva.

O sistema é composto por quatro componentes principais:

1.  **Backend Aprimorado (Flask):** Novos modelos de dados e rotas de API para gerenciar sessões de telemetria, voltas, setores e dados brutos.
2.  **Serviço de Integração com Jogos (Python):** Um serviço independente que captura dados de telemetria em tempo real de múltiplos simuladores (F1 25, ACC, iRacing, AMS2).
3.  **Frontend Responsivo (React):** Componentes React reutilizáveis para visualização de dados, análise de sessões e comparação de voltas, com um design moderno e responsivo.
4.  **Módulo de Análise com IA (Python):** Um sistema de análise avançada que processa os dados de telemetria para gerar insights, identificar padrões de pilotagem e fornecer recomendações de setup e de condução.

## 2. Estrutura de Arquivos

Os seguintes arquivos foram criados e devem ser integrados ao seu projeto:

-   `telemetry_enhanced_models.py`: Contém os novos modelos SQLAlchemy para a telemetria.
-   `telemetry_enhanced_routes.py`: Contém as novas rotas da API Flask para o sistema de telemetria.
-   `game_integrations.py`: O serviço de coleta de dados de telemetria dos jogos.
-   `telemetry_frontend_components.jsx`: Componentes React para o dashboard de telemetria.
-   `telemetry_styles.css`: Folha de estilos CSS para os componentes do frontend.
-   `telemetry_ai_analysis.py`: O módulo de análise avançada e IA.

## 3. Guia de Implementação do Backend

### 3.1. Integração dos Modelos

1.  **Copie os Modelos:** Adicione as classes `TelemetrySession`, `LapTimeEnhanced`, `SectorTime` e `TelemetryDataPoint` do arquivo `telemetry_enhanced_models.py` ao seu arquivo de modelos principal (ex: `src/models.py`) ou mantenha-o como um novo arquivo e importe-o onde necessário.

2.  **Atualize o Banco de Dados:** Execute uma migração do banco de dados (usando Flask-Migrate ou Alembic) para criar as novas tabelas. O comando geralmente é:

    ```bash
    flask db migrate -m "Adiciona modelos de telemetria aprimorados"
    flask db upgrade
    ```

### 3.2. Integração das Rotas da API

1.  **Registre o Blueprint:** No seu arquivo principal da aplicação Flask (ex: `src/main.py`), importe e registre o novo blueprint de telemetria.

    ```python
    # Em src/main.py
    from telemetry_enhanced_routes import telemetry_enhanced_bp

    # ... (código da sua aplicação)

    app.register_blueprint(telemetry_enhanced_bp, url_prefix=\'/api
    ```

2.  **Verifique as Dependências:** Certifique-se de que todas as importações no arquivo `telemetry_enhanced_routes.py` correspondem à estrutura do seu projeto (ex: `User`, `Car`, `Track`, `Game`).

3.  **Teste as Rotas:** Após iniciar o servidor Flask, você pode testar as novas rotas usando uma ferramenta como o Postman ou `curl`. Por exemplo:

    ```bash
    # Obter sessões públicas
    curl http://127.0.0.1:5000/api/telemetry/sessions

    # Obter o leaderboard para uma pista e carro específicos
    curl http://127.0.0.1:5000/api/telemetry/leaderboard?track_id=1&car_id=1
    ```

## 4. Guia de Implementação do Serviço de Integração com Jogos

O `game_integrations.py` é um serviço que deve ser executado em segundo plano no servidor ou na máquina do usuário para capturar e enviar os dados de telemetria para a API.

### 4.1. Configuração

1.  **Instale as Dependências:**

    ```bash
    pip install pyirsdk
    ```

2.  **Modifique o Callback:** A função `telemetry_callback` no final do arquivo `game_integrations.py` é um exemplo. Você deve modificá-la para enviar os dados para a sua API.

    ```python
    import requests

    API_ENDPOINT = "http://simsetuplab.com/api/telemetry/upload"

    def send_telemetry_to_api(data):
        try:
            # Aqui você deve adicionar lógica para associar os dados a uma sessão ativa
            # Por exemplo, obter o session_id do contexto do usuário
            session_id = get_active_session_id() # Função a ser implementada

            payload = {
                "session_id": session_id,
                "telemetry_points": [data]
            }

            response = requests.post(API_ENDPOINT, json=payload)
            if response.status_code == 201:
                print(f"Dados de {data[\'game\']} enviados com sucesso.")
            else:
                print(f"Erro ao enviar dados: {response.text}")
        except Exception as e:
            print(f"Erro no callback de telemetria: {e}")

    # No final do arquivo, substitua o callback de exemplo
    manager.set_data_callback(send_telemetry_to_api)
    ```

### 4.2. Execução

O serviço pode ser executado de duas formas:

*   **Como um Serviço de Servidor:** Inicie o `game_integrations.py` como um serviço `systemd` no seu servidor. Isso é ideal para coletar dados de múltiplos usuários se eles puderem redirecionar o UDP dos jogos para o servidor.
*   **Como um Aplicativo Desktop:** Empacote o script como um executável (usando PyInstaller ou similar) que os usuários podem baixar e executar em seus próprios computadores. Esta é a abordagem mais comum e recomendada, pois evita problemas de rede e firewall.

## 5. Guia de Implementação do Frontend

### 5.1. Integração dos Componentes React

1.  **Adicione os Arquivos:** Copie os arquivos `telemetry_frontend_components.jsx` e `telemetry_styles.css` para a estrutura do seu projeto React (ex: dentro de `src/components/Telemetry` e `src/styles`).

2.  **Instale as Dependências:**

    ```bash
    npm install react-chartjs-2 chart.js
    ```

3.  **Incorpore o Dashboard:** Importe e use o componente `TelemetryDashboard` em uma das suas páginas.

    ```jsx
    // Em uma página como /dashboard/telemetry
    import React from \'react\';
    import TelemetryDashboard from \'../components/Telemetry/TelemetryDashboard\';
    import \'../styles/telemetry_styles.css\';

    const TelemetryPage = () => {
      return (
        <div className="telemetry-page">
          <TelemetryDashboard />
        </div>
      );
    };

    export default TelemetryPage;
    ```

### 5.2. Configuração do Proxy da API

Para evitar problemas de CORS, configure um proxy no seu `package.json` (se estiver usando Create React App) ou no seu servidor de desenvolvimento para redirecionar as chamadas de `/api` para o seu backend Flask.

```json
// package.json
"proxy": "http://127.0.0.1:5000"
```

## 6. Módulo de Análise com IA

O arquivo `telemetry_ai_analysis.py` contém a lógica para análises avançadas. Ele foi projetado para ser usado de forma assíncrona após uma sessão de telemetria ser concluída.

### 6.1. Uso

1.  **Gatilho de Análise:** Crie um gatilho (trigger) que chame a função `analyze_telemetry_session` após o término de uma sessão. Isso pode ser feito através de uma rota de API específica ou um worker de tarefas (Celery, RQ).

    ```python
    # Exemplo de rota para iniciar a análise
    @app.route(\'/api/telemetry/sessions/<int:session_id>/analyze\', methods=[\'POST\'])
    def trigger_analysis(session_id):
        # Lógica para enfileirar a tarefa de análise
        # Ex: celery_task.delay(session_id)
        return jsonify({"message": "Análise iniciada"}), 202
    ```

2.  **Armazenamento dos Resultados:** Os resultados da análise (um JSON detalhado) devem ser armazenados no banco de dados, preferencialmente em um campo JSON na tabela `TelemetrySession` ou em uma tabela separada.

3.  **Exibição no Frontend:** Crie uma nova rota na API para servir os resultados da análise e exiba-os nos componentes React, como nos cartões de "Recomendações da IA" já presentes no `telemetry_frontend_components.jsx`.

## 7. Conclusão

Este sistema de telemetria fornece uma base sólida e completa para o SimSetupLab.com. A implementação cuidadosa desses componentes transformará a plataforma em uma ferramenta de análise de nível profissional, agregando imenso valor para a comunidade de automobilismo virtual no Brasil. Se precisar de mais detalhes sobre qualquer uma das etapas, estou à disposição para ajudar.

