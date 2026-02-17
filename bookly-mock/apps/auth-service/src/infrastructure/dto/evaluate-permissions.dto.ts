import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

/**
 * DTO for permission evaluation request.
 * Used by other microservices to check if a user has specific permissions.
 */
export class EvaluatePermissionsDto {
  @ApiProperty({
    description: "User ID to evaluate permissions for",
    example: "507f1f77bcf86cd799439011",
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: "Resource type being accessed",
    example: "reservation",
  })
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiProperty({
    description: "Action being performed",
    example: "create",
  })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiPropertyOptional({
    description: "Additional context for ABAC evaluation",
    example: { programId: "ING-SIS", departmentId: "dept-001" },
  })
  @IsOptional()
  context?: Record<string, any>;
}

/**
 * Response interface for permission evaluation.
 */
export interface EvaluatePermissionsResponse {
  allowed: boolean;
  userId: string;
  resource: string;
  action: string;
  matchedRoles: string[];
  matchedPermissions: string[];
  policyVersion: string;
}

/**
 * DTO for bulk permission evaluation.
 */
export class BulkEvaluatePermissionsDto {
  @ApiProperty({
    description: "User ID to evaluate permissions for",
    example: "507f1f77bcf86cd799439011",
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: "Array of resource:action pairs to evaluate",
    example: [
      { resource: "reservation", action: "create" },
      { resource: "resource", action: "delete" },
    ],
  })
  @IsArray()
  checks: Array<{ resource: string; action: string }>;
}
