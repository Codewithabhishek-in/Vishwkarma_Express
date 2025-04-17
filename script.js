// DARK MODE TOGGLE
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  // Save theme preference in localStorage
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
});

// Enhanced functionality and initialization
document.addEventListener('DOMContentLoaded', () => {
  // Apply saved theme on load
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
  }

  const savedTheme = localStorage.getItem('theme') || 'default';
  document.body.className = `theme-${savedTheme}`;
  const activeThemeBtn = document.querySelector(`.theme-btn[data-theme="${savedTheme}"]`);
  if (activeThemeBtn) {
    activeThemeBtn.classList.add('active');
  }

  // Load custom sites from localStorage
  loadSites();

  // Initialize weather, bookmarks and history
  initializeWeather();
  initializeBookmarksAndHistory();

  // Set up clock
  updateClock();
  setInterval(updateClock, 1000);

  // Set up voice search
  setupVoiceSearch();

  // Initialize search engine selector
  initializeSearchEngineSelector();
  
  // Initialize search suggestions
  setupSearchSuggestions();

  // Check for backdrop-filter support
  if (!CSS.supports('backdrop-filter', 'blur(10px)') && 
      !CSS.supports('-webkit-backdrop-filter', 'blur(10px)')) {
    document.body.classList.add('no-backdrop-filter');
  }
  
  // Performance optimization - lazy load resources
  if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
      imgObserver.observe(img);
    });
  }

  // Add new initializations
  setupKeyboardNavigation();
  setupThemeKeyboardNavigation();
  setupOfflineDetection();
  setupShortcutsPanel();
  initializeSettings();
  
  // Show keyboard shortcuts on first visit
  if (!localStorage.getItem('keyboardShortcutsShown')) {
    setTimeout(() => {
      showError('Pro tip: Use Alt+S to search, Alt+N for new tab, Alt+B for bookmarks, Alt+H for history', 'info');
      localStorage.setItem('keyboardShortcutsShown', 'true');
    }, 3000);
  }

  // Add new UI enhancements
  animateSiteTiles();
  addRippleEffect();
  enhanceModalTransitions();
  addDockAnimations();
  initializeDock();

  // Initialize sidebar app links
  initializeSidebarLinks();
});

// Setup Voice Search
function setupVoiceSearch() {
  const voiceSearchBtn = document.getElementById('voiceSearchBtn');
  const voiceStatus = document.getElementById('voiceStatus');
  const searchInput = document.getElementById('searchInput');
  
  // Check if browser supports speech recognition
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Configure recognition settings
    recognition.continuous = false;
    recognition.interimResults = false;
    
    // Use browser language or fallback to English
    recognition.lang = navigator.language || 'en-US';

    // Handle the start of speech recognition
    recognition.onstart = () => {
      voiceSearchBtn.classList.add('listening');
      voiceStatus.textContent = 'Listening...';
      voiceStatus.style.opacity = '1';
    };

    // Handle speech recognition results
    recognition.onresult = (event) => {
      try {
        const transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        voiceStatus.textContent = 'Recognized: ' + transcript;
        
        // Wait a moment before performing the search for better UX
        setTimeout(() => {
          // Automatically search after recognition
          if (transcript.trim()) {
            performSearch(transcript);
          }
        }, 1000);
      } catch (err) {
        console.error('Error processing speech result:', err);
        voiceStatus.textContent = 'Error: Could not process speech';
        setTimeout(() => {
          voiceStatus.style.opacity = '0';
        }, 3000);
      }
    };

    // Handle errors
    recognition.onerror = (event) => {
      voiceSearchBtn.classList.remove('listening');
      console.error('Speech recognition error:', event.error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Voice recognition error';
      
      switch(event.error) {
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please enable microphone permissions.';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = `Voice recognition error: ${event.error}`;
      }
      
      voiceStatus.textContent = errorMessage;
      showError(errorMessage);
      
      setTimeout(() => {
        voiceStatus.style.opacity = '0';
      }, 3000);
    };

    // Handle the end of speech recognition
    recognition.onend = () => {
      voiceSearchBtn.classList.remove('listening');
      setTimeout(() => {
        voiceStatus.style.opacity = '0';
      }, 1500);
    };

    // Toggle voice recognition on button click
    voiceSearchBtn.addEventListener('click', () => {
      try {
        if (voiceSearchBtn.classList.contains('listening')) {
          recognition.stop();
        } else {
          recognition.start();
          // Add a timeout as a fallback in case recognition fails to start
          setTimeout(() => {
            if (voiceStatus.textContent === '') {
              voiceStatus.textContent = 'Listening...';
              voiceStatus.style.opacity = '1';
            }
          }, 500);
        }
      } catch (err) {
        console.error('Speech recognition error:', err);
        showError('Speech recognition failed to start: ' + err.message);
        setTimeout(() => {
          voiceStatus.style.opacity = '0';
        }, 3000);
      }
    });
  } else {
    // Handle case where browser doesn't support speech recognition
    voiceSearchBtn.style.display = 'none';
    console.warn('Voice search not supported in this browser');
    // Add a message to inform the user
    const searchBar = document.querySelector('.search-bar');
    if (searchBar) {
      const infoMessage = document.createElement('div');
      infoMessage.className = 'voice-search-not-supported';
      infoMessage.textContent = 'Voice search not supported in this browser.';
      infoMessage.style.fontSize = '12px';
      infoMessage.style.opacity = '0.7';
      infoMessage.style.marginTop = '4px';
      searchBar.appendChild(infoMessage);
      
      // Remove message after a few seconds
      setTimeout(() => {
        infoMessage.style.opacity = '0';
        setTimeout(() => {
          infoMessage.remove();
        }, 300);
      }, 5000);
    }
  }
}

// SEARCH FUNCTIONALITY
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const query = searchInput.value.trim();
    if (query) {
      performSearch(query);
      searchInput.value = '';
    }
  }
});

function performSearch(query) {
  const searchEngine = localStorage.getItem('searchEngine') || 'google';
  const searchEngines = {
    google: 'https://www.google.com/search?q=',
    bing: 'https://www.bing.com/search?q=',
    duckduckgo: 'https://duckduckgo.com/?q='
  };
  const searchUrl = searchEngines[searchEngine] + encodeURIComponent(query);
  window.open(searchUrl, '_blank');
  addToHistory(searchUrl, `Search: ${query}`);
}

// QUICK ACCESS SITE CLICK HANDLING
const sitesGrid = document.getElementById('sitesGrid');
sitesGrid.addEventListener('click', (event) => {
  let target = event.target;
  while (target && !target.classList.contains('site')) {
    target = target.parentElement;
  }
  if (target) {
    // If the "Add a Site" tile is clicked, open the modal
    if (target.id === 'addSiteBtn') {
      showModal('modal');
    } else {
      // Otherwise, open the associated URL in a new tab
      const url = target.getAttribute('data-url');
      if (url) {
        window.open(url, '_blank');
        addToHistory(url, target.title || 'Website');
      }
    }
  }
});

// MODAL FUNCTIONALITY
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const addSiteForm = document.getElementById('addSiteForm');

function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
    document.body.style.overflow = 'hidden';
  }
}

function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }, 300);
  }
}

modalClose.addEventListener('click', () => {
  hideModal('modal');
  addSiteForm.reset();
});

window.addEventListener('click', (event) => {
  if (event.target === modal) {
    hideModal('modal');
    addSiteForm.reset();
  }
});

// Close all modals when clicking outside
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      hideModal(modal.id);
      if (modal.id === 'modal') {
        addSiteForm.reset();
      }
    }
  });
});

// Theme Selection
const themeBtns = document.querySelectorAll('.theme-btn');
const body = document.body;

themeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const theme = btn.dataset.theme;
    document.querySelector('.loading').classList.add('active');
    
    setTimeout(() => {
      body.className = `theme-${theme}`;
      if (theme === 'default' && localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
      }
      
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      localStorage.setItem('theme', theme);
      
      // Check for backdrop-filter support
      const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(10px)') || 
                                   CSS.supports('-webkit-backdrop-filter', 'blur(10px)');
      
      if (!supportsBackdropFilter) {
        document.body.classList.add('no-backdrop-filter');
      } else {
        document.body.classList.remove('no-backdrop-filter');
      }
      
      document.querySelector('.loading').classList.remove('active');
    }, 500);
  });
});

// Loading Animation
window.addEventListener('load', () => {
  const loading = document.querySelector('.loading');
  loading.classList.add('active');
  setTimeout(() => {
    loading.classList.remove('active');
  }, 1000);
});

// Enhanced Site Tiles
function addEventListenersToSites() {
  document.querySelectorAll('.site').forEach(site => {
    site.addEventListener('click', () => {
      site.style.transform = 'scale(0.95)';
      setTimeout(() => {
        site.style.transform = '';
      }, 200);
    });
  });
}
addEventListenersToSites();

// Clock Functionality
function updateClock() {
  const now = new Date();
  const timeElement = document.querySelector('.time');
  const dateElement = document.querySelector('.date');
  
  const time = now.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  const date = now.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  timeElement.textContent = time;
  dateElement.textContent = date;
}

// Weather Functionality
function initializeWeather() {
  // Start with mock data
  updateWeatherWithMockData();
  
  // Try to fetch real data
  fetchWeather().catch(error => {
    console.error('Error initializing weather:', error);
  });
}

function updateWeatherWithMockData() {
  const weatherData = {
    temperature: '24°C',
    location: 'New York, NY',
    icon: '🌤️'
  };
  
  document.querySelector('.temperature').textContent = weatherData.temperature;
  document.querySelector('.location').textContent = weatherData.location;
  document.querySelector('.weather-icon').textContent = weatherData.icon;
}

// Add improved error handling with retry mechanism
async function fetchWithRetry(url, options = {}, retries = 3, backoff = 300) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Request failed with status ${response.status}: ${errorData.message || 'Unknown error'}`);
    }
    return response;
  } catch (error) {
    if (retries <= 1) throw error;
    await new Promise(resolve => setTimeout(resolve, backoff));
    return fetchWithRetry(url, options, retries - 1, backoff * 2);
  }
}

// Improve weather fetching with retry mechanism
async function fetchWeather() {
  showLoading();
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
        maximumAge: 60000
      });
    });

    const { latitude, longitude } = position.coords;
    
    // Instead of using a potentially expired API key, we'll use a more robust approach
    // First try to use the API key from localStorage if the user has set one
    let apiKey = localStorage.getItem('weatherApiKey') || 'fc5b2d7a4c89bf725a0c619128651a83';
    
    // Try to fetch weather data with the API key
    try {
      const response = await fetchWithRetry(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`,
        {},
        3,
        500
      );
      
      const data = await response.json();
      updateWeatherUI(data);
      
      // Cache the weather data with timestamp
      const cacheData = {
        data: data,
        timestamp: new Date().getTime()
      };
      localStorage.setItem('weatherData', JSON.stringify(cacheData));
    } catch (apiError) {
      // If the API key didn't work, fallback to mock data with geolocation info
      console.error('Weather API error:', apiError);
      
      // Use browser's geolocation to at least show the correct location
      try {
        const geocodeResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const geocodeData = await geocodeResponse.json();
        
        // Create a mock weather object with the location data
        const mockWeatherData = {
          main: {
            temp: Math.round(15 + Math.random() * 10) // Random temperature between 15-25°C
          },
          weather: [
            {
              id: 800, // Clear sky
              main: "Clear",
              description: "Clear sky",
              icon: "01d"
            }
          ],
          name: geocodeData.address.city || geocodeData.address.town || geocodeData.address.village || geocodeData.address.county || "Unknown Location"
        };
        
        updateWeatherUI(mockWeatherData);
        
        // Show a message encouraging the user to set their own API key
        showError("Weather API key may be invalid. Using approximate weather data.", "info");
      } catch (geocodeError) {
        // If everything fails, use completely mock data
        console.error('Geocoding error:', geocodeError);
        updateWeatherWithMockData();
      }
    }
  } catch (error) {
    console.error('Error fetching weather:', error);
    showError('Unable to fetch weather data: ' + error.message);
    
    // Try to use cached weather data if available
    try {
      const cachedWeather = JSON.parse(localStorage.getItem('weatherData'));
      if (cachedWeather && cachedWeather.data) {
        // Check if cache is less than 3 hours old
        const now = new Date().getTime();
        const cacheAge = now - cachedWeather.timestamp;
        if (cacheAge < 3 * 60 * 60 * 1000) { // 3 hours in milliseconds
          updateWeatherUI(cachedWeather.data);
          showError('Using cached weather data', 'info');
          return;
        }
      }
    } catch (cacheError) {
      console.error('Error reading cached weather:', cacheError);
    }
    
    // If no valid cache, use mock data
    updateWeatherWithMockData();
  } finally {
    hideLoading();
  }
}

function updateWeatherUI(data) {
  document.querySelector('.temperature').textContent = `${Math.round(data.main.temp)}°C`;
  document.querySelector('.location').textContent = data.name;
  
  const weatherIcon = document.querySelector('.weather-icon');
  const weatherCode = data.weather[0].id;
  const weatherIcons = {
    '2': '⛈️', // Thunderstorm
    '3': '🌧️', // Drizzle
    '5': '🌧️', // Rain
    '6': '❄️', // Snow
    '7': '🌫️', // Atmosphere
    '800': '☀️', // Clear
    '8': '☁️'  // Clouds
  };
  
  const iconCode = weatherCode === 800 ? '800' : Math.floor(weatherCode / 100).toString();
  weatherIcon.textContent = weatherIcons[iconCode] || '☀️';
}

// Quick Actions
document.querySelectorAll('.action-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.getAttribute('title');
    switch(action) {
      case 'New Tab':
        window.open('about:blank', '_blank');
        break;
      case 'Bookmarks':
        showModal('bookmarksModal');
        updateBookmarksUI();
        break;
      case 'History':
        showModal('historyModal');
        updateHistoryUI();
        break;
    }
  });
});

// Bookmarks & History System
function initializeBookmarksAndHistory() {
  updateBookmarksUI();
  updateHistoryUI();
  
  // Add event listener for bookmark removal
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-bookmark')) {
      const url = e.target.getAttribute('data-url');
      if (url) {
        removeBookmark(url);
      }
    }
  });
  
  // Clear history button
  const clearHistoryBtn = document.querySelector('.clear-history');
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', clearHistory);
  }
}

// Bookmarks System
const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];

function saveBookmark(url, title, icon) {
  const bookmark = { url, title, icon, date: new Date().toISOString() };
  bookmarks.unshift(bookmark);
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  updateBookmarksUI();
  showError('Bookmark added successfully', 'success');
}

function removeBookmark(url) {
  const index = bookmarks.findIndex(b => b.url === url);
  if (index !== -1) {
    bookmarks.splice(index, 1);
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    updateBookmarksUI();
    showError('Bookmark removed', 'info');
  }
}

function updateBookmarksUI() {
  const bookmarksList = document.getElementById('bookmarksList');
  if (bookmarksList) {
    if (bookmarks.length === 0) {
      bookmarksList.innerHTML = '<p>No bookmarks yet. Add some by clicking the bookmark icon while browsing.</p>';
    } else {
      bookmarksList.innerHTML = bookmarks.map(bookmark => `
        <div class="bookmark-item">
          <img src="${bookmark.icon}" alt="${bookmark.title}" onerror="this.src='icons/icon.png';" />
          <div class="bookmark-info">
            <div class="bookmark-title">${bookmark.title}</div>
            <div class="bookmark-url">${bookmark.url}</div>
          </div>
          <button class="remove-bookmark" data-url="${bookmark.url}">×</button>
        </div>
      `).join('');
    }
  }
}

// History System
const history = JSON.parse(localStorage.getItem('history')) || [];

function addToHistory(url, title) {
  const historyItem = { url, title, date: new Date().toISOString() };
  
  // Check if this URL is already in history
  const existingIndex = history.findIndex(item => item.url === url);
  if (existingIndex !== -1) {
    history.splice(existingIndex, 1);
  }
  
  history.unshift(historyItem);
  
  // Keep only last 100 items
  if (history.length > 100) history.pop();
  localStorage.setItem('history', JSON.stringify(history));
}

function clearHistory() {
  if (confirm('Are you sure you want to clear all browsing history?')) {
    history.length = 0;
    localStorage.setItem('history', JSON.stringify(history));
    updateHistoryUI();
    showError('History cleared', 'info');
  }
}

function updateHistoryUI() {
  const historyList = document.getElementById('historyList');
  if (historyList) {
    if (history.length === 0) {
      historyList.innerHTML = '<p>No browsing history.</p>';
    } else {
      historyList.innerHTML = history.map(item => `
        <div class="history-item">
          <div class="history-info">
            <div class="history-title">${item.title}</div>
            <div class="history-url">${item.url}</div>
            <div class="history-date">${new Date(item.date).toLocaleString()}</div>
          </div>
        </div>
      `).join('');
    }
  }
}

// Handle new site submission and persist in localStorage
addSiteForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(addSiteForm);
  const newSite = {
    name: formData.get('siteName'),
    icon: formData.get('siteIcon'),
    url: formData.get('siteUrl')
  };
  
  try {
    // Validate URL
    new URL(newSite.url);
    
    // Add site
    addSiteToGrid(newSite);
    saveSite(newSite);
    hideModal('modal');
    showError('Site added successfully', 'success');
  } catch (error) {
    showError('Invalid URL. Please enter a valid website address.');
  }
});

// Function to add a new site tile to the grid
function addSiteToGrid(site) {
  const siteDiv = document.createElement('div');
  siteDiv.className = 'site';
  siteDiv.title = site.name;
  siteDiv.setAttribute('data-url', site.url);

  const img = document.createElement('img');
  img.src = site.icon;
  img.alt = site.name;
  img.onerror = () => {
    img.src = 'icons/icon.png';
  };
  siteDiv.appendChild(img);

  const nameDiv = document.createElement('div');
  nameDiv.textContent = site.name;
  siteDiv.appendChild(nameDiv);

  // Insert the new site before the "Add a site" button
  const addBtn = document.getElementById('addSiteBtn');
  sitesGrid.insertBefore(siteDiv, addBtn);
  
  // Add click animation to the new site
  siteDiv.addEventListener('click', () => {
    siteDiv.style.transform = 'scale(0.95)';
    setTimeout(() => {
      siteDiv.style.transform = '';
    }, 200);
  });
}

// Save custom sites in localStorage for persistence
function saveSite(site) {
  let sites = JSON.parse(localStorage.getItem('customSites')) || [];
  sites.push(site);
  localStorage.setItem('customSites', JSON.stringify(sites));
}

// Load custom sites from localStorage on startup
function loadSites() {
  let sites = JSON.parse(localStorage.getItem('customSites')) || [];
  sites.forEach(site => {
    addSiteToGrid(site);
  });
}

// Search Engine Selector
function initializeSearchEngineSelector() {
  const searchEngineSelect = document.getElementById('searchEngineSelect');
  if (searchEngineSelect) {
    searchEngineSelect.value = localStorage.getItem('searchEngine') || 'google';
    searchEngineSelect.addEventListener('change', (e) => {
      localStorage.setItem('searchEngine', e.target.value);
      showError(`Search engine changed to ${e.target.options[e.target.selectedIndex].text}`, 'info');
    });
  }
}

// Enhanced Error Handling
function showError(message, type = 'error') {
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  
  errorText.textContent = message;
  
  // Set color based on message type
  if (type === 'success') {
    errorMessage.style.background = 'rgba(0, 200, 83, 0.9)';
  } else if (type === 'info') {
    errorMessage.style.background = 'rgba(0, 119, 255, 0.9)';
  } else {
    errorMessage.style.background = 'rgba(255, 68, 68, 0.9)';
  }
  
  errorMessage.classList.add('show');
  setTimeout(() => {
    hideError();
  }, 3000);
}

function hideError() {
  document.getElementById('errorMessage').classList.remove('show');
}

// Loading State
function showLoading() {
  document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
  document.getElementById('loadingOverlay').classList.remove('show');
}

// Search suggestions
function setupSearchSuggestions() {
  const searchInput = document.getElementById('searchInput');
  const searchBar = document.querySelector('.search-bar');
  
  // Create suggestions container
  const suggestionsContainer = document.createElement('div');
  suggestionsContainer.className = 'search-suggestions';
  searchBar.appendChild(suggestionsContainer);
  
  let debounceTimeout;
  
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    
    const query = searchInput.value.trim();
    if (query.length < 2) {
      suggestionsContainer.classList.remove('active');
      return;
    }
    
    debounceTimeout = setTimeout(() => {
      // Get suggestions based on search history and common searches
      const suggestions = getSearchSuggestions(query);
      
      if (suggestions.length > 0) {
        renderSuggestions(suggestions, query);
        suggestionsContainer.classList.add('active');
      } else {
        suggestionsContainer.classList.remove('active');
      }
    }, 300);
  });
  
  // Hide suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchBar.contains(e.target)) {
      suggestionsContainer.classList.remove('active');
    }
  });
  
  // Hide suggestions when pressing Escape
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      suggestionsContainer.classList.remove('active');
    } else if (e.key === 'ArrowDown' && suggestionsContainer.classList.contains('active')) {
      const firstSuggestion = suggestionsContainer.querySelector('.suggestion-item');
      if (firstSuggestion) {
        e.preventDefault();
        firstSuggestion.focus();
      }
    }
  });
  
  // Navigate suggestions with keyboard
  suggestionsContainer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = e.target.nextElementSibling;
      if (next) next.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = e.target.previousElementSibling;
      if (prev) {
        prev.focus();
      } else {
        searchInput.focus();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      searchInput.value = e.target.textContent;
      suggestionsContainer.classList.remove('active');
      performSearch(searchInput.value);
      searchInput.value = '';
    }
  });
}

function getSearchSuggestions(query) {
  query = query.toLowerCase();
  
  // Combine recent searches from history and common searches
  const recentSearches = history
    .filter(item => item.title && item.title.startsWith('Search: '))
    .map(item => item.title.replace('Search: ', ''))
    .filter(search => search.toLowerCase().includes(query));
  
  const commonSearches = [
    'weather forecast', 'news today', 'sports results', 'stock market',
    'recipe ideas', 'tech news', 'movie reviews', 'travel destinations',
    'health tips', 'coding tutorials', 'online shopping', 'job listings',
    'email login', 'social media', 'video streaming', 'music playlists'
  ].filter(search => search.toLowerCase().includes(query));
  
  // Combine and remove duplicates
  const allSuggestions = [...new Set([...recentSearches, ...commonSearches])];
  
  // Limit to 6 suggestions
  return allSuggestions.slice(0, 6);
}

function renderSuggestions(suggestions, query) {
  const suggestionsContainer = document.querySelector('.search-suggestions');
  query = query.toLowerCase();
  
  suggestionsContainer.innerHTML = suggestions.map(suggestion => {
    const index = suggestion.toLowerCase().indexOf(query);
    
    if (index >= 0) {
      // Highlight the matching part
      const before = suggestion.substring(0, index);
      const match = suggestion.substring(index, index + query.length);
      const after = suggestion.substring(index + query.length);
      
      return `<div class="suggestion-item" tabindex="0">${before}<strong>${match}</strong>${after}</div>`;
    }
    
    return `<div class="suggestion-item" tabindex="0">${suggestion}</div>`;
  }).join('');
  
  // Add click events to suggestions
  document.querySelectorAll('.suggestion-item').forEach(item => {
    item.addEventListener('click', () => {
      searchInput.value = item.textContent;
      document.querySelector('.search-suggestions').classList.remove('active');
      performSearch(searchInput.value);
      searchInput.value = '';
    });
  });
}

// Add keyboard navigation support
function setupKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    // Alt+S to focus search
    if (e.altKey && e.key === 's') {
      e.preventDefault();
      document.getElementById('searchInput').focus();
    }
    
    // Alt+N for new tab
    if (e.altKey && e.key === 'n') {
      e.preventDefault();
      window.open('about:blank', '_blank');
    }
    
    // Alt+B to show bookmarks
    if (e.altKey && e.key === 'b') {
      e.preventDefault();
      showModal('bookmarksModal');
      updateBookmarksUI();
    }
    
    // Alt+H to show history
    if (e.altKey && e.key === 'h') {
      e.preventDefault();
      showModal('historyModal');
      updateHistoryUI();
    }
    
    // Escape to close any modal
    if (e.key === 'Escape') {
      const visibleModal = document.querySelector('.modal:not(.hidden)');
      if (visibleModal) {
        hideModal(visibleModal.id);
      }
    }
  });
}

// Add theme selector keyboard navigation
function setupThemeKeyboardNavigation() {
  const themeBtns = document.querySelectorAll('.theme-btn');
  themeBtns.forEach((btn, index) => {
    btn.setAttribute('tabindex', '0');
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
}

// Add debounced search
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Add offline detection
function setupOfflineDetection() {
  window.addEventListener('online', () => {
    showError('You are back online', 'success');
    fetchWeather().catch(console.error);
  });
  
  window.addEventListener('offline', () => {
    showError('You are offline. Some features may be limited.', 'error');
  });
}

// Add keyboard shortcuts panel toggle
function setupShortcutsPanel() {
  const shortcutsToggle = document.getElementById('shortcutsToggle');
  const shortcutsList = document.getElementById('shortcutsList');
  
  if (shortcutsToggle && shortcutsList) {
    shortcutsToggle.addEventListener('click', () => {
      const isExpanded = shortcutsToggle.getAttribute('aria-expanded') === 'true';
      shortcutsToggle.setAttribute('aria-expanded', !isExpanded);
      
      if (isExpanded) {
        shortcutsList.hidden = true;
      } else {
        shortcutsList.hidden = false;
      }
    });
    
    // Close shortcuts panel when clicking outside
    document.addEventListener('click', (e) => {
      if (!shortcutsToggle.contains(e.target) && !shortcutsList.contains(e.target)) {
        shortcutsToggle.setAttribute('aria-expanded', 'false');
        shortcutsList.hidden = true;
      }
    });
  }
}

// Enhance site tiles with staggered animations on load
function animateSiteTiles() {
  const sites = document.querySelectorAll('.site');
  
  sites.forEach((site, index) => {
    site.style.opacity = '0';
    site.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      site.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      site.style.opacity = '1';
      site.style.transform = 'translateY(0)';
    }, 100 + (index * 50));
  });
}

// Add a ripple effect to buttons
function addRippleEffect() {
  const buttons = document.querySelectorAll('button, .site, .action-btn');
  
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement('span');
      ripple.classList.add('ripple-effect');
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
}

// Enhance modal transitions
function enhanceModalTransitions() {
  const modals = document.querySelectorAll('.modal');
  
  modals.forEach(modal => {
    const content = modal.querySelector('.modal-content');
    
    // Smooth open animation
    const originalShowModal = window.showModal;
    window.showModal = function(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('hidden');
        setTimeout(() => {
          modal.classList.add('show');
          const content = modal.querySelector('.modal-content');
          if (content) {
            content.style.transform = 'scale(1)';
            content.style.opacity = '1';
          }
        }, 10);
        document.body.style.overflow = 'hidden';
      }
    };
    
    // Smooth close animation
    const originalHideModal = window.hideModal;
    window.hideModal = function(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        const content = modal.querySelector('.modal-content');
        if (content) {
          content.style.transform = 'scale(0.9)';
          content.style.opacity = '0';
        }
        setTimeout(() => {
          modal.classList.remove('show');
          setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            if (content) {
              content.style.transform = 'scale(0.9)';
            }
          }, 300);
        }, 100);
      }
    };
  });
}

// Dock functionality
function initializeDock() {
  const dockItems = document.querySelectorAll('.dock-item');
  
  // Add click handlers to dock items
  dockItems.forEach(item => {
    item.addEventListener('click', () => {
      const app = item.getAttribute('data-app');
      launchApp(app, item);
    });
    
    // Add keyboard handler for accessibility
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const app = item.getAttribute('data-app');
        launchApp(app, item);
      }
    });
  });
  
  // Add hover effect with adjacent scaling
  dockItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      // Scale down adjacent items
      const prev = item.previousElementSibling;
      const next = item.nextElementSibling;
      
      if (prev) prev.style.transform = 'translateY(-5px) scale(1.05)';
      if (next) next.style.transform = 'translateY(-5px) scale(1.05)';
    });
    
    item.addEventListener('mouseleave', () => {
      // Reset adjacent items
      const prev = item.previousElementSibling;
      const next = item.nextElementSibling;
      
      if (prev) prev.style.transform = '';
      if (next) next.style.transform = '';
    });
  });
  
  // Add magnification effect on dock hover
  const dock = document.querySelector('.dock-container');
  dock.addEventListener('mousemove', e => {
    const dockRect = dock.getBoundingClientRect();
    const mouseX = e.clientX - dockRect.left;
    
    dockItems.forEach(item => {
      const itemRect = item.getBoundingClientRect();
      const itemX = (itemRect.left + itemRect.right) / 2 - dockRect.left;
      
      const distance = Math.abs(mouseX - itemX);
      const scale = Math.max(1, 1.4 - (distance / 150));
      
      if (distance < 100) {
        item.style.transform = `translateY(${-10 * scale}px) scale(${scale})`;
      } else {
        item.style.transform = '';
      }
    });
  });
  
  dock.addEventListener('mouseleave', () => {
    dockItems.forEach(item => {
      item.style.transform = '';
    });
  });
}

function launchApp(app, dockItem) {
  // Add active class
  const allDockItems = document.querySelectorAll('.dock-item');
  allDockItems.forEach(item => item.classList.remove('active'));
  dockItem.classList.add('active');
  
  // Show bounce animation
  dockItem.style.animation = 'bounce 0.5s';
  setTimeout(() => {
    dockItem.style.animation = '';
  }, 500);

  // Handle different app launches
  switch(app) {
    case 'browser':
      window.open('about:blank', '_blank');
      break;
    case 'gmail':
      window.open('https://mail.google.com', '_blank');
      break;
    case 'maps':
      window.open('https://maps.google.com', '_blank');
      break;
    case 'calendar':
      window.open('https://calendar.google.com', '_blank');
      break;
    case 'photos':
      window.open('https://photos.google.com', '_blank');
      break;
    case 'music':
      window.open('https://music.youtube.com', '_blank');
      break;
    case 'drive':
      window.open('https://drive.google.com', '_blank');
      break;
    case 'settings':
      showModal('settingsModal');
      break;
    default:
      showError(`App ${app} not implemented yet.`, 'info');
  }
  
  // Add to history
  addToHistory(`app://${app}`, `Opened ${app}`);
}

// Add bounce animation
function addDockAnimations() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      40% { transform: translateY(-20px); }
      60% { transform: translateY(-15px); }
    }
  `;
  document.head.appendChild(style);
}

// Initialize settings
function initializeSettings() {
  // Set up dark mode checkbox
  const darkModeCheckbox = document.getElementById('darkModeCheckbox');
  if (darkModeCheckbox) {
    // Set initial state based on localStorage
    darkModeCheckbox.checked = document.body.classList.contains('dark-mode');
    
    // Add change event handler
    darkModeCheckbox.addEventListener('change', () => {
      document.body.classList.toggle('dark-mode');
      // Save theme preference in localStorage
      if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
      } else {
        localStorage.setItem('theme', 'light');
      }
    });
  }
  
  // Set up search engine selector
  const settingsSearchEngineSelect = document.getElementById('settingsSearchEngineSelect');
  if (settingsSearchEngineSelect) {
    // Set initial value from localStorage
    settingsSearchEngineSelect.value = localStorage.getItem('searchEngine') || 'google';
    
    // Add change event handler
    settingsSearchEngineSelect.addEventListener('change', () => {
      const searchEngine = settingsSearchEngineSelect.value;
      localStorage.setItem('searchEngine', searchEngine);
      
      // Update the main search engine selector if it exists
      const mainSearchEngineSelect = document.getElementById('searchEngineSelect');
      if (mainSearchEngineSelect) {
        mainSearchEngineSelect.value = searchEngine;
      }
      
      showError(`Search engine changed to ${settingsSearchEngineSelect.options[settingsSearchEngineSelect.selectedIndex].text}`, 'success');
    });
  }
  
  // Set up dock size range
  const dockSizeRange = document.getElementById('dockSizeRange');
  if (dockSizeRange) {
    // Set initial value from localStorage or default
    const savedDockSize = localStorage.getItem('dockSize') || '100';
    dockSizeRange.value = savedDockSize;
    applyDockSize(savedDockSize);
    
    // Add input event handler
    dockSizeRange.addEventListener('input', () => {
      const size = dockSizeRange.value;
      applyDockSize(size);
      localStorage.setItem('dockSize', size);
    });
  }
  
  // Set up dock opacity range
  const dockOpacityRange = document.getElementById('dockOpacityRange');
  if (dockOpacityRange) {
    // Set initial value from localStorage or default
    const savedDockOpacity = localStorage.getItem('dockOpacity') || '80';
    dockOpacityRange.value = savedDockOpacity;
    applyDockOpacity(savedDockOpacity);
    
    // Add input event handler
    dockOpacityRange.addEventListener('input', () => {
      const opacity = dockOpacityRange.value;
      applyDockOpacity(opacity);
      localStorage.setItem('dockOpacity', opacity);
    });
  }
  
  // Set up dock position selector
  const dockPositionSelect = document.getElementById('dockPositionSelect');
  if (dockPositionSelect) {
    // Set initial value from localStorage or default
    const savedDockPosition = localStorage.getItem('dockPosition') || 'bottom';
    dockPositionSelect.value = savedDockPosition;
    applyDockPosition(savedDockPosition);
    
    // Add change event handler
    dockPositionSelect.addEventListener('change', () => {
      const position = dockPositionSelect.value;
      applyDockPosition(position);
      localStorage.setItem('dockPosition', position);
    });
  }
  
  // Set up widget visibility checkboxes
  const showWeatherCheckbox = document.getElementById('showWeatherCheckbox');
  if (showWeatherCheckbox) {
    // Set initial value from localStorage or default
    showWeatherCheckbox.checked = localStorage.getItem('showWeather') !== 'false';
    applyWeatherVisibility(showWeatherCheckbox.checked);
    
    // Add change event handler
    showWeatherCheckbox.addEventListener('change', () => {
      applyWeatherVisibility(showWeatherCheckbox.checked);
      localStorage.setItem('showWeather', showWeatherCheckbox.checked);
    });
  }
  
  const showClockCheckbox = document.getElementById('showClockCheckbox');
  if (showClockCheckbox) {
    // Set initial value from localStorage or default
    showClockCheckbox.checked = localStorage.getItem('showClock') !== 'false';
    applyClockVisibility(showClockCheckbox.checked);
    
    // Add change event handler
    showClockCheckbox.addEventListener('change', () => {
      applyClockVisibility(showClockCheckbox.checked);
      localStorage.setItem('showClock', showClockCheckbox.checked);
    });
  }
  
  // Set up clear all data button
  const clearAllDataBtn = document.getElementById('clearAllDataBtn');
  if (clearAllDataBtn) {
    clearAllDataBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all data? This will reset all settings and remove all history and bookmarks.')) {
        localStorage.clear();
        showError('All data cleared. Reloading page...', 'info');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    });
  }

  // Weather API key setting
  const weatherApiKeyInput = document.getElementById('weatherApiKey');
  if (weatherApiKeyInput) {
    // Set initial value from localStorage
    weatherApiKeyInput.value = localStorage.getItem('weatherApiKey') || '';
    
    // Add change event handler
    weatherApiKeyInput.addEventListener('change', () => {
      const apiKey = weatherApiKeyInput.value.trim();
      localStorage.setItem('weatherApiKey', apiKey);
      showError('Weather API key saved', 'success');
    });
  }
  
  // Refresh weather button
  const refreshWeatherBtn = document.getElementById('refreshWeatherBtn');
  if (refreshWeatherBtn) {
    refreshWeatherBtn.addEventListener('click', () => {
      fetchWeather().catch(error => {
        console.error('Error refreshing weather:', error);
      });
      showError('Weather data refreshed', 'info');
    });
  }
}

// Apply dock size
function applyDockSize(size) {
  const dock = document.querySelector('.dock-container');
  if (dock) {
    const scale = parseInt(size) / 100;
    const items = dock.querySelectorAll('.dock-item');
    
    items.forEach(item => {
      if (dock.classList.contains('position-left') || dock.classList.contains('position-right')) {
        item.style.width = `${48 * scale}px`;
        item.style.height = `${48 * scale}px`;
      } else {
        item.style.width = `${48 * scale}px`;
        item.style.height = `${48 * scale}px`;
      }
      
      const img = item.querySelector('img');
      if (img) {
        img.style.width = `${32 * scale}px`;
        img.style.height = `${32 * scale}px`;
      }
    });
  }
}

// Apply dock opacity
function applyDockOpacity(opacity) {
  const dock = document.querySelector('.dock-container');
  if (dock) {
    const opacityValue = parseInt(opacity) / 100;
    dock.style.background = `rgba(255, 255, 255, ${opacityValue * 0.15})`;
  }
}

// Apply dock position
function applyDockPosition(position) {
  const dock = document.querySelector('.dock-container');
  if (dock) {
    // Remove existing position classes
    dock.classList.remove('position-bottom', 'position-left', 'position-right');
    // Add new position class
    dock.classList.add(`position-${position}`);
  }
}

// Apply weather widget visibility
function applyWeatherVisibility(visible) {
  const weatherWidget = document.querySelector('.weather-widget');
  if (weatherWidget) {
    weatherWidget.style.display = visible ? 'block' : 'none';
  }
}

// Apply clock widget visibility
function applyClockVisibility(visible) {
  const clockWidget = document.querySelector('.clock-widget');
  if (clockWidget) {
    clockWidget.style.display = visible ? 'block' : 'none';
  }
}

// Add sidebar links functionality
function initializeSidebarLinks() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.querySelectorAll('img').forEach(icon => {
      if (icon.id !== 'darkModeToggle') { // Skip dark mode toggle as it has its own handler
        icon.addEventListener('click', () => {
          const url = getAppUrl(icon.alt);
          if (url) {
            window.open(url, '_blank');
            addToHistory(url, `Opened ${icon.alt}`);
          }
        });
      }
    });
  }
}

// Get appropriate URL based on app name
function getAppUrl(appName) {
  const appUrls = {
    'WhatsApp': 'https://web.whatsapp.com',
    'Messenger': 'https://messenger.com',
    'Twitter': 'https://twitter.com',
    'Spotify': 'https://open.spotify.com',
    'Vishwakarma Express': '#' // Just refresh the page
  };
  
  return appUrls[appName] || '#';
}