import './style.css'
import Alpine from 'alpinejs';

const  API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

//example query to database
export async function fetchHi() {
  const response = await fetch(`${API_BASE_URL}/hello`)
  return response.json();
}

// Make appData globally accessible for Alpine
window.appData = function() {
  return {
    // Live feed data
    isConnected: false,
    eventSource: null,
    latestData: null,
    history: [],
    maxHistory: 50,
    error: null,
    
    // Stats
    avgConfidence: 0,
    avgAccuracy: 0,
    totalIterations: 0,
    
    init() {
      // Connect to SSE stream when component initializes
      this.connectToStream();
    },
    
    connectToStream() {
      try {
        this.eventSource = new EventSource(`${API_BASE_URL}/stream`);
        
        this.eventSource.onopen = () => {
          this.isConnected = true;
          this.error = null;
          console.log('Connected to ML algorithm stream');
        };
        
        this.eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          this.latestData = data;
          
          // Add to history
          this.history.unshift(data);
          if (this.history.length > this.maxHistory) {
            this.history.pop();
          }
          
          // Update stats
          this.updateStats();
          this.totalIterations = data.iteration;
        };
        
        this.eventSource.onerror = (error) => {
          console.error('SSE Error:', error);
          this.isConnected = false;
          this.error = 'Connection lost. Retrying...';
        };
      } catch (err) {
        this.error = `Failed to connect: ${err.message}`;
      }
    },
    
    disconnectStream() {
      if (this.eventSource) {
        this.eventSource.close();
        this.isConnected = false;
        this.eventSource = null;
      }
    },
    
    updateStats() {
      if (this.history.length === 0) return;
      
      const confidenceSum = this.history.reduce((sum, item) => sum + item.confidence, 0);
      const accuracySum = this.history.reduce((sum, item) => sum + item.accuracy, 0);
      
      this.avgConfidence = (confidenceSum / this.history.length).toFixed(4);
      this.avgAccuracy = (accuracySum / this.history.length).toFixed(4);
    },
    
    clearHistory() {
      this.history = [];
      this.avgConfidence = 0;
      this.avgAccuracy = 0;
    },
    
    getStatusColor(status) {
      const colors = {
        'processing': '#3b82f6',
        'analyzing': '#8b5cf6',
        'predicting': '#10b981',
        'optimizing': '#f59e0b'
      };
      return colors[status] || '#6b7280';
    }
  }
}

document.querySelector('#app').innerHTML = `
  <div x-data="appData()" class="dashboard">
    <header class="dashboard-header">
      <h1>🤖 ML Algorithm Live Dashboard</h1>
      <div class="connection-status">
        <span class="status-dot" :class="isConnected ? 'connected' : 'disconnected'"></span>
        <span x-text="isConnected ? 'Connected' : 'Disconnected'"></span>
      </div>
    </header>
    
    <div x-show="error" class="error-banner" x-text="error"></div>
    
    <!-- Real-time Metrics -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Current Prediction</div>
        <div class="metric-value" x-text="latestData ? latestData.prediction.toFixed(2) : '--'"></div>
      </div>
      
      <div class="metric-card">
        <div class="metric-label">Confidence</div>
        <div class="metric-value" x-text="latestData ? (latestData.confidence * 100).toFixed(2) + '%' : '--'"></div>
      </div>
      
      <div class="metric-card">
        <div class="metric-label">Accuracy</div>
        <div class="metric-value" x-text="latestData ? (latestData.accuracy * 100).toFixed(2) + '%' : '--'"></div>
      </div>
      
      <div class="metric-card">
        <div class="metric-label">Status</div>
        <div class="metric-value status-badge" 
             :style="'color: ' + (latestData ? getStatusColor(latestData.status) : '#6b7280')"
             x-text="latestData ? latestData.status : '--'"></div>
      </div>
    </div>
    
    <!-- Statistics -->
    <div class="stats-section">
      <h2>Statistics (Last ${window.appData().maxHistory} iterations)</h2>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">Total Iterations:</span>
          <span class="stat-value" x-text="totalIterations"></span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Avg Confidence:</span>
          <span class="stat-value" x-text="avgConfidence ? (avgConfidence * 100).toFixed(2) + '%' : '--'"></span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Avg Accuracy:</span>
          <span class="stat-value" x-text="avgAccuracy ? (avgAccuracy * 100).toFixed(2) + '%' : '--'"></span>
        </div>
        <div class="stat-item">
          <span class="stat-label">History Size:</span>
          <span class="stat-value" x-text="history.length"></span>
        </div>
      </div>
    </div>
    
    <!-- Live Feed -->
    <div class="feed-section">
      <div class="feed-header">
        <h2>Live Feed</h2>
        <button @click="clearHistory()" class="clear-button">Clear History</button>
      </div>
      
      <div class="feed-list">
        <template x-for="item in history" :key="item.iteration">
          <div class="feed-item">
            <div class="feed-item-header">
              <span class="feed-iteration">#<span x-text="item.iteration"></span></span>
              <span class="feed-time" x-text="new Date(item.timestamp).toLocaleTimeString()"></span>
            </div>
            <div class="feed-item-body">
              <div class="feed-data">
                <span class="feed-label">Prediction:</span>
                <span class="feed-value" x-text="item.prediction"></span>
              </div>
              <div class="feed-data">
                <span class="feed-label">Confidence:</span>
                <span class="feed-value" x-text="(item.confidence * 100).toFixed(2) + '%'"></span>
              </div>
              <div class="feed-data">
                <span class="feed-label">Accuracy:</span>
                <span class="feed-value" x-text="(item.accuracy * 100).toFixed(2) + '%'"></span>
              </div>
              <div class="feed-data">
                <span class="feed-label">Status:</span>
                <span class="feed-value status-text" 
                      :style="'color: ' + getStatusColor(item.status)"
                      x-text="item.status"></span>
              </div>
            </div>
          </div>
        </template>
        
        <div x-show="history.length === 0" class="empty-feed">
          <p>Waiting for data...</p>
        </div>
      </div>
    </div>
    
    <!-- Controls -->
    <div class="controls">
      <button @click="isConnected ? disconnectStream() : connectToStream()" 
              class="control-button"
              :class="isConnected ? 'danger' : 'primary'">
        <span x-text="isConnected ? '⏸ Pause Stream' : '▶ Resume Stream'"></span>
      </button>
    </div>
  </div>
`

// Start Alpine after DOM is ready
window.Alpine = Alpine;
Alpine.start();
