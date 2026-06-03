/**
 * AeroWeather Dashboard Logic
 * Portfolio Weather Web Application
 */

// ==========================================
// 1. CONFIGURATION & STATE
// ==========================================
const DEFAULT_CITY = "New York";

let appState = {
  theme: 'light',          // 'light' | 'dark'
  unit: 'C',               // 'C' | 'F'
  accentColor: '#0284c7',  // Hex color
  accentRgb: '2, 132, 199',// RGB string
  currentCity: DEFAULT_CITY,
  weatherData: null,
  forecastData: null,
  pollutionData: null
};

// ==========================================
// 2. INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initAccentColor();
  initUnit();
  initSettings();
  setupEventListeners();
  
  // Load default weather
  loadWeatherData(appState.currentCity);
});

// ==========================================
// 3. THEME & STYLING CONTROLLERS
// ==========================================
function initTheme() {
  const savedTheme = localStorage.getItem('weather-app-theme');
  if (savedTheme) {
    appState.theme = savedTheme;
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    appState.theme = 'dark';
  }
  
  applyTheme();
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', appState.theme);
  const themeIcon = document.getElementById('themeIcon');
  if (appState.theme === 'dark') {
    themeIcon.className = 'bi bi-sun-fill';
  } else {
    themeIcon.className = 'bi bi-moon-fill';
  }
}

function toggleTheme() {
  appState.theme = appState.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('weather-app-theme', appState.theme);
  applyTheme();
  showToast(`Switched to ${appState.theme} mode`, 'info');
}

function initAccentColor() {
  const savedColor = localStorage.getItem('weather-app-accent-color');
  const savedRgb = localStorage.getItem('weather-app-accent-rgb');
  
  if (savedColor && savedRgb) {
    appState.accentColor = savedColor;
    appState.accentRgb = savedRgb;
    applyAccentColor(savedColor, savedRgb);
  }
  
  // Synchronize color picker UI
  document.getElementById('customColorPicker').value = appState.accentColor;
  updateActiveColorDot();
}

function applyAccentColor(colorHex, colorRgb) {
  document.documentElement.style.setProperty('--accent-color', colorHex);
  document.documentElement.style.setProperty('--accent-rgb', colorRgb);
  
  // Compute hover color (approx 12% darker)
  const rgb = parseRgbString(colorRgb);
  if (rgb) {
    const hoverR = Math.max(0, Math.floor(rgb.r * 0.88));
    const hoverG = Math.max(0, Math.floor(rgb.g * 0.88));
    const hoverB = Math.max(0, Math.floor(rgb.b * 0.88));
    document.documentElement.style.setProperty('--accent-hover', `rgb(${hoverR}, ${hoverG}, ${hoverB})`);
  }
}

function setAccentColor(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return;
  
  const rgbStr = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  appState.accentColor = hex;
  appState.accentRgb = rgbStr;
  
  localStorage.setItem('weather-app-accent-color', hex);
  localStorage.setItem('weather-app-accent-rgb', rgbStr);
  
  applyAccentColor(hex, rgbStr);
  updateActiveColorDot();
}

function updateActiveColorDot() {
  const dots = document.querySelectorAll('.color-dot');
  dots.forEach(dot => {
    const color = dot.getAttribute('data-color');
    if (color.toLowerCase() === appState.accentColor.toLowerCase()) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

// Helper to convert hex to RGB
function hexToRgb(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
  const match = result.exec(hex);
  return match ? {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16)
  } : null;
}

function parseRgbString(rgbStr) {
  const parts = rgbStr.split(',');
  if (parts.length === 3) {
    return {
      r: parseInt(parts[0].trim()),
      g: parseInt(parts[1].trim()),
      b: parseInt(parts[2].trim())
    };
  }
  return null;
}

// ==========================================
// 4. UNIT STATE CONTROLLER
// ==========================================
function initUnit() {
  const savedUnit = localStorage.getItem('weather-app-unit');
  if (savedUnit) {
    appState.unit = savedUnit;
    updateUnitUI();
  }
}

function setUnit(unit) {
  if (appState.unit === unit) return;
  appState.unit = unit;
  localStorage.setItem('weather-app-unit', unit);
  updateUnitUI();
  
  // Re-render UI with new unit values
  if (appState.weatherData) {
    renderDashboard();
  }
}

function updateUnitUI() {
  const cBtn = document.getElementById('unitCelsius');
  const fBtn = document.getElementById('unitFahrenheit');
  
  if (appState.unit === 'C') {
    cBtn.classList.add('active');
    fBtn.classList.remove('active');
  } else {
    fBtn.classList.add('active');
    cBtn.classList.remove('active');
  }
}

function convertTemp(tempKelvin) {
  if (appState.unit === 'C') {
    return Math.round(tempKelvin - 273.15);
  } else {
    return Math.round((tempKelvin - 273.15) * 9/5 + 32);
  }
}

// ==========================================
// 5. SETTINGS CONTROLLER
// ==========================================
function initSettings() {
  const savedDefaultCity = localStorage.getItem('weather-app-default-city');
  if (savedDefaultCity) {
    appState.currentCity = savedDefaultCity;
    document.getElementById('defaultCityInput').value = savedDefaultCity;
  } else {
    document.getElementById('defaultCityInput').value = DEFAULT_CITY;
  }
}

function saveSettings() {
  const cityInput = document.getElementById('defaultCityInput').value.trim();
  
  if (cityInput) {
    appState.currentCity = cityInput;
    localStorage.setItem('weather-app-default-city', cityInput);
  }
  
  // Close modal
  const modalEl = document.getElementById('settingsModal');
  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) modal.hide();
  
  showToast('Settings saved successfully', 'success');
  loadWeatherData(appState.currentCity);
}

// ==========================================
// 6. EVENT LISTENERS
// ==========================================
function setupEventListeners() {
  // Theme toggle
  document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);
  
  // Custom Accent panel toggle
  const colorPanelBtn = document.getElementById('colorPanelBtn');
  const colorPanel = document.getElementById('colorPanel');
  
  colorPanelBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = colorPanel.style.display === 'block';
    colorPanel.style.display = isVisible ? 'none' : 'block';
  });
  
  // Click outside to close accent panel
  document.addEventListener('click', (e) => {
    if (!colorPanel.contains(e.target) && e.target !== colorPanelBtn && !colorPanelBtn.contains(e.target)) {
      colorPanel.style.display = 'none';
    }
  });
  
  // Accent dots selection
  const dots = document.querySelectorAll('.color-dot');
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const color = dot.getAttribute('data-color');
      setAccentColor(color);
    });
  });
  
  // Custom color picker input
  document.getElementById('customColorPicker').addEventListener('input', (e) => {
    setAccentColor(e.target.value);
  });
  
  // Settings save button
  document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
  
  // Search autocomplete suggestions
  const searchInput = document.getElementById('citySearch');
  const suggestionsBox = document.getElementById('searchSuggestions');
  
  let debounceTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    const query = searchInput.value.trim();
    
    if (query.length < 3) {
      suggestionsBox.style.display = 'none';
      return;
    }
    
    debounceTimeout = setTimeout(() => {
      fetchCitySuggestions(query);
    }, 400);
  });
  
  // Focus search box opens suggestions if they exist
  searchInput.addEventListener('focus', () => {
    if (suggestionsBox.children.length > 0 && searchInput.value.trim().length >= 3) {
      suggestionsBox.style.display = 'block';
    }
  });
  
  // Document click closes suggestions
  document.addEventListener('click', (e) => {
    if (e.target !== searchInput) {
      suggestionsBox.style.display = 'none';
    }
  });
  
  // Enter key press triggers search immediately
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query.length > 0) {
        suggestionsBox.style.display = 'none';
        loadWeatherData(query);
      }
    }
  });
}

// ==========================================
// 7. WEATHER API FETCH ENGINE
// ==========================================
// Helper to display detailed error notifications in the UI
function showErrorBanner(title, message, showTips) {
  document.getElementById('dashboardLoading').classList.add('d-none');
  document.getElementById('weatherDashboard').classList.add('d-none');
  
  const errorCard = document.getElementById('apiErrorCard');
  const titleEl = document.getElementById('apiErrorTitle');
  const msgEl = document.getElementById('apiErrorMessage');
  const tipsEl = document.getElementById('apiErrorTips');
  
  titleEl.textContent = title;
  msgEl.innerHTML = message;
  tipsEl.style.display = showTips ? 'block' : 'none';
  
  errorCard.classList.remove('d-none');
}

function hideErrorBanner() {
  document.getElementById('apiErrorCard').classList.add('d-none');
}

async function loadWeatherData(cityName) {
  hideErrorBanner();
  document.getElementById('dashboardLoading').classList.remove('d-none');
  document.getElementById('weatherDashboard').classList.add('d-none');
  
  try {
    // 1. Fetch current weather data
    const weatherUrl = `/api/weather?type=current&q=${encodeURIComponent(cityName)}`;
    const weatherResponse = await fetch(weatherUrl);
    
    if (!weatherResponse.ok) {
      const errorData = await weatherResponse.json().catch(() => ({}));
      if (weatherResponse.status === 500 && errorData.error && errorData.error.includes("WEATHER_API_KEY")) {
        throw new Error('API Key Missing on Server');
      }
      throw new Error(weatherResponse.status === 401 ? 'Invalid API Key' : 'City not found');
    }
    
    const weatherData = await weatherResponse.json();
    appState.weatherData = weatherData;
    appState.currentCity = weatherData.name;
    
    // Extract coords for detailed requests
    const { lat, lon } = weatherData.coord;
    
    // 2. Run child API requests concurrently
    const forecastUrl = `/api/weather?type=forecast&lat=${lat}&lon=${lon}`;
    const pollutionUrl = `/api/weather?type=pollution&lat=${lat}&lon=${lon}`;
    
    const [forecastRes, pollutionRes] = await Promise.all([
      fetch(forecastUrl),
      fetch(pollutionUrl)
    ]);
    
    if (forecastRes.ok) {
      appState.forecastData = await forecastRes.json();
    }
    if (pollutionRes.ok) {
      appState.pollutionData = await pollutionRes.json();
    }
    
    // Success - Render dashboard
    renderDashboard();
    
    // Clear search input focus
    document.getElementById('citySearch').blur();
    document.getElementById('citySearch').value = '';
    
  } catch (error) {
    console.error(error);
    document.getElementById('dashboardLoading').classList.add('d-none');
    
    if (error.message === 'API Key Missing on Server') {
      showErrorBanner(
        "API Key Not Configured",
        "Your weather client is ready, but your API Key is missing on Vercel's environment variables. Please add the variable <code class=\"bg-dark-subtle px-2 py-0.5 rounded text-danger\" style=\"font-size: 0.85rem;\">WEATHER_API_KEY</code> in your Vercel Project Dashboard under Settings > Environment Variables.",
        false
      );
    } else if (error.message === 'Invalid API Key') {
      showErrorBanner(
        "API Key Activation / Validity Issue",
        "OpenWeatherMap rejected the API key as invalid. If you recently registered it, it may take 30-120 minutes to propagate, or it might contain a copy/paste typo.",
        true
      );
    } else {
      showToast(error.message || 'Error loading weather data', 'error');
      // Keep showing dashboard if it was loaded, else hide loading spinner
      if (appState.weatherData) {
        document.getElementById('weatherDashboard').classList.remove('d-none');
      }
    }
  }
}

async function fetchCitySuggestions(query) {
  try {
    const geoUrl = `/api/weather?type=geo&q=${encodeURIComponent(query)}`;
    const response = await fetch(geoUrl);
    
    if (!response.ok) return;
    const cities = await response.json();
    
    renderSuggestions(cities);
  } catch (err) {
    console.error(err);
  }
}

function quickFetch(city) {
  loadWeatherData(city);
}

// ==========================================
// 8. RENDER CONTROLLER
// ==========================================
function renderDashboard() {
  const wd = appState.weatherData;
  const fd = appState.forecastData;
  const pd = appState.pollutionData;
  
  if (!wd) return;
  
  // Show / Hide Panels
  document.getElementById('dashboardLoading').classList.add('d-none');
  document.getElementById('weatherDashboard').classList.remove('d-none');
  
  // A. Current weather card
  document.getElementById('cityName').textContent = `${wd.name}, ${wd.sys.country}`;
  document.getElementById('currentTemp').textContent = convertTemp(wd.main.temp);
  document.getElementById('tempUnit').textContent = `°${appState.unit}`;
  document.getElementById('weatherDesc').textContent = capitalize(wd.weather[0].description);
  
  const minTemp = convertTemp(wd.main.temp_min);
  const maxTemp = convertTemp(wd.main.temp_max);
  document.getElementById('tempRange').textContent = `H: ${maxTemp}°  L: ${minTemp}°`;
  
  // Date/Time
  const localTime = new Date((wd.dt + wd.timezone - 19800) * 1000); // adjust relative to GMT/Local timezone
  const formattedDate = formatLocalDate(wd.dt, wd.timezone);
  document.getElementById('currentDateTime').textContent = formattedDate;
  
  // Dynamic Weather Icon Class
  const mainIconEl = document.getElementById('mainWeatherIcon');
  const isNight = wd.weather[0].icon.endsWith('n');
  const weatherCode = wd.weather[0].id;
  
  // Update to beautiful visual representation instead of generic icon
  mainIconEl.src = getWeatherImage(weatherCode, isNight);
  
  // B. Render Detailed Grid Widgets
  // Wind
  const windKmh = Math.round(wd.wind.speed * 3.6);
  document.getElementById('detailWind').textContent = `${windKmh} km/h`;
  document.getElementById('detailWindDir').textContent = getWindDirection(wd.wind.deg);
  
  // Humidity
  document.getElementById('detailHumidity').textContent = `${wd.main.humidity}%`;
  document.getElementById('detailHumidityLabel').textContent = getHumidityDescription(wd.main.humidity);
  
  // Visibility
  const visKm = (wd.visibility / 1000).toFixed(1);
  document.getElementById('detailVisibility').textContent = `${visKm} km`;
  
  // Sunrise & Sunset
  document.getElementById('sunSunrise').textContent = formatEpochTime(wd.sys.sunrise, wd.timezone);
  document.getElementById('sunSunset').textContent = formatEpochTime(wd.sys.sunset, wd.timezone);
  
  // Pressure
  document.getElementById('detailPressure').textContent = `${wd.main.pressure} hPa`;
  
  // UV (Simulated from weather condition since OneCall UV index is restricted)
  const uvValue = simulateUV(weatherCode);
  document.getElementById('detailUV').textContent = uvValue;
  const uvFill = document.getElementById('uvFill');
  uvFill.style.width = `${(uvValue / 12) * 100}%`;
  
  // AQI
  if (pd && pd.list && pd.list[0]) {
    const aqi = pd.list[0].main.aqi; // 1 = Good, 2 = Fair, 3 = Moderate, 4 = Poor, 5 = Very Poor
    const aqiLabels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    const aqiFills = [20, 40, 60, 80, 100];
    
    document.getElementById('detailAQI').textContent = aqiLabels[aqi - 1] || 'Unknown';
    document.getElementById('aqiFill').style.width = `${aqiFills[aqi - 1] || 0}%`;
  } else {
    document.getElementById('detailAQI').textContent = 'N/A';
    document.getElementById('aqiFill').style.width = '0%';
  }
  
  // C. Render Hourly Forecast (Next 24h)
  const hourlyContainer = document.getElementById('hourlyForecastContainer');
  hourlyContainer.innerHTML = '';
  
  if (fd && fd.list) {
    // Standard forecast returns list of items every 3h. Take first 8 items for 24h.
    const items = fd.list.slice(0, 8);
    
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'hourly-card';
      
      const timeStr = formatEpochTime(item.dt, wd.timezone, true); // short format (e.g. "9 AM")
      const tempVal = convertTemp(item.main.temp);
      const iconPath = getWeatherImage(item.weather[0].id, item.weather[0].icon.endsWith('n'));
      
      card.innerHTML = `
        <div class="hourly-time">${timeStr}</div>
        <img class="hourly-icon" src="${iconPath}" alt="hourly icon">
        <div class="hourly-temp">${tempVal}°</div>
      `;
      
      hourlyContainer.appendChild(card);
    });
  }
  
  // D. Render 5-Day Forecast
  const dailyContainer = document.getElementById('dailyForecastContainer');
  dailyContainer.innerHTML = '';
  
  if (fd && fd.list) {
    // Process 5-day forecast by grouping items per day
    const groupedDays = groupForecastByDay(fd.list);
    
    // Get absolute min and max for range calculation matching iOS style
    let absoluteMin = 999;
    let absoluteMax = -999;
    groupedDays.forEach(day => {
      if (day.minTemp < absoluteMin) absoluteMin = day.minTemp;
      if (day.maxTemp > absoluteMax) absoluteMax = day.maxTemp;
    });
    
    const rangeSpan = absoluteMax - absoluteMin || 1;
    
    groupedDays.forEach(day => {
      const row = document.createElement('div');
      row.className = 'daily-row animate-fade-in';
      
      const iconPath = getWeatherImage(day.iconId, false);
      const minConverted = convertTemp(day.minTemp);
      const maxConverted = convertTemp(day.maxTemp);
      
      // Calculate relative percentages for iOS-like temp bar
      const barLeft = ((day.minTemp - absoluteMin) / rangeSpan) * 100;
      const barWidth = ((day.maxTemp - day.minTemp) / rangeSpan) * 100;
      
      row.innerHTML = `
        <div class="daily-day">${day.name}</div>
        <div class="daily-info">
          <img class="daily-icon" src="${iconPath}" alt="daily icon">
          <span class="daily-desc">${capitalize(day.desc)}</span>
        </div>
        <div class="daily-temp-bar-container">
          <span class="daily-temp-min">${minConverted}°</span>
          <div class="daily-bar-bg">
            <div class="daily-bar-fill" style="left: ${barLeft}%; width: ${Math.max(barWidth, 8)}%;"></div>
          </div>
          <span class="daily-temp-max">${maxConverted}°</span>
        </div>
      `;
      
      dailyContainer.appendChild(row);
    });
  }
}

function renderSuggestions(cities) {
  const suggestionsBox = document.getElementById('searchSuggestions');
  suggestionsBox.innerHTML = '';
  
  if (cities.length === 0) {
    suggestionsBox.style.display = 'none';
    return;
  }
  
  cities.forEach(city => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    
    const stateStr = city.state ? `, ${city.state}` : '';
    const desc = `${city.name}${stateStr} (${city.country})`;
    
    item.innerHTML = `
      <span><i class="bi bi-geo-alt me-2 text-muted"></i>${desc}</span>
      <span class="badge bg-light text-dark font-monospace" style="font-size: 0.75rem;">Select</span>
    `;
    
    item.addEventListener('click', () => {
      suggestionsBox.style.display = 'none';
      loadWeatherData(city.name);
    });
    
    suggestionsBox.appendChild(item);
  });
  
  suggestionsBox.style.display = 'block';
}

// ==========================================
// 9. HELPER ENGINE FUNCTIONS
// ==========================================
function capitalize(str) {
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.substring(1)).join(' ');
}

function getWindDirection(deg) {
  const sectors = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return sectors[index];
}

function getHumidityDescription(h) {
  if (h < 30) return 'Dry air';
  if (h <= 60) return 'Sticky';
  if (h <= 80) return 'Humid';
  return 'Extremely wet';
}

function simulateUV(code) {
  // Simulates UV index (1-11) based on weather code groups
  if (code === 800) return 8; // Sunny
  if (code > 800 && code <= 802) return 5; // Light clouds
  if (code > 802) return 3; // Dense clouds
  if (code >= 300 && code < 600) return 2; // Raining
  return 1; // Heavy storms / Night
}

// Map OpenWeatherMap Condition ID to custom visual illustrations (using public Open-Meteo assets or beautiful PNG representations)
// Since we don't have local image files, we map to high quality static weather illustration CDN links
function getWeatherImage(code, isNight) {
  const base = "https://cdn.jsdelivr.net/npm/@meteocons/svg/fill/";
  
  // Clear Sky
  if (code === 800) {
    return isNight ? `${base}clear-night.svg` : `${base}clear-day.svg`;
  }
  
  // Clouds
  if (code === 801 || code === 802) {
    return isNight ? `${base}partly-cloudy-night.svg` : `${base}partly-cloudy-day.svg`;
  }
  if (code === 803 || code === 804) {
    return `${base}cloudy.svg`;
  }
  
  // Rain & Drizzle
  if ((code >= 500 && code <= 504) || (code >= 300 && code <= 321)) {
    return isNight ? `${base}rain.svg` : `${base}rain.svg`;
  }
  if (code >= 520 && code <= 531) {
    return `${base}overcast-rain.svg`;
  }
  
  // Thunderstorm
  if (code >= 200 && code <= 232) {
    return `${base}thunderstorms-rain.svg`;
  }
  
  // Snow
  if (code >= 600 && code <= 622) {
    return `${base}snow.svg`;
  }
  
  // Fog / Mist
  if (code >= 701 && code <= 781) {
    return `${base}fog.svg`;
  }
  
  // Fallback
  return `${base}horizon.svg`;
}

// Local dates formatter
function formatLocalDate(dt, timezone) {
  // OpenWeatherMap timezone is offset in seconds from UTC.
  // We construct UTC time first, then add offset.
  const d = new Date((dt + timezone) * 1000);
  const options = { 
    weekday: 'long', 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true, 
    timeZone: 'UTC' 
  };
  return d.toLocaleDateString('en-US', options);
}

function formatEpochTime(epoch, timezone, short = false) {
  const d = new Date((epoch + timezone) * 1000);
  const options = short 
    ? { hour: 'numeric', hour12: true, timeZone: 'UTC' }
    : { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' };
  return d.toLocaleTimeString('en-US', options);
}

function groupForecastByDay(list) {
  const daysMap = {};
  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  list.forEach(item => {
    // Extract date string (YYYY-MM-DD)
    const dateStr = item.dt_txt.split(' ')[0];
    
    // Ignore today's past hours (or current day if we want clean future forecast)
    const dateObj = new Date(item.dt * 1000);
    const dayName = weekdayNames[dateObj.getDay()];
    
    if (!daysMap[dateStr]) {
      daysMap[dateStr] = {
        name: dayName,
        minTemp: item.main.temp_min,
        maxTemp: item.main.temp_max,
        desc: item.weather[0].description,
        iconId: item.weather[0].id,
        count: 1
      };
    } else {
      const day = daysMap[dateStr];
      if (item.main.temp_min < day.minTemp) day.minTemp = item.main.temp_min;
      if (item.main.temp_max > day.maxTemp) day.maxTemp = item.main.temp_max;
      day.count += 1;
    }
  });
  
  // Convert map to array and return first 5 days
  return Object.values(daysMap).slice(0, 5);
}

// ==========================================
// 10. TOAST CUSTOM NOTIFIER
// ==========================================
function showToast(message, type = 'info') {
  const toast = document.getElementById('toastNotification');
  const icon = document.getElementById('toastIcon');
  const msgEl = document.getElementById('toastMessage');
  
  msgEl.textContent = message;
  
  // Setup icon class based on type
  if (type === 'success') {
    icon.className = 'bi bi-check-circle-fill text-success';
    toast.style.borderLeftColor = 'var(--accent-color)';
  } else if (type === 'error') {
    icon.className = 'bi bi-exclamation-octagon-fill text-danger';
    toast.style.borderLeftColor = '#f43f5e';
  } else {
    icon.className = 'bi bi-info-circle-fill text-info';
    toast.style.borderLeftColor = 'var(--accent-color)';
  }
  
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}
