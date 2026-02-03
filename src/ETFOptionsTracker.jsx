import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

// Crypto ETF symbols
const ETF_SYMBOLS = [
  { symbol: 'IBIT', name: 'BlackRock Bitcoin ETF' },
  { symbol: 'ETHA', name: 'BlackRock Ethereum ETF' },
  { symbol: 'FBTC', name: 'Fidelity Bitcoin ETF' },
  { symbol: 'ARKB', name: 'ARK 21Shares Bitcoin ETF' },
  { symbol: 'BITB', name: 'Bitwise Bitcoin ETF' },
  { symbol: 'GBTC', name: 'Grayscale Bitcoin Trust' },
];

// Explanations
const EXPLANATIONS = [
  { term: 'CALL 옵션', desc: '특정 가격에 살 수 있는 권리. 가격 상승을 예상할 때 매수합니다.' },
  { term: 'PUT 옵션', desc: '특정 가격에 팔 수 있는 권리. 가격 하락을 예상할 때 매수합니다.' },
  { term: '거래량 (Volume)', desc: '오늘 거래된 계약 수입니다.' },
  { term: '미결제약정 (OI)', desc: 'Open Interest - 아직 청산되지 않은 총 계약 수입니다.' },
  { term: 'Put/Call 비율', desc: '풋 거래량 ÷ 콜 거래량. 1 이상이면 약세, 1 미만이면 강세 심리입니다.' },
  { term: '이상 거래', desc: '거래량이 미결제약정보다 높으면 (Vol/OI > 0.5) 새로운 큰 포지션이 열린 것일 수 있습니다.' },
  { term: '내재변동성 (IV)', desc: '옵션 가격에 내포된 예상 변동성입니다. 높을수록 옵션이 비쌉니다.' },
];

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    background: '#000000',
    color: '#e0e0e0',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    padding: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
  },
  subtitle: {
    fontSize: '12px',
    color: '#666',
    marginTop: '4px',
  },
  controls: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  select: {
    background: '#111',
    border: '1px solid #333',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  button: {
    background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
    border: 'none',
    color: '#000',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  priceBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#111',
    border: '1px solid #222',
    borderRadius: '8px',
    padding: '10px 16px',
  },
  priceLabel: {
    fontSize: '12px',
    color: '#888',
  },
  priceValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#fff',
  },
  priceChange: {
    fontSize: '12px',
    fontWeight: '600',
  },
  // Explanation box
  explanationBox: {
    background: '#0a0a0a',
    border: '1px solid #1a1a1a',
    borderRadius: '8px',
    marginBottom: '16px',
    overflow: 'hidden',
  },
  explanationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  explanationTitle: {
    fontSize: '14px',
    color: '#888',
  },
  explanationToggle: {
    fontSize: '12px',
    color: '#666',
  },
  explanationContent: {
    padding: '0 16px 16px 16px',
    borderTop: '1px solid #1a1a1a',
  },
  explanationItem: {
    padding: '8px 0',
    borderBottom: '1px solid #111',
    fontSize: '13px',
  },
  explanationTerm: {
    color: '#00d4ff',
    fontWeight: '600',
    marginBottom: '4px',
  },
  explanationDesc: {
    color: '#888',
    lineHeight: '1.5',
  },
  // Stats
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    background: '#0a0a0a',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    padding: '20px',
  },
  statLabel: {
    fontSize: '11px',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    marginTop: '8px',
  },
  // Charts
  chartContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },
  chartCard: {
    background: '#0a0a0a',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    padding: '20px',
  },
  chartTitle: {
    fontSize: '14px',
    color: '#888',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  // Unusual table
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  th: {
    textAlign: 'left',
    padding: '14px 12px',
    borderBottom: '1px solid #222',
    color: '#888',
    fontWeight: '500',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  td: {
    padding: '14px 12px',
    borderBottom: '1px solid #111',
  },
  unusualRow: {
    background: 'rgba(0, 255, 136, 0.08)',
    borderLeft: '3px solid #00ff88',
  },
  tag: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '600',
    marginRight: '4px',
  },
  callTag: {
    background: 'rgba(0, 255, 136, 0.2)',
    color: '#00ff88',
  },
  putTag: {
    background: 'rgba(255, 68, 68, 0.2)',
    color: '#ff4444',
  },
  loader: {
    textAlign: 'center',
    padding: '60px',
    color: '#666',
  },
  error: {
    background: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid rgba(255, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '16px',
    color: '#ff6b6b',
    marginBottom: '24px',
  },
  expiryTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  expiryTab: {
    background: '#111',
    border: '1px solid #333',
    color: '#888',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  expiryTabActive: {
    background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
    border: '1px solid transparent',
    color: '#000',
    fontWeight: '600',
  },
};

// Helpers
const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num?.toLocaleString() || '0';
};

const formatPrice = (num) => {
  return num?.toLocaleString('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }) || '$0.00';
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1a1a1a', padding: '10px', borderRadius: '8px', border: '1px solid #333' }}>
        <p style={{ color: '#fff', margin: 0 }}>행사가: ${label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, margin: '4px 0 0 0' }}>
            {p.name}: {formatNumber(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ETFOptionsTracker() {
  const [selectedSymbol, setSelectedSymbol] = useState('IBIT');
  const [optionsData, setOptionsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedExpiry, setSelectedExpiry] = useState(null);
  const [explanationOpen, setExplanationOpen] = useState(false);

  // Fetch options data from Yahoo Finance
  const fetchOptionsData = useCallback(async (symbol, expiryDate = null) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use CORS proxy for Yahoo Finance
      const baseUrl = `https://query1.finance.yahoo.com/v7/finance/options/${symbol}`;
      const url = expiryDate ? `${baseUrl}?date=${expiryDate}` : baseUrl;
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      
      if (!data.optionChain?.result?.[0]) {
        throw new Error('No options data available');
      }
      
      const result = data.optionChain.result[0];
      setOptionsData(result);
      setLastUpdate(new Date());
      
      // Set first expiry if not set
      if (!selectedExpiry && result.expirationDates?.length > 0) {
        setSelectedExpiry(result.expirationDates[0]);
      }
      
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to fetch options data');
    } finally {
      setLoading(false);
    }
  }, [selectedExpiry]);

  // Initial fetch
  useEffect(() => {
    fetchOptionsData(selectedSymbol);
  }, [selectedSymbol]);

  // Fetch when expiry changes
  useEffect(() => {
    if (selectedExpiry) {
      fetchOptionsData(selectedSymbol, selectedExpiry);
    }
  }, [selectedExpiry, selectedSymbol]);

  // Process data for charts
  const processedData = React.useMemo(() => {
    if (!optionsData) return null;

    const calls = optionsData.options?.[0]?.calls || [];
    const puts = optionsData.options?.[0]?.puts || [];
    const quote = optionsData.quote || {};

    // Total volumes
    const totalCallVolume = calls.reduce((sum, c) => sum + (c.volume || 0), 0);
    const totalPutVolume = puts.reduce((sum, c) => sum + (c.volume || 0), 0);
    const totalCallOI = calls.reduce((sum, c) => sum + (c.openInterest || 0), 0);
    const totalPutOI = puts.reduce((sum, c) => sum + (c.openInterest || 0), 0);

    // Put/Call ratio
    const pcRatio = totalCallVolume > 0 ? (totalPutVolume / totalCallVolume).toFixed(2) : 0;

    // Volume by strike (top 15 most active)
    const strikeMap = new Map();
    
    calls.forEach(c => {
      const key = c.strike;
      if (!strikeMap.has(key)) strikeMap.set(key, { strike: key, callVol: 0, putVol: 0, callOI: 0, putOI: 0 });
      const entry = strikeMap.get(key);
      entry.callVol += c.volume || 0;
      entry.callOI += c.openInterest || 0;
    });
    
    puts.forEach(p => {
      const key = p.strike;
      if (!strikeMap.has(key)) strikeMap.set(key, { strike: key, callVol: 0, putVol: 0, callOI: 0, putOI: 0 });
      const entry = strikeMap.get(key);
      entry.putVol += p.volume || 0;
      entry.putOI += p.openInterest || 0;
    });

    const volumeByStrike = Array.from(strikeMap.values())
      .map(s => ({ ...s, totalVol: s.callVol + s.putVol }))
      .sort((a, b) => b.totalVol - a.totalVol)
      .slice(0, 15)
      .sort((a, b) => a.strike - b.strike);

    // OI by strike
    const oiByStrike = Array.from(strikeMap.values())
      .map(s => ({ ...s, totalOI: s.callOI + s.putOI }))
      .sort((a, b) => b.totalOI - a.totalOI)
      .slice(0, 15)
      .sort((a, b) => a.strike - b.strike);

    // Unusual activity (Vol/OI > 0.5)
    const unusualCalls = calls
      .filter(c => c.openInterest > 0 && c.volume > 0)
      .map(c => ({
        ...c,
        type: 'CALL',
        volOiRatio: c.volume / c.openInterest
      }))
      .filter(c => c.volOiRatio > 0.5)
      .sort((a, b) => b.volOiRatio - a.volOiRatio);

    const unusualPuts = puts
      .filter(p => p.openInterest > 0 && p.volume > 0)
      .map(p => ({
        ...p,
        type: 'PUT',
        volOiRatio: p.volume / p.openInterest
      }))
      .filter(p => p.volOiRatio > 0.5)
      .sort((a, b) => b.volOiRatio - a.volOiRatio);

    const unusualActivity = [...unusualCalls, ...unusualPuts]
      .sort((a, b) => b.volOiRatio - a.volOiRatio)
      .slice(0, 10);

    // Pie chart data for sentiment
    const sentimentData = [
      { name: 'CALL Volume', value: totalCallVolume, color: '#00ff88' },
      { name: 'PUT Volume', value: totalPutVolume, color: '#ff4444' },
    ];

    return {
      quote,
      totalCallVolume,
      totalPutVolume,
      totalCallOI,
      totalPutOI,
      pcRatio,
      volumeByStrike,
      oiByStrike,
      unusualActivity,
      sentimentData,
    };
  }, [optionsData]);

  const currentETF = ETF_SYMBOLS.find(e => e.symbol === selectedSymbol);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🏦 Crypto ETF 옵션 트래커</h1>
          <p style={styles.subtitle}>
            Data from Yahoo Finance • {lastUpdate ? `업데이트 ${lastUpdate.toLocaleTimeString()}` : '로딩 중...'}
          </p>
        </div>
        <div style={styles.controls}>
          {processedData?.quote && (
            <div style={styles.priceBox}>
              <div>
                <div style={styles.priceLabel}>{selectedSymbol} 현재가</div>
                <div style={styles.priceValue}>
                  {formatPrice(processedData.quote.regularMarketPrice)}
                </div>
              </div>
              {processedData.quote.regularMarketChangePercent && (
                <div style={{ 
                  ...styles.priceChange, 
                  color: processedData.quote.regularMarketChangePercent >= 0 ? '#00ff88' : '#ff4444' 
                }}>
                  {processedData.quote.regularMarketChangePercent >= 0 ? '▲' : '▼'} 
                  {Math.abs(processedData.quote.regularMarketChangePercent).toFixed(2)}%
                </div>
              )}
            </div>
          )}
          
          <select 
            style={styles.select} 
            value={selectedSymbol} 
            onChange={(e) => {
              setSelectedSymbol(e.target.value);
              setSelectedExpiry(null);
            }}
          >
            {ETF_SYMBOLS.map(etf => (
              <option key={etf.symbol} value={etf.symbol}>
                {etf.symbol} - {etf.name}
              </option>
            ))}
          </select>
          
          <button 
            style={styles.button} 
            onClick={() => fetchOptionsData(selectedSymbol, selectedExpiry)}
            disabled={loading}
          >
            {loading ? '로딩...' : '↻ 새로고침'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <div style={styles.error}>⚠️ {error}</div>}

      {/* Explanation Box */}
      <div style={styles.explanationBox}>
        <div style={styles.explanationHeader} onClick={() => setExplanationOpen(!explanationOpen)}>
          <div style={styles.explanationTitle}>📚 용어 설명</div>
          <div style={styles.explanationToggle}>
            {explanationOpen ? '▲ 접기' : '▼ 펼치기'}
          </div>
        </div>
        {explanationOpen && (
          <div style={styles.explanationContent}>
            {EXPLANATIONS.map((item, idx) => (
              <div key={idx} style={{ ...styles.explanationItem, borderBottom: idx === EXPLANATIONS.length - 1 ? 'none' : '1px solid #111' }}>
                <div style={styles.explanationTerm}>{item.term}</div>
                <div style={styles.explanationDesc}>{item.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expiry Tabs */}
      {optionsData?.expirationDates && (
        <div style={styles.expiryTabs}>
          <span style={{ color: '#666', fontSize: '12px', alignSelf: 'center', marginRight: '8px' }}>만기일:</span>
          {optionsData.expirationDates.slice(0, 8).map(exp => (
            <button
              key={exp}
              style={{
                ...styles.expiryTab,
                ...(selectedExpiry === exp ? styles.expiryTabActive : {})
              }}
              onClick={() => setSelectedExpiry(exp)}
            >
              {formatDate(exp)}
            </button>
          ))}
        </div>
      )}

      {loading && !processedData ? (
        <div style={styles.loader}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
          옵션 데이터 로딩 중...
        </div>
      ) : processedData && (
        <>
          {/* Stats */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>총 CALL 거래량</div>
              <div style={{ ...styles.statValue, color: '#00ff88' }}>
                {formatNumber(processedData.totalCallVolume)}
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>총 PUT 거래량</div>
              <div style={{ ...styles.statValue, color: '#ff4444' }}>
                {formatNumber(processedData.totalPutVolume)}
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Put/Call 비율</div>
              <div style={{ 
                ...styles.statValue, 
                color: processedData.pcRatio > 1 ? '#ff4444' : '#00ff88' 
              }}>
                {processedData.pcRatio}
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>총 미결제약정</div>
              <div style={styles.statValue}>
                {formatNumber(processedData.totalCallOI + processedData.totalPutOI)}
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>이상 거래 감지</div>
              <div style={{ ...styles.statValue, color: '#ffc800' }}>
                {processedData.unusualActivity.length}
              </div>
            </div>
          </div>

          {/* Charts */}
          <div style={styles.chartContainer}>
            {/* Volume by Strike */}
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>📊 행사가별 거래량</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processedData.volumeByStrike}>
                  <XAxis dataKey="strike" tick={{ fill: '#888', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                  <YAxis tick={{ fill: '#888', fontSize: 11 }} tickFormatter={formatNumber} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="callVol" name="CALL" stackId="a" fill="#00ff88" />
                  <Bar dataKey="putVol" name="PUT" stackId="a" fill="#ff4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* OI by Strike */}
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>📈 행사가별 미결제약정</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processedData.oiByStrike}>
                  <XAxis dataKey="strike" tick={{ fill: '#888', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                  <YAxis tick={{ fill: '#888', fontSize: 11 }} tickFormatter={formatNumber} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="callOI" name="CALL OI" stackId="a" fill="#00d4ff" />
                  <Bar dataKey="putOI" name="PUT OI" stackId="a" fill="#ff8800" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Sentiment Pie */}
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>🎯 거래량 심리</div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={processedData.sentimentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#888' }}
                  >
                    {processedData.sentimentData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Unusual Activity Table */}
          <div style={styles.chartCard}>
            <div style={styles.chartTitle}>🔥 이상 거래 감지 (Vol/OI {'>'} 0.5)</div>
            {processedData.unusualActivity.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>타입</th>
                      <th style={styles.th}>행사가</th>
                      <th style={styles.th}>거래량</th>
                      <th style={styles.th}>미결제약정</th>
                      <th style={styles.th}>Vol/OI</th>
                      <th style={styles.th}>최종가</th>
                      <th style={styles.th}>IV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedData.unusualActivity.map((item, idx) => (
                      <tr key={idx} style={item.volOiRatio > 1 ? styles.unusualRow : {}}>
                        <td style={styles.td}>
                          <span style={{ 
                            ...styles.tag, 
                            ...(item.type === 'CALL' ? styles.callTag : styles.putTag) 
                          }}>
                            {item.type}
                          </span>
                        </td>
                        <td style={styles.td}>${item.strike}</td>
                        <td style={styles.td}>{formatNumber(item.volume)}</td>
                        <td style={styles.td}>{formatNumber(item.openInterest)}</td>
                        <td style={{ 
                          ...styles.td, 
                          color: item.volOiRatio > 1 ? '#00ff88' : '#ffc800',
                          fontWeight: '600'
                        }}>
                          {item.volOiRatio.toFixed(2)}x
                        </td>
                        <td style={styles.td}>${item.lastPrice?.toFixed(2) || '-'}</td>
                        <td style={styles.td}>
                          {item.impliedVolatility ? `${(item.impliedVolatility * 100).toFixed(0)}%` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                이상 거래가 감지되지 않았습니다
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer */}
      <div style={{ marginTop: '32px', textAlign: 'center', color: '#444', fontSize: '11px' }}>
        Data from Yahoo Finance • 이상 거래 기준: Vol/OI {'>'} 0.5 • {currentETF?.name}
      </div>
    </div>
  );
}
