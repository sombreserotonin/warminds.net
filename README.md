# WARMINDSERVER Dashboard with Prometheus Integration

This dashboard displays real-time server statistics from your Unraid server using Prometheus metrics.

## Features

- Real-time server statistics (CPU, RAM, Storage, Network) from Prometheus
- Real server uptime from Prometheus
- Automatic error handling and fallbacks
- CORS error detection and helpful warnings
- Optional CORS proxy for environments with CORS restrictions

## Setup

1. Make sure Prometheus is running on your Unraid server at `192.168.86.24:9090`
2. Open `index.html` in your web browser to view the dashboard

## CORS Configuration

If you encounter CORS errors (visible in browser console or as a warning on the dashboard), you have two options:

### Option 1: Enable CORS on Prometheus (Recommended)

Add the following flag to your Prometheus startup configuration:

```
--web.cors.origin='.*'
```

This allows your dashboard to directly query the Prometheus API from any origin.

### Option 2: Use the included CORS proxy

If you can't modify your Prometheus configuration, you can use the included proxy:

1. Make sure Node.js is installed on your system
2. Run the proxy server:
   ```
   node proxy.js
   ```
3. Update the `prometheusUrl` in `script.js` to use the proxy:
   ```javascript
   const prometheusUrl = 'http://localhost:3001/proxy';
   ```

## Prometheus Queries Used

The dashboard uses the following Prometheus queries:

- **CPU Usage**: `100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)`
- **RAM Usage**: `(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / 1024 / 1024 / 1024`
- **Total RAM**: `node_memory_MemTotal_bytes / 1024 / 1024 / 1024`
- **Storage Usage**: `sum(node_filesystem_size_bytes{fstype!="tmpfs",fstype!="ramfs"} - node_filesystem_avail_bytes{fstype!="tmpfs",fstype!="ramfs"}) / 1024 / 1024 / 1024 / 1024`
- **Total Storage**: `sum(node_filesystem_size_bytes{fstype!="tmpfs",fstype!="ramfs"}) / 1024 / 1024 / 1024 / 1024`
- **Network Usage**: `sum(rate(node_network_receive_bytes_total[1m]) + rate(node_network_transmit_bytes_total[1m])) * 8 / 1024 / 1024`
- **Uptime**: `node_time_seconds - node_boot_time_seconds`

## Customization

- To change the Prometheus server address, update the `prometheusUrl` variable in `script.js`
- To modify the update frequency, change the interval time in the `setInterval` calls in `script.js`
