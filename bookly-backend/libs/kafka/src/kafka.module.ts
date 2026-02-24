import { DynamicModule, Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { KafkaService } from "./kafka.service";

export interface KafkaModuleOptions {
  clientId?: string;
  brokers?: string[];
  groupId?: string;
}

@Global()
@Module({})
export class KafkaModule {
  static forRoot(options?: KafkaModuleOptions): DynamicModule {
    return {
      module: KafkaModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: "KAFKA_OPTIONS",
          useValue: options || {},
        },
        KafkaService,
      ],
      exports: [KafkaService],
    };
  }
}
