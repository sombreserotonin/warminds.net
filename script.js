document.addEventListener('DOMContentLoaded', () => {
    // Initialize the page
    initializeSystemStats();
    initializeUptime();
    addCardHoverEffects();
    
    // Check if we can connect to Prometheus
    checkPrometheusConnection();
});

// Check if we can connect to Prometheus and show a warning if not
async function checkPrometheusConnection() {
    const prometheusUrl = 'http://192.168.86.24:9090/api/v1/query?query=up';
    
    try {
        const response = await fetch(prometheusUrl);
        const data = await response.json();
        
        if (data.status !== 'success') {
            showConnectionWarning("Could not connect to Prometheus API. Check if Prometheus is running.");
        }
    } catch (error) {
        console.error('Error connecting to Prometheus:', error);
        
        // If we get a CORS error, show a specific warning
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            showConnectionWarning(
                "CORS error detected. You may need to enable CORS on your Prometheus server or use a CORS proxy.<br>" +
                "Add <code>--web.cors.origin='.*'</code> to your Prometheus startup flags."
            );
        } else {
            showConnectionWarning("Could not connect to Prometheus API. Check if Prometheus is running.");
        }
    }
    
    function showConnectionWarning(message) {
        // Create warning element
        const warning = document.createElement('div');
        warning.className = 'prometheus-warning';
        warning.innerHTML = `
            <div class="warning-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <div class="warning-message">${message}</div>
            <button class="warning-close"><i class="fas fa-times"></i></button>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .prometheus-warning {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(255, 100, 100, 0.9);
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 15px;
                max-width: 90%;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .warning-icon {
                font-size: 24px;
                color: yellow;
            }
            .warning-message {
                flex: 1;
            }
            .warning-message code {
                background: rgba(0, 0, 0, 0.3);
                padding: 2px 5px;
                border-radius: 4px;
                font-family: monospace;
            }
            .warning-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 18px;
                padding: 5px;
            }
        `;
        document.head.appendChild(style);
        
        // Add to body
        document.body.appendChild(warning);
        
        // Add close button functionality
        warning.querySelector('.warning-close').addEventListener('click', () => {
            warning.remove();
        });
    }
}

// Fetch real system stats from Prometheus
function initializeSystemStats() {
    const cpuUsage = document.getElementById('cpu-usage');
    const ramUsage = document.getElementById('ram-usage');
    const storageUsage = document.getElementById('storage-usage');
    const networkUsage = document.getElementById('network-usage');
    
    // Prometheus server URL
    const prometheusUrl = 'http://192.168.86.24:9090/api/v1/query';
    
    // Initial update
    updateSystemStats();
    
    // Update stats every 10 seconds
    setInterval(updateSystemStats, 10000);
    
    async function updateSystemStats() {
        try {
            // Fetch CPU usage (100 - idle percentage)
            const cpuQuery = '100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)';
            console.log('Fetching CPU data with query:', cpuQuery);
            const cpuResponse = await fetch(`${prometheusUrl}?query=${encodeURIComponent(cpuQuery)}`);
            
            if (!cpuResponse.ok) {
                console.error('CPU query failed:', await cpuResponse.text());
                throw new Error(`CPU query failed with status: ${cpuResponse.status}`);
            }
            
            const cpuData = await cpuResponse.json();
            console.log('CPU response:', cpuData);
            
            let cpu = 0;
            if (cpuData.status === 'success' && cpuData.data.result.length > 0) {
                cpu = parseFloat(cpuData.data.result[0].value[1]).toFixed(1);
            } else {
                console.warn('CPU data not available or empty result set');
            }
            
            // Fetch RAM usage (used memory in GB)
            const ramQuery = '(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / 1024 / 1024 / 1024';
            console.log('Fetching RAM usage data with query:', ramQuery);
            const ramResponse = await fetch(`${prometheusUrl}?query=${encodeURIComponent(ramQuery)}`);
            
            if (!ramResponse.ok) {
                console.error('RAM query failed:', await ramResponse.text());
                throw new Error(`RAM query failed with status: ${ramResponse.status}`);
            }
            
            const ramData = await ramResponse.json();
            console.log('RAM usage response:', ramData);
            
            let ram = 0;
            if (ramData.status === 'success' && ramData.data.result.length > 0) {
                ram = parseFloat(ramData.data.result[0].value[1]).toFixed(1);
            } else {
                console.warn('RAM usage data not available or empty result set');
            }
            
            // Fetch total RAM (for percentage calculation)
            const totalRamQuery = 'node_memory_MemTotal_bytes / 1024 / 1024 / 1024';
            console.log('Fetching total RAM data with query:', totalRamQuery);
            const totalRamResponse = await fetch(`${prometheusUrl}?query=${encodeURIComponent(totalRamQuery)}`);
            
            if (!totalRamResponse.ok) {
                console.error('Total RAM query failed:', await totalRamResponse.text());
                throw new Error(`Total RAM query failed with status: ${totalRamResponse.status}`);
            }
            
            const totalRamData = await totalRamResponse.json();
            console.log('Total RAM response:', totalRamData);
            
            let totalRam = 0;
            if (totalRamData.status === 'success' && totalRamData.data.result.length > 0) {
                totalRam = parseFloat(totalRamData.data.result[0].value[1]).toFixed(1);
            } else {
                console.warn('Total RAM data not available or empty result set');
            }
            
            // Fetch storage usage (used space in TB)
            const storageQuery = 'sum(node_filesystem_size_bytes{fstype!="tmpfs",fstype!="ramfs"} - node_filesystem_avail_bytes{fstype!="tmpfs",fstype!="ramfs"}) / 1024 / 1024 / 1024 / 1024';
            console.log('Fetching storage usage data with query:', storageQuery);
            const storageResponse = await fetch(`${prometheusUrl}?query=${encodeURIComponent(storageQuery)}`);
            
            if (!storageResponse.ok) {
                console.error('Storage usage query failed:', await storageResponse.text());
                throw new Error(`Storage usage query failed with status: ${storageResponse.status}`);
            }
            
            const storageData = await storageResponse.json();
            console.log('Storage usage response:', storageData);
            
            let storage = 0;
            if (storageData.status === 'success' && storageData.data.result.length > 0) {
                storage = parseFloat(storageData.data.result[0].value[1]).toFixed(1);
            } else {
                console.warn('Storage usage data not available or empty result set');
            }
            
            // Fetch total storage (for percentage calculation)
            const totalStorageQuery = 'sum(node_filesystem_size_bytes{fstype!="tmpfs",fstype!="ramfs"}) / 1024 / 1024 / 1024 / 1024';
            console.log('Fetching total storage data with query:', totalStorageQuery);
            const totalStorageResponse = await fetch(`${prometheusUrl}?query=${encodeURIComponent(totalStorageQuery)}`);
            
            if (!totalStorageResponse.ok) {
                console.error('Total storage query failed:', await totalStorageResponse.text());
                throw new Error(`Total storage query failed with status: ${totalStorageResponse.status}`);
            }
            
            const totalStorageData = await totalStorageResponse.json();
            console.log('Total storage response:', totalStorageData);
            
            let totalStorage = 0;
            if (totalStorageData.status === 'success' && totalStorageData.data.result.length > 0) {
                totalStorage = parseFloat(totalStorageData.data.result[0].value[1]).toFixed(1);
            } else {
                console.warn('Total storage data not available or empty result set');
            }
            
            // Fetch network usage (current network traffic in Mbps)
            const networkQuery = 'sum(rate(node_network_receive_bytes_total[1m]) + rate(node_network_transmit_bytes_total[1m])) * 8 / 1024 / 1024';
            console.log('Fetching network usage data with query:', networkQuery);
            const networkResponse = await fetch(`${prometheusUrl}?query=${encodeURIComponent(networkQuery)}`);
            
            if (!networkResponse.ok) {
                console.error('Network usage query failed:', await networkResponse.text());
                throw new Error(`Network usage query failed with status: ${networkResponse.status}`);
            }
            
            const networkData = await networkResponse.json();
            console.log('Network usage response:', networkData);
            
            let network = 0;
            if (networkData.status === 'success' && networkData.data.result.length > 0) {
                network = parseFloat(networkData.data.result[0].value[1]).toFixed(1);
            } else {
                console.warn('Network usage data not available or empty result set');
            }
            
            // Apply values with smooth transition
            animateValue(cpuUsage, `CPU: ${cpu}%`);
            animateValue(ramUsage, `RAM: ${ram}/${totalRam} GB`);
            animateValue(storageUsage, `Storage: ${storage}/${totalStorage} TB`);
            animateValue(networkUsage, `Network: ${network} Mbps`);
        } catch (error) {
            console.error('Error fetching Prometheus data:', error);
            // Fallback to placeholder values if there's an error
            animateValue(cpuUsage, `CPU: Error`);
            animateValue(ramUsage, `RAM: Error`);
            animateValue(storageUsage, `Storage: Error`);
            animateValue(networkUsage, `Network: Error`);
        }
    }
    
    function animateValue(element, newValue) {
        element.style.transition = 'opacity 0.5s ease-in-out';
        element.style.opacity = 0;
        
        setTimeout(() => {
            element.textContent = newValue;
            element.style.opacity = 1;
        }, 500);
    }
}

// Initialize and update the uptime counter using Prometheus data
function initializeUptime() {
    const uptimeCounter = document.getElementById('uptime-counter');
    const prometheusUrl = 'http://192.168.86.24:9090/api/v1/query';
    
    // Initial update
    updateUptime();
    
    // Update uptime every minute (no need to update seconds more frequently)
    setInterval(updateUptime, 60000);
    
    // Local counter for seconds (updated every second)
    let localUptimeSeconds = 0;
    let localIntervalId = null;
    
    async function updateUptime() {
        try {
            // Fetch node uptime in seconds from Prometheus
            const uptimeQuery = 'node_time_seconds - node_boot_time_seconds';
            console.log('Fetching uptime data with query:', uptimeQuery);
            
            const response = await fetch(`${prometheusUrl}?query=${encodeURIComponent(uptimeQuery)}`);
            
            if (!response.ok) {
                console.error('Uptime query failed:', await response.text());
                throw new Error(`Uptime query failed with status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Uptime response:', data);
            
            if (data.status === 'success' && data.data.result.length > 0) {
                // Get uptime in seconds
                localUptimeSeconds = Math.floor(parseFloat(data.data.result[0].value[1]));
                console.log('Server uptime in seconds:', localUptimeSeconds);
                
                // Format and display uptime
                formatAndDisplayUptime(localUptimeSeconds);
                
                // Clear any existing interval
                if (localIntervalId) {
                    clearInterval(localIntervalId);
                }
                
                // Start local counter for seconds
                localIntervalId = setInterval(() => {
                    localUptimeSeconds++;
                    formatAndDisplayUptime(localUptimeSeconds);
                }, 1000);
            } else {
                console.warn('Uptime data not available or empty result set');
                uptimeCounter.textContent = "Error fetching uptime";
                
                // Try alternative uptime query if the first one fails
                tryAlternativeUptimeQuery();
            }
        } catch (error) {
            console.error('Error fetching uptime data:', error);
            uptimeCounter.textContent = "Error fetching uptime";
            
            // Try alternative uptime query if the first one fails
            tryAlternativeUptimeQuery();
        }
    }
    
    // Try an alternative uptime query if the main one fails
    async function tryAlternativeUptimeQuery() {
        try {
            console.log('Trying alternative uptime query...');
            const altUptimeQuery = 'process_start_time_seconds';
            
            const response = await fetch(`${prometheusUrl}?query=${encodeURIComponent(altUptimeQuery)}`);
            
            if (!response.ok) {
                console.error('Alternative uptime query failed:', await response.text());
                return;
            }
            
            const data = await response.json();
            console.log('Alternative uptime response:', data);
            
            if (data.status === 'success' && data.data.result.length > 0) {
                // Calculate uptime as current time minus process start time
                const startTimeSeconds = parseFloat(data.data.result[0].value[1]);
                const currentTimeSeconds = Math.floor(Date.now() / 1000);
                localUptimeSeconds = currentTimeSeconds - startTimeSeconds;
                console.log('Server uptime from alternative query (seconds):', localUptimeSeconds);
                
                // Format and display uptime
                formatAndDisplayUptime(localUptimeSeconds);
                
                // Clear any existing interval
                if (localIntervalId) {
                    clearInterval(localIntervalId);
                }
                
                // Start local counter for seconds
                localIntervalId = setInterval(() => {
                    localUptimeSeconds++;
                    formatAndDisplayUptime(localUptimeSeconds);
                }, 1000);
            } else {
                console.warn('Alternative uptime data not available or empty result set');
                // Fall back to a default uptime value
                localUptimeSeconds = 0;
                formatAndDisplayUptime(localUptimeSeconds);
                
                // Start local counter for seconds
                if (localIntervalId) {
                    clearInterval(localIntervalId);
                }
                
                localIntervalId = setInterval(() => {
                    localUptimeSeconds++;
                    formatAndDisplayUptime(localUptimeSeconds);
                }, 1000);
            }
        } catch (error) {
            console.error('Error fetching alternative uptime data:', error);
            // Fall back to a default uptime value
            localUptimeSeconds = 0;
            formatAndDisplayUptime(localUptimeSeconds);
            
            // Start local counter for seconds
            if (localIntervalId) {
                clearInterval(localIntervalId);
            }
            
            localIntervalId = setInterval(() => {
                localUptimeSeconds++;
                formatAndDisplayUptime(localUptimeSeconds);
            }, 1000);
        }
    }
    
    function formatAndDisplayUptime(seconds) {
        // Calculate days, hours, minutes, seconds
        const days = Math.floor(seconds / (60 * 60 * 24));
        const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((seconds % (60 * 60)) / 60);
        const remainingSeconds = seconds % 60;
        
        // Format the uptime string
        const uptimeString = `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
        uptimeCounter.textContent = uptimeString;
    }
}

// Add hover effects to service cards
function addCardHoverEffects() {
    const cards = document.querySelectorAll('.service-card');
    
    cards.forEach(card => {
        // Check if the card is disabled
        const isDisabled = card.querySelector('.service-disabled') !== null;
        
        card.addEventListener('mouseenter', () => {
            // Add a subtle glow effect to other cards
            cards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.style.opacity = '0.7';
                    otherCard.style.transform = 'scale(0.98)';
                    otherCard.style.transition = 'all 0.3s ease';
                }
            });
        });
        
        card.addEventListener('mouseleave', () => {
            // Reset all cards
            cards.forEach(otherCard => {
                otherCard.style.opacity = '1';
                otherCard.style.transform = 'scale(1)';
            });
        });
        
        // Add click effect only for enabled cards
        card.addEventListener('click', (e) => {
            // Skip ripple effect for disabled cards
            if (isDisabled) return;
            
            // Only apply the effect if the click is on the card but not on the link
            if (!e.target.closest('.service-link')) {
                const ripple = document.createElement('div');
                ripple.classList.add('ripple');
                
                const rect = card.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                
                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
                ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
                
                card.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            }
        });
    });
    
    // Add CSS for ripple effect
    const style = document.createElement('style');
    style.textContent = `
        .service-card {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Add a subtle parallax effect to the background
window.addEventListener('mousemove', (e) => {
    const stars = document.querySelector('.stars');
    const twinkling = document.querySelector('.twinkling');
    
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    stars.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
    twinkling.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
});

// Add a typing effect to the tagline
document.addEventListener('DOMContentLoaded', () => {
    const tagline = document.querySelector('.tagline');
    const text = tagline.textContent;
    tagline.textContent = '';
    
    let i = 0;
    const typingEffect = setInterval(() => {
        if (i < text.length) {
            tagline.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(typingEffect);
        }
    }, 50);
});

// Add service card click handler for mobile (touch) devices
document.addEventListener('DOMContentLoaded', () => {
    if ('ontouchstart' in window) {
        const cards = document.querySelectorAll('.service-card');
        
        cards.forEach(card => {
            const link = card.querySelector('.service-link');
            // Skip disabled cards
            if (!link) return;
            
            card.addEventListener('click', (e) => {
                // If the click is not on the link itself, trigger the link click
                if (!e.target.closest('.service-link')) {
                    e.preventDefault();
                    link.click();
                }
            });
        });
    }
});
