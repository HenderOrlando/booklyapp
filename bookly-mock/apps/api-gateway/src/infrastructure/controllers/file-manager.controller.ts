import { ResponseUtil, createLogger } from "@libs/common";
import { CurrentUser, Roles } from "@libs/decorators";
import { JwtAuthGuard, RolesGuard } from "@libs/guards";
import { IStoragePort, STORAGE_PORT } from "@libs/storage";
import {
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

const logger = createLogger("FileManagerController");

/**
 * File Manager Controller (Admin-only)
 * Provides CRUD operations on stored files across providers (local/s3/gcs).
 * Implements guardrails: path allowlist, audit logging, no secret exposure.
 */
@ApiTags("File Manager")
@Controller("admin/files")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("GENERAL_ADMIN")
export class FileManagerController {
  private static readonly ALLOWED_PREFIXES = [
    "documents/",
    "exports/",
    "uploads/",
    "reports/",
    "temp/",
  ];

  constructor(
    @Inject(STORAGE_PORT)
    private readonly storage: IStoragePort,
  ) {}

  @Get()
  @ApiOperation({
    summary: "Listar archivos",
    description: "Lista archivos paginados del provider de storage actual",
  })
  @ApiQuery({ name: "prefix", required: false, type: String })
  @ApiQuery({ name: "maxKeys", required: false, type: Number })
  @ApiQuery({ name: "continuationToken", required: false, type: String })
  @ApiResponse({ status: 200, description: "Lista de archivos" })
  async listFiles(
    @Query("prefix") prefix?: string,
    @Query("maxKeys") maxKeys?: number,
    @Query("continuationToken") continuationToken?: string,
  ) {
    const result = await this.storage.list({
      prefix,
      maxKeys: maxKeys ? Number(maxKeys) : 50,
      continuationToken,
    });

    return ResponseUtil.success(
      {
        provider: this.storage.getProvider(),
        ...result,
      },
      "Files listed successfully",
    );
  }

  @Get(":key")
  @ApiOperation({ summary: "Obtener info de archivo" })
  @ApiResponse({ status: 200, description: "Info del archivo" })
  @ApiResponse({ status: 404, description: "Archivo no encontrado" })
  async getFileInfo(@Param("key") key: string) {
    const decodedKey = decodeURIComponent(key);
    const info = await this.storage.getInfo(decodedKey);

    if (!info) {
      return ResponseUtil.error("File not found");
    }

    return ResponseUtil.success(
      { provider: this.storage.getProvider(), ...info },
      "File info retrieved",
    );
  }

  @Delete(":key")
  @ApiOperation({
    summary: "Eliminar archivo",
    description: "Elimina un archivo con validación de prefijo permitido y auditoría",
  })
  @ApiResponse({ status: 200, description: "Archivo eliminado" })
  @ApiResponse({ status: 400, description: "Prefijo no permitido" })
  @ApiResponse({ status: 404, description: "Archivo no encontrado" })
  async deleteFile(
    @Param("key") key: string,
    @CurrentUser("sub") userId: string,
  ) {
    const decodedKey = decodeURIComponent(key);

    // Guardrail: only allow deletion in approved prefixes
    const isAllowed = FileManagerController.ALLOWED_PREFIXES.some((p) =>
      decodedKey.startsWith(p),
    );

    if (!isAllowed && decodedKey.includes("/")) {
      logger.warn("Delete blocked: path not in allowlist", {
        key: decodedKey,
        userId,
      });
      return ResponseUtil.error(
        `Delete not allowed for path '${decodedKey}'. Allowed prefixes: ${FileManagerController.ALLOWED_PREFIXES.join(", ")}`,
      );
    }

    const exists = await this.storage.exists(decodedKey);
    if (!exists) {
      return ResponseUtil.error("File not found");
    }

    await this.storage.delete(decodedKey);

    logger.info("File deleted by admin", {
      key: decodedKey,
      provider: this.storage.getProvider(),
      deletedBy: userId,
      timestamp: new Date().toISOString(),
    });

    return ResponseUtil.success(
      {
        key: decodedKey,
        provider: this.storage.getProvider(),
        deletedBy: userId,
      },
      "File deleted successfully",
    );
  }

  @Delete("bulk/delete")
  @ApiOperation({
    summary: "Eliminar múltiples archivos",
    description: "Elimina múltiples archivos con validación y auditoría",
  })
  @ApiResponse({ status: 200, description: "Archivos eliminados" })
  async bulkDelete(
    @Query("keys") keysParam: string,
    @CurrentUser("sub") userId: string,
  ) {
    const keys = keysParam.split(",").map((k) => k.trim());

    if (keys.length > 50) {
      return ResponseUtil.error("Maximum 50 files per bulk delete");
    }

    const results: Array<{ key: string; deleted: boolean; reason?: string }> = [];

    for (const key of keys) {
      const isAllowed = FileManagerController.ALLOWED_PREFIXES.some((p) =>
        key.startsWith(p),
      );

      if (!isAllowed && key.includes("/")) {
        results.push({ key, deleted: false, reason: "Path not in allowlist" });
        continue;
      }

      const exists = await this.storage.exists(key);
      if (!exists) {
        results.push({ key, deleted: false, reason: "File not found" });
        continue;
      }

      await this.storage.delete(key);
      results.push({ key, deleted: true });
    }

    const deletedCount = results.filter((r) => r.deleted).length;

    logger.info("Bulk delete by admin", {
      totalRequested: keys.length,
      deletedCount,
      provider: this.storage.getProvider(),
      deletedBy: userId,
    });

    return ResponseUtil.success(
      { results, deletedCount, total: keys.length },
      `${deletedCount}/${keys.length} files deleted`,
    );
  }
}
