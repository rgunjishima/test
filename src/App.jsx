import { useEffect, useState } from 'react'
import './App.css'

const TOKYO_LAT = 35.6762
const TOKYO_LON = 139.6503

const WEATHER_CODE_MAP = {
  0: { label: '快晴', icon: '☀️' },
  1: { label: '晴れ', icon: '🌤️' },
  2: { label: '一部曇り', icon: '⛅' },
  3: { label: '曇り', icon: '☁️' },
  45: { label: '霧', icon: '🌫️' },
  48: { label: '霧氷', icon: '🌫️' },
  51: { label: '小雨', icon: '🌦️' },
  53: { label: '雨', icon: '🌦️' },
  55: { label: '強い霧雨', icon: '🌧️' },
  56: { label: '着氷性の霧雨', icon: '🌧️' },
  57: { label: '強い着氷性の霧雨', icon: '🌧️' },
  61: { label: '弱い雨', icon: '🌧️' },
  63: { label: '雨', icon: '🌧️' },
  65: { label: '強い雨', icon: '🌧️' },
  66: { label: '着氷性の雨', icon: '🌧️' },
  67: { label: '強い着氷性の雨', icon: '🌧️' },
  71: { label: '弱い雪', icon: '🌨️' },
  73: { label: '雪', icon: '🌨️' },
  75: { label: '強い雪', icon: '❄️' },
  77: { label: '霧雪', icon: '❄️' },
  80: { label: 'にわか雨', icon: '🌦️' },
  81: { label: '強いにわか雨', icon: '🌧️' },
  82: { label: '非常に強いにわか雨', icon: '⛈️' },
  85: { label: 'にわか雪', icon: '🌨️' },
  86: { label: '強いにわか雪', icon: '❄️' },
  95: { label: '雷雨', icon: '⛈️' },
  96: { label: '雷雨(ひょうを伴う)', icon: '⛈️' },
  99: { label: '激しい雷雨(ひょうを伴う)', icon: '⛈️' },
}

function describeWeather(code) {
  return WEATHER_CODE_MAP[code] ?? { label: '不明', icon: '❓' }
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })
}

const WEATHER_URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${TOKYO_LAT}&longitude=${TOKYO_LON}` +
  `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
  `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
  `&timezone=Asia%2FTokyo`

function App() {
  const [weather, setWeather] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchWeather() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(WEATHER_URL)
        if (!res.ok) {
          throw new Error(`天気情報の取得に失敗しました (status: ${res.status})`)
        }
        const data = await res.json()
        if (!cancelled) {
          setWeather(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchWeather()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="app">
      <header className="header">
        <h1>東京都の天気</h1>
        <p className="subtitle">Tokyo Weather</p>
      </header>

      {loading && <p className="status">読み込み中...</p>}
      {error && <p className="status error">{error}</p>}

      {weather && !loading && !error && (
        <main>
          <section className="current-card">
            <div className="current-icon">
              {describeWeather(weather.current.weather_code).icon}
            </div>
            <div className="current-info">
              <div className="current-temp">
                {Math.round(weather.current.temperature_2m)}°C
              </div>
              <div className="current-label">
                {describeWeather(weather.current.weather_code).label}
              </div>
              <div className="current-details">
                <span>体感温度 {Math.round(weather.current.apparent_temperature)}°C</span>
                <span>湿度 {weather.current.relative_humidity_2m}%</span>
                <span>風速 {weather.current.wind_speed_10m}m/s</span>
              </div>
            </div>
          </section>

          <section className="forecast">
            <h2>週間予報</h2>
            <div className="forecast-list">
              {weather.daily.time.map((date, i) => {
                const info = describeWeather(weather.daily.weather_code[i])
                return (
                  <div className="forecast-item" key={date}>
                    <div className="forecast-date">{formatDate(date)}</div>
                    <div className="forecast-icon">{info.icon}</div>
                    <div className="forecast-temps">
                      <span className="temp-max">
                        {Math.round(weather.daily.temperature_2m_max[i])}°
                      </span>
                      <span className="temp-min">
                        {Math.round(weather.daily.temperature_2m_min[i])}°
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </main>
      )}

      <footer className="footer">
        <p>データ提供: Open-Meteo</p>
      </footer>
    </div>
  )
}

export default App
