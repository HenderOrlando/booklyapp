import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import {
  IStoragePort,
  StorageFileInfo,
  StorageListOptions,
  StorageListResult,
  StorageProvider,
  StorageUploadOptions,
} from "../ports/storage.port";

const logger = createLogger("LocalStorageAdapter");

/**
 * Local filesystem storage adapter
 * Default fallback when no S3/GCS config is provided
 */
@Injectable()
export class LocalStorageAdapter implements IStoragePort {
  private readonly basePath: string;

  constructor(basePath?: string) {
    this.basePath = basePath || path.join(process.cwd(), "data", "uploads");
    this.ensureDirectory(this.basePath);
    logger.info("LocalStorageAdapter initialized", { basePath: this.basePath });
  }

  getProvider(): StorageProvider {
    return "local";
  }

  async upload(
    key: string,
    data: Buffer,
    options?: StorageUploadOptions,
  ): Promise<StorageFileInfo> {
    const filePath = this.resolvePath(key);
    this.ensureDirectory(path.dirname(filePath));

    fs.writeFileSync(filePath, data);

    if (options?.metadata) {
      const metaPath = `${filePath}.meta.json`;
      fs.writeFileSync(
        metaPath,
        JSON.stringify({
          contentType: options.contentType,
          metadata: options.metadata,
          uploadedAt: new Date().toISOString(),
        }),
      );
    }

    logger.info("File uploaded", { key, size: data.length });

    return this.buildFileInfo(key, filePath);
  }

  async download(key: string): Promise<Buffer> {
    const filePath = this.resolvePath(key);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${key}`);
    }
    return fs.readFileSync(filePath);
  }

  async delete(key: string): Promise<void> {
    const filePath = this.resolvePath(key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info("File deleted", { key });
    }
    const metaPath = `${filePath}.meta.json`;
    if (fs.existsSync(metaPath)) {
      fs.unlinkSync(metaPath);
    }
  }

  async list(options?: StorageListOptions): Promise<StorageListResult> {
    const prefix = options?.prefix || "";
    const maxKeys = options?.maxKeys || 100;
    const searchDir = prefix
      ? path.join(this.basePath, prefix)
      : this.basePath;

    if (!fs.existsSync(searchDir)) {
      return { files: [], total: 0, isTruncated: false };
    }

    const allFiles = this.walkDirectory(searchDir);
    const files = allFiles
      .filter((f) => !f.endsWith(".meta.json"))
      .slice(0, maxKeys)
      .map((filePath) => {
        const key = path.relative(this.basePath, filePath).replace(/\\/g, "/");
        return this.buildFileInfoSync(key, filePath);
      });

    return {
      files,
      total: allFiles.filter((f) => !f.endsWith(".meta.json")).length,
      isTruncated: allFiles.length > maxKeys,
    };
  }

  async exists(key: string): Promise<boolean> {
    return fs.existsSync(this.resolvePath(key));
  }

  async getInfo(key: string): Promise<StorageFileInfo | null> {
    const filePath = this.resolvePath(key);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return this.buildFileInfo(key, filePath);
  }

  private resolvePath(key: string): string {
    const resolved = path.resolve(this.basePath, key);
    if (!resolved.startsWith(path.resolve(this.basePath))) {
      throw new Error("Path traversal detected");
    }
    return resolved;
  }

  private ensureDirectory(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private buildFileInfo(key: string, filePath: string): StorageFileInfo {
    const stat = fs.statSync(filePath);
    return {
      key,
      size: stat.size,
      lastModified: stat.mtime,
      contentType: this.guessContentType(key),
    };
  }

  private buildFileInfoSync(key: string, filePath: string): StorageFileInfo {
    const stat = fs.statSync(filePath);
    return {
      key,
      size: stat.size,
      lastModified: stat.mtime,
      contentType: this.guessContentType(key),
    };
  }

  private walkDirectory(dir: string): string[] {
    const results: string[] = [];
    if (!fs.existsSync(dir)) return results;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...this.walkDirectory(fullPath));
      } else {
        results.push(fullPath);
      }
    }
    return results;
  }

  private guessContentType(key: string): string {
    const ext = path.extname(key).toLowerCase();
    const types: Record<string, string> = {
      ".pdf": "application/pdf",
      ".json": "application/json",
      ".csv": "text/csv",
      ".txt": "text/plain",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xlsx":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
    return types[ext] || "application/octet-stream";
  }
}
