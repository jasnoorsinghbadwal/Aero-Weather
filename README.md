# 🌤️ AeroWeather — Minimalist Weather Dashboard

A premium, portfolio-grade Weather Web Application designed with a sleek, minimalist aesthetic. AeroWeather features dynamic light/dark mode toggling, real-time accent color customizations, responsive metric cards, and autocomplete geocoding suggestions.

This project was built from scratch to demonstrate high-fidelity frontend design, clean DOM manipulation, and structured third-party API integrations.

---

## ✨ Features

- 🌓 **Minimalist Dual Themes**: Instant, smooth transitions between light mode and deep slate dark mode.
- 🎨 **Dynamic Accent Color Changer**: Interactive settings drawer containing curated color presets (Ocean, Emerald, Coral, Amethyst, Rose) along with a native color picker. All graphics, highlights, charts, and buttons adjust in real-time.
- 🧩 **Comprehensive Metric Grid**: 
  - **Wind**: Speed in km/h and dynamic cardinal directions (e.g. ENE, SSW) mapped from degrees.
  - **Air Quality**: Pollution API integrated to show AQI ratings (Good to Very Poor).
  - **UV Index**: Auto-simulated intensity meter based on condition codes.
  - **Humidity, Visibility, Pressure, & Solar Status** (detailed sunrise/sunset progress).
- 🕒 **Hourly Forecast**: A horizontally scrollable timeline detailing 3-hour interval predictions for the next 24 hours.
- 📅 **5-Day iOS-style Forecast**: Daily forecasts presenting temperature boundaries formatted inside custom relative progress bars.
- 🔍 **Autocomplete Search**: Integrated Geocoding lookup matching inputs to city suggestions with states and country badges.
- 💾 **Persistent Settings**: Saves unit selections (°C vs °F), visual themes, accent colors, and default starting cities using browser `localStorage`.

---

## 🛠️ Technology Stack

- **Core**: HTML5, Vanilla JavaScript (ES6+), Custom CSS3
- **Layout & Responsiveness**: [Bootstrap 5](https://getbootstrap.com/) & [Bootstrap Icons](https://icons.getbootstrap.com/)
- **Typography**: [Outfit Google Font](https://fonts.google.com/specimen/Outfit)
- **Data Provider**: [OpenWeatherMap API](https://openweathermap.org/)
- **Icons**: [Basmilius Weather Icons Pack](https://basmilius.github.io/weather-icons/) (High-quality CDN vectors)

---

## 📂 Project Architecture

```
weather-app/
├── index.html   # Main Dashboard Structure & Responsive Grid
├── styles.css   # Theme Definitions, Glassmorphism, & Custom Accent Rules
├── app.js       # Core Application State, API Engine, & DOM Controller
└── README.md    # Repository Documentation
```

---

## 🚀 How to Run Locally

### 1. Prerequisites
You need a basic web server to serve static files (due to CORS requirements with cross-origin fetches). You can use any lightweight server:
- Python: `python -m http.server`
- Node.js: `npx http-server`
- VS Code: Live Server extension

### 2. Setup
Clone the repository to your local directory:
```bash
git clone https://github.com/jasnoorsinghbadwal/Aero-Weather.git
cd Aero-Weather
```

### 3. API Configuration
Open `app.js` and input your OpenWeatherMap API Key at the top of the file:
```javascript
// Drop your OpenWeatherMap API Key here:
const PRESET_API_KEY = "your_api_key_here";
```
*Note: If you have just created your OpenWeatherMap key, please wait 30 minutes to 2 hours for it to activate globally on their servers.*

---

## 🔌 API Endpoints Used

AeroWeather leverages the following free OpenWeatherMap interfaces:
1. **[Current Weather Data API](https://openweathermap.org/current)**: Resolves current conditions, humidity, coordinates, pressure, and solar timings.
2. **[5-Day / 3-Hour Forecast API](https://openweathermap.org/forecast5)**: Generates statistics for the hourly and daily forecast grids.
3. **[Air Pollution API](https://openweathermap.org/api/air-pollution)**: Fetches historical and real-time Air Quality Indexes (AQI).
4. **[Geocoding API](https://openweathermap.org/api/geocoding-api)**: Drives the autocomplete search bar by resolving city strings to geographic coordinates.

---

## 📜 License

Created by **Jasnoor Singh Badwal**. Feel free to use this template or adjust it for your own portfolio presentations!
