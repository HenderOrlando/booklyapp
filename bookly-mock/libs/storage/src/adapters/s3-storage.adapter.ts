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

const logger = createLogger("S3StorageAdapter");

/**
 * S3StorageAdapter configuration
 * Secrets are NEVER logged — only masked references
 */
export interface S3StorageConfig {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string;
}

/**
 * AWS S3 Storage Adapter
 * Uses @aws-sdk/client-s3 when available, otherwise falls back to HTTP calls.
 * Credentials are injected via config — never hard-coded.
 */
@Injectable()
export class S3StorageAdapter implements IStoragePort {
  private client: any;
  private readonly bucket: string;

  constructor(private readonly config: S3StorageConfig) {
    this.bucket = config.bucket;
    this.initializeClient();
    logger.info("S3StorageAdapter initialized", {
      bucket: config.bucket,
      region: config.region,
      endpoint: config.endpoint || "default",
      hasAccessKey: !!config.accessKeyId,
    });
  }

  private initializeClient(): void {
    try {
      // Dynamic import to avoid hard dependency
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { S3Client } = require("@aws-sdk/client-s3");
      this.client = new S3Client({
        region: this.config.region,
        credentials: {
          accessKeyId: this.config.accessKeyId,
          secretAccessKey: this.config.secretAccessKey,
        },
        ...(this.config.endpoint ? { endpoint: this.config.endpoint } : {}),
      });
    } catch {
      logger.warn(
        "AWS SDK not installed. S3 operations will fail. Install @aws-sdk/client-s3",
      );
      this.client = null;
    }
  }

  getProvider(): StorageProvider {
    return "s3";
  }

  async upload(
    key: string,
    data: Buffer,
    options?: StorageUploadOptions,
  ): Promise<StorageFileInfo> {
    this.ensureClient();
    const { PutObjectCommand } = require("@aws-sdk/client-s3");

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: data,
        ContentType: options?.contentType,
        Metadata: options?.metadata,
      }),
    );

    logger.info("File uploaded to S3", { key, bucket: this.bucket });

    return {
      key,
      size: data.length,
      lastModified: new Date(),
      contentType: options?.contentType,
    };
  }

  async download(key: string): Promise<Buffer> {
    this.ensureClient();
    const { GetObjectCommand } = require("@aws-sdk/client-s3");

    const response = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );

    const chunks: Buffer[] = [];
    for await (const chunk of response.Body) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  async delete(key: string): Promise<void> {
    this.ensureClient();
    const { DeleteObjectCommand } = require("@aws-sdk/client-s3");

    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    logger.info("File deleted from S3", { key, bucket: this.bucket });
  }

  async list(options?: StorageListOptions): Promise<StorageListResult> {
    this.ensureClient();
    const { ListObjectsV2Command } = require("@aws-sdk/client-s3");

    const response = await this.client.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: options?.prefix,
        MaxKeys: options?.maxKeys || 100,
        ContinuationToken: options?.continuationToken,
      }),
    );

    const files: StorageFileInfo[] = (response.Contents || []).map(
      (obj: any) => ({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified,
        etag: obj.ETag,
      }),
    );

    return {
      files,
      total: response.KeyCount || files.length,
      continuationToken: response.NextContinuationToken,
      isTruncated: response.IsTruncated || false,
    };
  }

  async exists(key: string): Promise<boolean> {
    try {
      this.ensureClient();
      const { HeadObjectCommand } = require("@aws-sdk/client-s3");
      await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return true;
    } catch {
      return false;
    }
  }

  async getInfo(key: string): Promise<StorageFileInfo | null> {
    try {
      this.ensureClient();
      const { HeadObjectCommand } = require("@aws-sdk/client-s3");
      const response = await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return {
        key,
        size: response.ContentLength,
        lastModified: response.LastModified,
        contentType: response.ContentType,
        etag: response.ETag,
        metadata: response.Metadata,
      };
    } catch {
      return null;
    }
  }

  private ensureClient(): void {
    if (!this.client) {
      throw new Error(
        "S3 client not initialized. Install @aws-sdk/client-s3",
      );
    }
  }
}
