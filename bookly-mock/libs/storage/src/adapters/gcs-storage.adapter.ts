import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import {
  IStoragePort,
  StorageFileInfo,
  StorageListOptions,
  StorageListResult,
  StorageProvider,
  StorageUploadOptions,
} from "../ports/storage.port";

const logger = createLogger("GCSStorageAdapter");

/**
 * GCS Storage configuration
 * Secrets are NEVER logged — only masked references
 */
export interface GCSStorageConfig {
  bucket: string;
  projectId: string;
  keyFilePath?: string;
  credentials?: {
    client_email: string;
    private_key: string;
  };
}

/**
 * Google Cloud Storage Adapter
 * Uses @google-cloud/storage when available.
 * Credentials injected via config — never hard-coded.
 */
@Injectable()
export class GCSStorageAdapter implements IStoragePort {
  private storage: any;
  private bucketRef: any;
  private readonly bucketName: string;

  constructor(private readonly config: GCSStorageConfig) {
    this.bucketName = config.bucket;
    this.initializeClient();
    logger.info("GCSStorageAdapter initialized", {
      bucket: config.bucket,
      projectId: config.projectId,
      hasCredentials: !!config.credentials || !!config.keyFilePath,
    });
  }

  private initializeClient(): void {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Storage } = require("@google-cloud/storage");
      const opts: any = { projectId: this.config.projectId };
      if (this.config.keyFilePath) {
        opts.keyFilename = this.config.keyFilePath;
      } else if (this.config.credentials) {
        opts.credentials = this.config.credentials;
      }
      this.storage = new Storage(opts);
      this.bucketRef = this.storage.bucket(this.bucketName);
    } catch {
      logger.warn(
        "GCS SDK not installed. GCS operations will fail. Install @google-cloud/storage",
      );
      this.storage = null;
      this.bucketRef = null;
    }
  }

  getProvider(): StorageProvider {
    return "gcs";
  }

  async upload(
    key: string,
    data: Buffer,
    options?: StorageUploadOptions,
  ): Promise<StorageFileInfo> {
    this.ensureClient();
    const file = this.bucketRef.file(key);

    await file.save(data, {
      contentType: options?.contentType,
      metadata: options?.metadata ? { metadata: options.metadata } : undefined,
    });

    logger.info("File uploaded to GCS", { key, bucket: this.bucketName });

    return {
      key,
      size: data.length,
      lastModified: new Date(),
      contentType: options?.contentType,
    };
  }

  async download(key: string): Promise<Buffer> {
    this.ensureClient();
    const file = this.bucketRef.file(key);
    const [contents] = await file.download();
    return contents;
  }

  async delete(key: string): Promise<void> {
    this.ensureClient();
    const file = this.bucketRef.file(key);
    await file.delete();
    logger.info("File deleted from GCS", { key, bucket: this.bucketName });
  }

  async list(options?: StorageListOptions): Promise<StorageListResult> {
    this.ensureClient();

    const [files] = await this.bucketRef.getFiles({
      prefix: options?.prefix,
      maxResults: options?.maxKeys || 100,
      pageToken: options?.continuationToken,
    });

    const fileInfos: StorageFileInfo[] = files.map((file: any) => ({
      key: file.name,
      size: parseInt(file.metadata.size || "0", 10),
      lastModified: new Date(
        file.metadata.updated || file.metadata.timeCreated,
      ),
      contentType: file.metadata.contentType,
      etag: file.metadata.etag,
    }));

    return {
      files: fileInfos,
      total: fileInfos.length,
      isTruncated: false,
    };
  }

  async exists(key: string): Promise<boolean> {
    try {
      this.ensureClient();
      const [exists] = await this.bucketRef.file(key).exists();
      return exists;
    } catch {
      return false;
    }
  }

  async getInfo(key: string): Promise<StorageFileInfo | null> {
    try {
      this.ensureClient();
      const [metadata] = await this.bucketRef.file(key).getMetadata();
      return {
        key,
        size: parseInt(metadata.size || "0", 10),
        lastModified: new Date(metadata.updated || metadata.timeCreated),
        contentType: metadata.contentType,
        etag: metadata.etag,
        metadata: metadata.metadata,
      };
    } catch {
      return null;
    }
  }

  private ensureClient(): void {
    if (!this.storage) {
      throw new Error(
        "GCS client not initialized. Install @google-cloud/storage",
      );
    }
  }
}
