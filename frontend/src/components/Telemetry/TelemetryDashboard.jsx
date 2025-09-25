import React, { useState, useEffect, useRef } from 'react';
import { Line, Bar, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Componente principal do dashboard de telemetria
const TelemetryDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [filters, setFilters] = useState({
    game: '',
    car: '',
    track: '',
    weather: ''
  });

  useEffect(() => {
    fetchSessions();
  }, [filters]);

  const fetchSessions = async () => {
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/telemetry/sessions?${params}`);
      const data = await response.json();
      if (data.success) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Erro ao buscar sessões:', error);
    }
  };

  const startLiveMode = () => {
    setIsLiveMode(true);
    // Implementar WebSocket ou polling para dados em tempo real
  };

  const stopLiveMode = () => {
    setIsLiveMode(false);
    setLiveData(null);
  };

  return (
    <div className="telemetry-dashboard">
      <div className="dashboard-header">
        <h1>Telemetria SimSetupLab</h1>
        <div className="live-controls">
          {!isLiveMode ? (
            <button onClick={startLiveMode} className="btn btn-primary">
              🔴 Iniciar Modo Ao Vivo
            </button>
          ) : (
            <button onClick={stopLiveMode} className="btn btn-danger">
              ⏹️ Parar Modo Ao Vivo
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-content">
        <div className="sidebar">
          <SessionFilters filters={filters} setFilters={setFilters} />
          <SessionList 
            sessions={sessions} 
            selectedSession={selectedSession}
            setSelectedSession={setSelectedSession}
          />
        </div>

        <div className="main-content">
          {isLiveMode && liveData ? (
            <LiveTelemetryView data={liveData} />
          ) : selectedSession ? (
            <SessionAnalysisView session={selectedSession} />
          ) : (
            <WelcomeView />
          )}
        </div>
      </div>
    </div>
  );
};

// Componente de filtros de sessão
const SessionFilters = ({ filters, setFilters }) => {
  const [games, setGames] = useState([]);
  const [cars, setCars] = useState([]);
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const [gamesRes, carsRes, tracksRes] = await Promise.all([
        fetch('/api/games'),
        fetch('/api/cars'),
        fetch('/api/tracks')
      ]);
      
      const [gamesData, carsData, tracksData] = await Promise.all([
        gamesRes.json(),
        carsRes.json(),
        tracksRes.json()
      ]);

      setGames(gamesData.games || []);
      setCars(carsData.cars || []);
      setTracks(tracksData.tracks || []);
    } catch (error) {
      console.error('Erro ao buscar opções de filtro:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="session-filters">
      <h3>Filtros</h3>
      
      <div className="filter-group">
        <label>Jogo:</label>
        <select 
          value={filters.game} 
          onChange={(e) => handleFilterChange('game', e.target.value)}
        >
          <option value="">Todos</option>
          {games.map(game => (
            <option key={game.id} value={game.id}>{game.name}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Carro:</label>
        <select 
          value={filters.car} 
          onChange={(e) => handleFilterChange('car', e.target.value)}
        >
          <option value="">Todos</option>
          {cars.map(car => (
            <option key={car.id} value={car.id}>{car.name}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Pista:</label>
        <select 
          value={filters.track} 
          onChange={(e) => handleFilterChange('track', e.target.value)}
        >
          <option value="">Todas</option>
          {tracks.map(track => (
            <option key={track.id} value={track.id}>{track.name}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Clima:</label>
        <select 
          value={filters.weather} 
          onChange={(e) => handleFilterChange('weather', e.target.value)}
        >
          <option value="">Todos</option>
          <option value="clear">Limpo</option>
          <option value="rain">Chuva</option>
          <option value="overcast">Nublado</option>
        </select>
      </div>
    </div>
  );
};

// Lista de sessões
const SessionList = ({ sessions, selectedSession, setSelectedSession }) => {
  const formatTime = (seconds) => {
    if (!seconds) return '--:--:---';
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3);
    return `${mins}:${secs.padStart(6, '0')}`;
  };

  return (
    <div className="session-list">
      <h3>Sessões Recentes</h3>
      <div className="sessions">
        {sessions.map(session => (
          <div 
            key={session.id}
            className={`session-item ${selectedSession?.id === session.id ? 'selected' : ''}`}
            onClick={() => setSelectedSession(session)}
          >
            <div className="session-header">
              <span className="session-name">{session.session_name}</span>
              <span className="session-date">
                {new Date(session.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="session-details">
              <span className="best-time">
                🏁 {formatTime(session.best_lap_time)}
              </span>
              <span className="lap-count">
                📊 {session.valid_laps}/{session.total_laps} voltas
              </span>
            </div>
            <div className="session-meta">
              <span className="game">{session.game?.name}</span>
              <span className="track">{session.track?.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Visualização de telemetria ao vivo
const LiveTelemetryView = ({ data }) => {
  const [telemetryHistory, setTelemetryHistory] = useState([]);
  const maxHistoryPoints = 100;

  useEffect(() => {
    if (data) {
      setTelemetryHistory(prev => {
        const newHistory = [...prev, data];
        return newHistory.slice(-maxHistoryPoints);
      });
    }
  }, [data]);

  const speedData = {
    labels: telemetryHistory.map((_, index) => index),
    datasets: [{
      label: 'Velocidade (km/h)',
      data: telemetryHistory.map(d => d.speed || 0),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1
    }]
  };

  const inputsData = {
    labels: telemetryHistory.map((_, index) => index),
    datasets: [
      {
        label: 'Acelerador (%)',
        data: telemetryHistory.map(d => d.throttle || 0),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        tension: 0.1
      },
      {
        label: 'Freio (%)',
        data: telemetryHistory.map(d => d.brake || 0),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="live-telemetry">
      <h2>Telemetria Ao Vivo</h2>
      
      <div className="live-stats">
        <div className="stat-card">
          <div className="stat-value">{(data?.speed || 0).toFixed(1)}</div>
          <div className="stat-label">km/h</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{(data?.throttle || 0).toFixed(0)}</div>
          <div className="stat-label">% Acelerador</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{(data?.brake || 0).toFixed(0)}</div>
          <div className="stat-label">% Freio</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data?.gear || 0}</div>
          <div className="stat-label">Marcha</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{(data?.rpm || 0).toFixed(0)}</div>
          <div className="stat-label">RPM</div>
        </div>
      </div>

      <div className="live-charts">
        <div className="chart-container">
          <h3>Velocidade</h3>
          <Line data={speedData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
        
        <div className="chart-container">
          <h3>Controles</h3>
          <Line data={inputsData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
};

// Análise detalhada de sessão
const SessionAnalysisView = ({ session }) => {
  const [laps, setLaps] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [selectedLaps, setSelectedLaps] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (session) {
      fetchSessionData();
    }
  }, [session]);

  const fetchSessionData = async () => {
    try {
      const [lapsRes, analysisRes] = await Promise.all([
        fetch(`/api/telemetry/sessions/${session.id}/laps`),
        fetch(`/api/telemetry/analysis/${session.id}`)
      ]);

      const [lapsData, analysisData] = await Promise.all([
        lapsRes.json(),
        analysisRes.json()
      ]);

      if (lapsData.success) setLaps(lapsData.laps);
      if (analysisData.success) setAnalysis(analysisData.analysis);
    } catch (error) {
      console.error('Erro ao buscar dados da sessão:', error);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '--:--:---';
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3);
    return `${mins}:${secs.padStart(6, '0')}`;
  };

  const lapTimesData = {
    labels: laps.map(lap => lap.lap_number),
    datasets: [{
      label: 'Tempo de Volta',
      data: laps.map(lap => lap.lap_time),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.1,
      pointBackgroundColor: laps.map(lap => lap.is_personal_best ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)'),
      pointRadius: laps.map(lap => lap.is_personal_best ? 6 : 3)
    }]
  };

  return (
    <div className="session-analysis">
      <div className="session-header">
        <h2>{session.session_name}</h2>
        <div className="session-info">
          <span>{session.game?.name} - {session.track?.name}</span>
          <span>{new Date(session.created_at).toLocaleString('pt-BR')}</span>
        </div>
      </div>

      <div className="analysis-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Visão Geral
        </button>
        <button 
          className={`tab ${activeTab === 'laps' ? 'active' : ''}`}
          onClick={() => setActiveTab('laps')}
        >
          Análise de Voltas
        </button>
        <button 
          className={`tab ${activeTab === 'sectors' ? 'active' : ''}`}
          onClick={() => setActiveTab('sectors')}
        >
          Setores
        </button>
        <button 
          className={`tab ${activeTab === 'comparison' ? 'active' : ''}`}
          onClick={() => setActiveTab('comparison')}
        >
          Comparação
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <OverviewTab session={session} analysis={analysis} />
        )}
        {activeTab === 'laps' && (
          <LapsTab 
            laps={laps} 
            lapTimesData={lapTimesData}
            selectedLaps={selectedLaps}
            setSelectedLaps={setSelectedLaps}
          />
        )}
        {activeTab === 'sectors' && (
          <SectorsTab analysis={analysis} />
        )}
        {activeTab === 'comparison' && (
          <ComparisonTab selectedLaps={selectedLaps} />
        )}
      </div>
    </div>
  );
};

// Aba de visão geral
const OverviewTab = ({ session, analysis }) => {
  if (!analysis) return <div>Carregando análise...</div>;

  return (
    <div className="overview-tab">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Melhor Volta</h3>
          <div className="stat-value">{formatTime(analysis.statistics.best_lap_time)}</div>
        </div>
        <div className="stat-card">
          <h3>Tempo Médio</h3>
          <div className="stat-value">{formatTime(analysis.statistics.average_lap_time)}</div>
        </div>
        <div className="stat-card">
          <h3>Voltas Válidas</h3>
          <div className="stat-value">{analysis.statistics.valid_laps}</div>
        </div>
        <div className="stat-card">
          <h3>Consistência</h3>
          <div className="stat-value">{(analysis.statistics.average_consistency || 0).toFixed(1)}%</div>
        </div>
      </div>

      <div className="conditions-info">
        <h3>Condições da Sessão</h3>
        <div className="conditions-grid">
          <div className="condition-item">
            <span className="label">Clima:</span>
            <span className="value">{session.weather_condition || 'N/A'}</span>
          </div>
          <div className="condition-item">
            <span className="label">Temp. Pista:</span>
            <span className="value">{session.track_temperature ? `${session.track_temperature}°C` : 'N/A'}</span>
          </div>
          <div className="condition-item">
            <span className="label">Temp. Ar:</span>
            <span className="value">{session.air_temperature ? `${session.air_temperature}°C` : 'N/A'}</span>
          </div>
          <div className="condition-item">
            <span className="label">Umidade:</span>
            <span className="value">{session.humidity ? `${session.humidity}%` : 'N/A'}</span>
          </div>
        </div>
      </div>

      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="recommendations">
          <h3>Recomendações da IA</h3>
          {analysis.recommendations.map((rec, index) => (
            <div key={index} className={`recommendation ${rec.priority}`}>
              <div className="rec-type">{rec.type}</div>
              <div className="rec-message">{rec.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Aba de análise de voltas
const LapsTab = ({ laps, lapTimesData, selectedLaps, setSelectedLaps }) => {
  const handleLapSelection = (lapId) => {
    setSelectedLaps(prev => {
      if (prev.includes(lapId)) {
        return prev.filter(id => id !== lapId);
      } else {
        return [...prev, lapId];
      }
    });
  };

  return (
    <div className="laps-tab">
      <div className="lap-times-chart">
        <h3>Evolução dos Tempos de Volta</h3>
        <Line 
          data={lapTimesData} 
          options={{ 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const lap = laps[context.dataIndex];
                    return `Volta ${lap.lap_number}: ${formatTime(lap.lap_time)}${lap.is_personal_best ? ' (PB)' : ''}`;
                  }
                }
              }
            }
          }} 
        />
      </div>

      <div className="laps-table">
        <h3>Detalhes das Voltas</h3>
        <table>
          <thead>
            <tr>
              <th>Selecionar</th>
              <th>Volta</th>
              <th>Tempo</th>
              <th>S1</th>
              <th>S2</th>
              <th>S3</th>
              <th>Vel. Máx</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {laps.map(lap => (
              <tr key={lap.id} className={lap.is_personal_best ? 'personal-best' : ''}>
                <td>
                  <input 
                    type="checkbox"
                    checked={selectedLaps.includes(lap.id)}
                    onChange={() => handleLapSelection(lap.id)}
                  />
                </td>
                <td>{lap.lap_number}</td>
                <td>{formatTime(lap.lap_time)}</td>
                <td>{formatTime(lap.sector_1_time)}</td>
                <td>{formatTime(lap.sector_2_time)}</td>
                <td>{formatTime(lap.sector_3_time)}</td>
                <td>{lap.top_speed ? `${lap.top_speed.toFixed(1)} km/h` : 'N/A'}</td>
                <td>
                  {lap.is_personal_best && <span className="badge pb">PB</span>}
                  {!lap.is_valid && <span className="badge invalid">Inválida</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Aba de análise de setores
const SectorsTab = ({ analysis }) => {
  if (!analysis?.sector_analysis) return <div>Dados de setores não disponíveis</div>;

  const sectorData = {
    labels: ['Setor 1', 'Setor 2', 'Setor 3'],
    datasets: [
      {
        label: 'Melhor Tempo',
        data: [
          analysis.sector_analysis.sector_1?.best_time || 0,
          analysis.sector_analysis.sector_2?.best_time || 0,
          analysis.sector_analysis.sector_3?.best_time || 0
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.8)'
      },
      {
        label: 'Tempo Médio',
        data: [
          analysis.sector_analysis.sector_1?.average_time || 0,
          analysis.sector_analysis.sector_2?.average_time || 0,
          analysis.sector_analysis.sector_3?.average_time || 0
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.8)'
      }
    ]
  };

  return (
    <div className="sectors-tab">
      <div className="sector-chart">
        <h3>Análise de Setores</h3>
        <Bar 
          data={sectorData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Tempo (segundos)'
                }
              }
            }
          }}
        />
      </div>

      <div className="sector-details">
        {Object.entries(analysis.sector_analysis).map(([sectorKey, sectorData]) => (
          <div key={sectorKey} className="sector-detail">
            <h4>{sectorKey.replace('_', ' ').toUpperCase()}</h4>
            <div className="sector-stats">
              <div className="stat">
                <span className="label">Melhor:</span>
                <span className="value">{formatTime(sectorData.best_time)}</span>
              </div>
              <div className="stat">
                <span className="label">Médio:</span>
                <span className="value">{formatTime(sectorData.average_time)}</span>
              </div>
              <div className="stat">
                <span className="label">Pior:</span>
                <span className="value">{formatTime(sectorData.worst_time)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Aba de comparação
const ComparisonTab = ({ selectedLaps }) => {
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedLaps.length >= 2) {
      compareSelectedLaps();
    }
  }, [selectedLaps]);

  const compareSelectedLaps = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/telemetry/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lap_ids: selectedLaps })
      });

      const data = await response.json();
      if (data.success) {
        setComparisonData(data.comparison);
      }
    } catch (error) {
      console.error('Erro ao comparar voltas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (selectedLaps.length < 2) {
    return (
      <div className="comparison-tab">
        <div className="comparison-message">
          <h3>Selecione pelo menos 2 voltas para comparar</h3>
          <p>Use as caixas de seleção na aba "Análise de Voltas" para escolher as voltas que deseja comparar.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Comparando voltas...</div>;
  }

  if (!comparisonData) {
    return <div>Erro ao carregar dados de comparação</div>;
  }

  return (
    <div className="comparison-tab">
      <h3>Comparação de Voltas</h3>
      
      <div className="comparison-table">
        <table>
          <thead>
            <tr>
              <th>Piloto</th>
              <th>Volta</th>
              <th>Tempo Total</th>
              <th>Setor 1</th>
              <th>Setor 2</th>
              <th>Setor 3</th>
              <th>Vel. Máx</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.laps.map(lap => (
              <tr key={lap.id} className={lap.id === comparisonData.analysis.fastest_lap ? 'fastest' : ''}>
                <td>{lap.username}</td>
                <td>{lap.lap_number}</td>
                <td>{formatTime(lap.lap_time)}</td>
                <td>{lap.sectors[0] ? formatTime(lap.sectors[0].sector_time) : 'N/A'}</td>
                <td>{lap.sectors[1] ? formatTime(lap.sectors[1].sector_time) : 'N/A'}</td>
                <td>{lap.sectors[2] ? formatTime(lap.sectors[2].sector_time) : 'N/A'}</td>
                <td>{lap.top_speed ? `${lap.top_speed.toFixed(1)} km/h` : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sector-comparison">
        <h4>Análise por Setores</h4>
        {Object.entries(comparisonData.analysis.sector_comparison).map(([sectorKey, sectorData]) => (
          <div key={sectorKey} className="sector-comparison-item">
            <h5>{sectorKey.replace('_', ' ').toUpperCase()}</h5>
            <p>Mais rápido: <strong>{sectorData.fastest.username}</strong> - {formatTime(sectorData.fastest.time)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Tela de boas-vindas
const WelcomeView = () => (
  <div className="welcome-view">
    <div className="welcome-content">
      <h2>Bem-vindo ao Sistema de Telemetria</h2>
      <p>Selecione uma sessão na barra lateral para começar a análise, ou inicie o modo ao vivo para capturar dados em tempo real.</p>
      
      <div className="features">
        <div className="feature">
          <h3>📊 Análise Detalhada</h3>
          <p>Visualize gráficos detalhados de velocidade, aceleração, frenagem e muito mais.</p>
        </div>
        <div className="feature">
          <h3>🏁 Comparação de Voltas</h3>
          <p>Compare diferentes voltas para identificar onde você pode melhorar.</p>
        </div>
        <div className="feature">
          <h3>🤖 IA Assistente</h3>
          <p>Receba dicas personalizadas baseadas na análise dos seus dados.</p>
        </div>
        <div className="feature">
          <h3>🔴 Modo Ao Vivo</h3>
          <p>Monitore sua performance em tempo real durante as sessões.</p>
        </div>
      </div>
    </div>
  </div>
);

// Função auxiliar para formatação de tempo
const formatTime = (seconds) => {
  if (!seconds) return '--:--:---';
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3);
  return `${mins}:${secs.padStart(6, '0')}`;
};

export default TelemetryDashboard;
