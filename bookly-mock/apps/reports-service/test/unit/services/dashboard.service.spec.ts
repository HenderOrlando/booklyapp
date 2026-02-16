import { DashboardService } from "../../../src/application/services/dashboard.service";

describe("DashboardService", () => {
  let service: DashboardService;
  let dashboardMetricRepository: any;
  let metricsAggregationService: any;
  let trendAnalysisService: any;

  beforeEach(() => {
    dashboardMetricRepository = {
      findMany: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
    };

    metricsAggregationService = {
      calculateOverviewKPIs: jest.fn().mockResolvedValue({
        totalReservations: 100,
        totalReservationsToday: 10,
        totalHoursUsed: 500,
        averageOccupancyRate: 0.75,
        cancelledRate: 0.05,
        noShowRate: 0.03,
        completionRate: 0.92,
      }),
      calculateOccupancyMetrics: jest.fn().mockResolvedValue({
        activeResources: 20,
        totalResources: 25,
      }),
    };

    trendAnalysisService = {
      analyzeTrend: jest.fn().mockResolvedValue([]),
    };

    service = new DashboardService(
      dashboardMetricRepository,
      metricsAggregationService,
      trendAnalysisService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- RF-36: Dashboards interactivos ---

  describe("getOverview", () => {
    it("Given metrics data exists, When getOverview is called, Then it should return KPIs and recent activity", async () => {
      const result = await service.getOverview();

      expect(result).toBeDefined();
      expect(result.kpis).toBeDefined();
      expect(result.kpis.totalReservations).toBe(100);
      expect(result.kpis.averageOccupancyRate).toBe(0.75);
      expect(result.recentActivity).toBeDefined();
      expect(metricsAggregationService.calculateOverviewKPIs).toHaveBeenCalled();
    });
  });
});
