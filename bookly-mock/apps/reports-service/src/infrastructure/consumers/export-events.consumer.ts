import { createLogger } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { ExportProcessorService } from "../../application/services/export-processor.service";

const logger = createLogger("ExportEventsConsumer");

/**
 * Export Events Consumer
 * Consumer para eventos relacionados con exportaciones
 */
@Injectable()
export class ExportEventsConsumer implements OnModuleInit {
  constructor(
    private readonly eventBus: EventBusService,
    private readonly exportProcessor: ExportProcessorService
  ) {}

  async onModuleInit() {
    await this.subscribeToExportEvents();
  }

  /**
   * Suscribirse a eventos de exportación
   */
  private async subscribeToExportEvents(): Promise<void> {
    try {
      // Evento: Exportación solicitada
      await this.eventBus.subscribe(
        "reports.export.requested",
        "reports-export-processor",
        async (event) => await this.handleExportRequested(event)
      );

      logger.info("Export events consumer initialized");
    } catch (error: any) {
      logger.error("Failed to subscribe to export events", error);
      throw error;
    }
  }

  /**
   * Manejar evento de exportación solicitada
   */
  private async handleExportRequested(event: any): Promise<void> {
    try {
      const { exportId } = event.data;

      logger.info("Processing export request event", {
        exportId,
        eventId: event.eventId,
      });

      // Procesar exportación de forma asíncrona
      // Usar setTimeout para no bloquear el event handler
      setTimeout(async () => {
        try {
          await this.exportProcessor.processExport(exportId);
        } catch (error: any) {
          logger.error("Failed to process export in background", error);
        }
      }, 100);

      logger.debug("Export request event handled", { exportId });
    } catch (error: any) {
      logger.error("Failed to handle export requested event", error);
      // No relanzar el error para evitar reintentos del event bus
    }
  }
}
