import { Logger } from "@libs/common";
import { RedisService } from "@libs/redis";
import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import {
  CausalTree,
  CorrelationMetadata,
  EventChainNode,
} from "../interfaces/idempotency.interface";

/**
 * Service for managing correlation IDs and event chains
 * Enables distributed tracing across microservices
 */
@Injectable()
export class CorrelationService {
  private readonly chainKeyPrefix = "correlation:";
  private readonly metadataKeyPrefix = "correlation:meta:";
  private readonly defaultTtl = 604800; // 7 days
  private readonly logger = new Logger("CorrelationService");

  constructor(private readonly redis: RedisService) {}

  /**
   * Generate a new correlation ID
   */
  generateCorrelationId(prefix: string = "corr"): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Generate a new message ID
   */
  generateMessageId(): string {
    return `msg-${uuidv4()}`;
  }

  /**
   * Record an event in the correlation chain
   */
  async recordEventChain(
    correlationId: string,
    messageId: string,
    causationId: string | null,
    eventType: string,
    service: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const chainKey = this.buildChainKey(correlationId);

      const node: EventChainNode = {
        messageId,
        causationId,
        eventType,
        service,
        timestamp: new Date(),
        metadata,
      };

      const client = this.redis.getClient();
      await client.rPush(chainKey, JSON.stringify(node));
      await this.redis.expire(chainKey, this.defaultTtl);

      this.logger.debug("Event recorded in chain", {
        correlationId,
        messageId,
        causationId,
        eventType,
        service,
      });
    } catch (error) {
      this.logger.error("Error recording event chain", error, {
        correlationId,
        messageId,
      });
      // Don't throw - this is observability, not critical path
    }
  }

  /**
   * Get the full event chain for a correlation ID
   */
  async getEventChain(correlationId: string): Promise<EventChainNode[]> {
    try {
      const chainKey = this.buildChainKey(correlationId);
      const client = this.redis.getClient();
      const chain = await client.lRange(chainKey, 0, -1);

      return chain.map((item) => {
        const parsed = JSON.parse(item);
        // Convert timestamp string back to Date
        parsed.timestamp = new Date(parsed.timestamp);
        return parsed as EventChainNode;
      });
    } catch (error) {
      this.logger.error("Error getting event chain", error, { correlationId });
      return [];
    }
  }

  /**
   * Build a causal tree from the event chain
   * Shows parent-child relationships based on causationId
   */
  async buildCausalTree(correlationId: string): Promise<CausalTree> {
    try {
      const chain = await this.getEventChain(correlationId);
      const tree: CausalTree = {};
      const nodes = new Map<string, any>();

      // First pass: Create all nodes
      chain.forEach((event) => {
        nodes.set(event.messageId, {
          messageId: event.messageId,
          causationId: event.causationId,
          eventType: event.eventType,
          service: event.service,
          timestamp: event.timestamp,
          children: {},
        });
      });

      // Second pass: Build tree structure
      chain.forEach((event) => {
        const node = nodes.get(event.messageId);

        if (event.causationId) {
          const parent = nodes.get(event.causationId);
          if (parent) {
            parent.children[event.messageId] = node;
          } else {
            // Orphan node (parent not in this chain)
            tree[event.messageId] = node;
          }
        } else {
          // Root event (no causation)
          tree[event.messageId] = node;
        }
      });

      this.logger.debug("Causal tree built", {
        correlationId,
        totalEvents: chain.length,
        rootEvents: Object.keys(tree).length,
      });

      return tree;
    } catch (error) {
      this.logger.error("Error building causal tree", error, { correlationId });
      return {};
    }
  }

  /**
   * Store metadata about a correlation
   */
  async addMetadata(
    correlationId: string,
    metadata: Partial<CorrelationMetadata>
  ): Promise<void> {
    try {
      const key = this.buildMetadataKey(correlationId);
      const existingStr = await this.redis.get(key);

      let existing: Partial<CorrelationMetadata> = {};
      if (existingStr) {
        existing = JSON.parse(existingStr);
      }

      const updated: CorrelationMetadata = {
        correlationId,
        startTime: existing.startTime || new Date(),
        service: metadata.service || existing.service || "unknown",
        endpoint: metadata.endpoint || existing.endpoint,
        userId: metadata.userId || existing.userId,
        metadata: {
          ...existing.metadata,
          ...metadata.metadata,
        },
      };

      await this.redis.setString(key, JSON.stringify(updated), this.defaultTtl);

      this.logger.debug("Correlation metadata updated", {
        correlationId,
        service: updated.service,
      });
    } catch (error) {
      this.logger.error("Error adding correlation metadata", error, {
        correlationId,
      });
    }
  }

  /**
   * Get metadata about a correlation
   */
  async getMetadata(
    correlationId: string
  ): Promise<CorrelationMetadata | null> {
    try {
      const key = this.buildMetadataKey(correlationId);
      const metadataStr = await this.redis.get(key);

      if (!metadataStr) {
        return null;
      }

      const metadata = JSON.parse(metadataStr);
      metadata.startTime = new Date(metadata.startTime);
      return metadata as CorrelationMetadata;
    } catch (error) {
      this.logger.error("Error getting correlation metadata", error, {
        correlationId,
      });
      return null;
    }
  }

  /**
   * Get statistics about a correlation chain
   */
  async getChainStats(correlationId: string): Promise<{
    totalEvents: number;
    services: string[];
    duration: number;
    eventTypes: Record<string, number>;
  }> {
    try {
      const chain = await this.getEventChain(correlationId);
      const metadata = await this.getMetadata(correlationId);

      const services = [...new Set(chain.map((e) => e.service))];
      const eventTypes = chain.reduce(
        (acc, event) => {
          acc[event.eventType] = (acc[event.eventType] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const duration = metadata ? Date.now() - metadata.startTime.getTime() : 0;

      return {
        totalEvents: chain.length,
        services,
        duration,
        eventTypes,
      };
    } catch (error) {
      this.logger.error("Error getting chain stats", error, { correlationId });
      return {
        totalEvents: 0,
        services: [],
        duration: 0,
        eventTypes: {},
      };
    }
  }

  /**
   * Build Redis key for event chain
   */
  private buildChainKey(correlationId: string): string {
    return `${this.chainKeyPrefix}${correlationId}:chain`;
  }

  /**
   * Build Redis key for correlation metadata
   */
  private buildMetadataKey(correlationId: string): string {
    return `${this.metadataKeyPrefix}${correlationId}`;
  }
}
