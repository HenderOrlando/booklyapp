/**
 * StoragePort — Hexagonal Architecture Port
 * Defines the contract for file storage operations.
 * Adapters: LocalStorageAdapter, S3StorageAdapter, GCSStorageAdapter
 */
export interface StorageFileInfo {
  key: string;
  size: number;
  lastModified: Date;
  contentType?: string;
  etag?: string;
  metadata?: Record<string, string>;
}

export interface StorageListOptions {
  prefix?: string;
  maxKeys?: number;
  continuationToken?: string;
}

export interface StorageListResult {
  files: StorageFileInfo[];
  total: number;
  continuationToken?: string;
  isTruncated: boolean;
}

export interface StorageUploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
}

export type StorageProvider = "local" | "s3" | "gcs";

export const STORAGE_PORT = "STORAGE_PORT";

export interface IStoragePort {
  /**
   * Upload a file to storage
   */
  upload(
    key: string,
    data: Buffer,
    options?: StorageUploadOptions,
  ): Promise<StorageFileInfo>;

  /**
   * Download a file from storage
   */
  download(key: string): Promise<Buffer>;

  /**
   * Delete a file from storage
   */
  delete(key: string): Promise<void>;

  /**
   * List files in storage
   */
  list(options?: StorageListOptions): Promise<StorageListResult>;

  /**
   * Check if a file exists
   */
  exists(key: string): Promise<boolean>;

  /**
   * Get file info without downloading
   */
  getInfo(key: string): Promise<StorageFileInfo | null>;

  /**
   * Get the provider type
   */
  getProvider(): StorageProvider;
}
