import { Controller, Get, Query, Res } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { MetricsDashboardService } from "../services/metrics-dashboard.service";

/**
 * Metrics Dashboard Controller
 * Controller para visualizar métricas del sistema en tiempo real
 */
@ApiTags("Metrics Dashboard")
@Controller("metrics-dashboard")
export class MetricsDashboardController {
  constructor(private readonly dashboardService: MetricsDashboardService) {}

  /**
   * Obtener dashboard HTML
   */
  @Get()
  @ApiOperation({ summary: "Ver dashboard de métricas HTML" })
  @ApiResponse({ status: 200, description: "Dashboard HTML" })
  async getDashboard(@Res() res: Response) {
    const html = this.generateDashboardHTML();
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  }

  /**
   * Obtener métricas globales
   */
  @Get("api/global")
  @ApiOperation({ summary: "Obtener métricas globales del sistema" })
  @ApiQuery({ name: "from", required: false, description: "Fecha inicio" })
  @ApiQuery({ name: "to", required: false, description: "Fecha fin" })
  @ApiResponse({ status: 200, description: "Métricas globales" })
  async getGlobalMetrics(
    @Query("from") from?: string,
    @Query("to") to?: string
  ) {
    return await this.dashboardService.getGlobalMetrics();
  }

  /**
   * Obtener estado de salud del sistema
   */
  @Get("api/health")
  @ApiOperation({ summary: "Estado de salud del sistema" })
  @ApiResponse({ status: 200, description: "Estado de salud" })
  async getSystemHealth() {
    return await this.dashboardService.getSystemHealth();
  }

  /**
   * Obtener configuraciones activas
   */
  @Get("api/configurations")
  @ApiOperation({ summary: "Obtener configuraciones activas" })
  @ApiResponse({ status: 200, description: "Configuraciones" })
  async getActiveConfigurations() {
    return await this.dashboardService.getActiveConfigurations();
  }

  /**
   * Obtener métricas de un servicio específico
   */
  @Get("api/service/:serviceName")
  @ApiOperation({ summary: "Métricas de un servicio" })
  @ApiResponse({ status: 200, description: "Métricas del servicio" })
  async getServiceMetrics(@Query("serviceName") serviceName: string) {
    return await this.dashboardService.getServiceMetricsDetail(serviceName);
  }

  /**
   * Generar HTML del dashboard
   */
  private generateDashboardHTML(): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bookly - Metrics Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            padding: 20px;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        header {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        h1 {
            color: #667eea;
            margin-bottom: 10px;
            font-size: 2.5em;
        }
        .subtitle {
            color: #666;
            font-size: 1.1em;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: transform 0.3s ease;
        }
        .metric-card:hover {
            transform: translateY(-5px);
        }
        .metric-title {
            font-size: 0.9em;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
        }
        .metric-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }
        .metric-subtitle {
            color: #999;
            font-size: 0.9em;
        }
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        .status-healthy {
            background-color: #10b981;
        }
        .status-warning {
            background-color: #f59e0b;
        }
        .status-error {
            background-color: #ef4444;
        }
        .chart-container {
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .chart-title {
            font-size: 1.3em;
            color: #333;
            margin-bottom: 20px;
            font-weight: 600;
        }
        .provider-list {
            list-style: none;
        }
        .provider-item {
            padding: 12px;
            border-bottom: 1px solid #f0f0f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .provider-item:last-child {
            border-bottom: none;
        }
        .provider-name {
            font-weight: 600;
            color: #333;
        }
        .provider-status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
        }
        .provider-active {
            background: #d1fae5;
            color: #065f46;
        }
        .provider-inactive {
            background: #fee2e2;
            color: #991b1b;
        }
        .refresh-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1em;
            font-weight: 600;
            transition: background 0.3s ease;
        }
        .refresh-btn:hover {
            background: #5568d3;
        }
        .last-update {
            color: #999;
            font-size: 0.9em;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📊 Bookly Metrics Dashboard</h1>
            <p class="subtitle">Sistema de Monitoreo en Tiempo Real</p>
            <p class="last-update" id="lastUpdate">Última actualización: --</p>
            <button class="refresh-btn" onclick="loadMetrics()">🔄 Actualizar</button>
        </header>

        <div class="metrics-grid" id="metricsGrid">
            <!-- Las métricas se cargarán aquí -->
        </div>

        <div class="chart-container">
            <h3 class="chart-title">Notificaciones por Canal</h3>
            <canvas id="channelChart"></canvas>
        </div>

        <div class="chart-container">
            <h3 class="chart-title">Notificaciones por Proveedor</h3>
            <canvas id="providerChart"></canvas>
        </div>

        <div class="chart-container">
            <h3 class="chart-title">Estado de Servicios</h3>
            <div id="servicesStatus"></div>
        </div>

        <div class="chart-container">
            <h3 class="chart-title">Proveedores Configurados</h3>
            <div id="providersList"></div>
        </div>
    </div>

    <script>
        let channelChart, providerChart;

        async function loadMetrics() {
            try {
                const response = await fetch('/metrics-dashboard/api/global');
                const data = await response.json();

                updateMetricsCards(data);
                updateCharts(data);

                document.getElementById('lastUpdate').textContent = 
                    'Última actualización: ' + new Date().toLocaleString('es-ES');
            } catch (error) {
                console.error('Error loading metrics:', error);
            }

            // Cargar salud del sistema
            try {
                const healthResponse = await fetch('/metrics-dashboard/api/health');
                const healthData = await healthResponse.json();
                updateServicesStatus(healthData);
            } catch (error) {
                console.error('Error loading health:', error);
            }

            // Cargar configuraciones
            try {
                const configResponse = await fetch('/metrics-dashboard/api/configurations');
                const configData = await configResponse.json();
                updateProvidersList(configData);
            } catch (error) {
                console.error('Error loading configurations:', error);
            }
        }

        function updateMetricsCards(data) {
            const grid = document.getElementById('metricsGrid');
            const notifications = data.notifications;

            grid.innerHTML = \`
                <div class="metric-card">
                    <div class="metric-title">Total Notificaciones</div>
                    <div class="metric-value">\${notifications.total.toLocaleString()}</div>
                    <div class="metric-subtitle">Enviadas en total</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Tasa de Éxito</div>
                    <div class="metric-value">\${notifications.successRate.toFixed(1)}%</div>
                    <div class="metric-subtitle">\${notifications.success} exitosas</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Fallidas</div>
                    <div class="metric-value">\${notifications.failed.toLocaleString()}</div>
                    <div class="metric-subtitle">Requieren atención</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Estado del Sistema</div>
                    <div class="metric-value">
                        <span class="status-indicator status-healthy"></span>
                        Healthy
                    </div>
                    <div class="metric-subtitle">Todos los servicios operativos</div>
                </div>
            \`;
        }

        function updateCharts(data) {
            const notifications = data.notifications;

            // Chart de canales
            const channelCtx = document.getElementById('channelChart').getContext('2d');
            if (channelChart) channelChart.destroy();

            const channelData = notifications.byChannel || {};
            channelChart = new Chart(channelCtx, {
                type: 'bar',
                data: {
                    labels: Object.keys(channelData),
                    datasets: [{
                        label: 'Notificaciones por Canal',
                        data: Object.values(channelData),
                        backgroundColor: [
                            'rgba(102, 126, 234, 0.8)',
                            'rgba(118, 75, 162, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(245, 158, 11, 0.8)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            // Chart de proveedores
            const providerCtx = document.getElementById('providerChart').getContext('2d');
            if (providerChart) providerChart.destroy();

            const providerData = notifications.byProvider || {};
            providerChart = new Chart(providerCtx, {
                type: 'pie',
                data: {
                    labels: Object.keys(providerData),
                    datasets: [{
                        data: Object.values(providerData),
                        backgroundColor: [
                            'rgba(102, 126, 234, 0.8)',
                            'rgba(118, 75, 162, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(239, 68, 68, 0.8)',
                            'rgba(59, 130, 246, 0.8)'
                        ]
                    }]
                },
                options: {
                    responsive: true
                }
            });
        }

        function updateServicesStatus(healthData) {
            const container = document.getElementById('servicesStatus');
            const services = healthData.services || {};

            container.innerHTML = Object.entries(services).map(([name, service]) => \`
                <div class="provider-item">
                    <span class="provider-name">
                        <span class="status-indicator status-\${service.status === 'healthy' ? 'healthy' : 'error'}"></span>
                        \${name.toUpperCase()} Service
                    </span>
                    <span class="provider-status provider-\${service.status === 'healthy' ? 'active' : 'inactive'}">
                        \${service.status}
                    </span>
                </div>
            \`).join('');
        }

        function updateProvidersList(configData) {
            const container = document.getElementById('providersList');
            const providers = configData.providers || {};

            container.innerHTML = \`
                <ul class="provider-list">
                    <li class="provider-item">
                        <span class="provider-name">📧 Email Providers</span>
                        <span class="provider-status provider-active">\${providers.email} configurados</span>
                    </li>
                    <li class="provider-item">
                        <span class="provider-name">📱 SMS Providers</span>
                        <span class="provider-status provider-active">\${providers.sms} configurados</span>
                    </li>
                    <li class="provider-item">
                        <span class="provider-name">💬 WhatsApp Providers</span>
                        <span class="provider-status provider-active">\${providers.whatsapp} configurados</span>
                    </li>
                    <li class="provider-item">
                        <span class="provider-name">🔔 Push Providers</span>
                        <span class="provider-status provider-active">\${providers.push} configurados</span>
                    </li>
                </ul>
            \`;
        }

        // Cargar métricas al inicio
        loadMetrics();

        // Actualizar cada 30 segundos
        setInterval(loadMetrics, 30000);
    </script>
</body>
</html>
    `;
  }
}
