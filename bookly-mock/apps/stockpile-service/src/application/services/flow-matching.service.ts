import { Injectable, Logger } from "@nestjs/common";
import { ApprovalFlowEntity } from "@stockpile/domain/entities/approval-flow.entity";
import { ApprovalFlowService } from "@stockpile/application/services/approval-flow.service";

/**
 * Interfaz para los datos de la solicitud de aprobación
 */
export interface ApprovalRequestData {
  resourceId: string;
  resourceType: string;
  resourceCapacity?: number;
  userId: string;
  userRole?: string;
  startDate: Date;
  endDate: Date;
  duration?: number; // en minutos
  metadata?: Record<string, any>;
}

/**
 * Interfaz para las condiciones de matching
 */
export interface FlowConditions {
  resourceType?: string | string[];
  minCapacity?: number;
  maxCapacity?: number;
  minDuration?: number; // en minutos
  maxDuration?: number;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek?: number[]; // 0-6 (domingo-sábado)
  userRole?: string | string[];
  customConditions?: Record<string, any>;
}

/**
 * Resultado del matching de flujo
 */
export interface FlowMatchResult {
  flow: ApprovalFlowEntity;
  matchScore: number;
  matchedConditions: string[];
  appliedRules: string[];
}

/**
 * Servicio para selección automática de flujos de aprobación
 * basado en condiciones y reglas de negocio
 * 
 * @implements RF-24: Flujos de Aprobación Diferenciados
 */
@Injectable()
export class FlowMatchingService {
  private readonly logger = new Logger(FlowMatchingService.name);

  constructor(
    private readonly approvalFlowService: ApprovalFlowService,
  ) {
    this.logger.log('FlowMatchingService initialized');
  }

  /**
   * Encuentra el flujo de aprobación más apropiado para una solicitud
   * 
   * @param requestData - Datos de la solicitud
   * @returns Flujo de aprobación seleccionado o null si no hay match
   */
  async matchFlow(
    requestData: ApprovalRequestData,
  ): Promise<ApprovalFlowEntity | null> {
    this.logger.debug(`Matching flow for request: ${JSON.stringify(requestData)}`);

    // Obtener todos los flujos activos
    const activeFlows = await this.approvalFlowService.getActiveFlows();

    if (!activeFlows || activeFlows.length === 0) {
      this.logger.warn('No active approval flows found');
      return null;
    }

    // Evaluar cada flujo y calcular score
    const matchResults: FlowMatchResult[] = [];

    for (const flow of activeFlows) {
      const matchResult = await this.evaluateFlow(flow, requestData);
      
      if (matchResult && matchResult.matchScore > 0) {
        matchResults.push(matchResult);
      }
    }

    // Si no hay matches, retornar null
    if (matchResults.length === 0) {
      this.logger.warn('No matching flows found for request');
      return null;
    }

    // Seleccionar el flujo con mayor score
    const bestMatch = this.selectBestFlow(matchResults);

    this.logger.log(
      `Selected flow: ${bestMatch.flow.name} (score: ${bestMatch.matchScore})`,
    );

    return bestMatch.flow;
  }

  /**
   * Evalúa si un flujo coincide con una solicitud
   * 
   * @param flow - Flujo de aprobación
   * @param requestData - Datos de la solicitud
   * @returns Resultado del matching con score
   */
  async evaluateFlow(
    flow: ApprovalFlowEntity,
    requestData: ApprovalRequestData,
  ): Promise<FlowMatchResult | null> {
    const matchedConditions: string[] = [];
    let matchScore = 0;

    // Evaluar tipo de recurso usando resourceTypes del flujo (peso: 30 puntos)
    if (flow.resourceTypes && flow.resourceTypes.length > 0) {
      if (flow.resourceTypes.includes(requestData.resourceType)) {
        matchScore += 30;
        matchedConditions.push('resourceType');
      } else {
        // Si no coincide el tipo de recurso, este flujo no aplica
        return null;
      }
    }

    // Obtener condiciones desde autoApproveConditions si existen
    const conditions = (flow.autoApproveConditions || {}) as FlowConditions;

    // Evaluar capacidad (peso: 20 puntos)
    if (requestData.resourceCapacity && conditions) {
      if (conditions.minCapacity && requestData.resourceCapacity >= conditions.minCapacity) {
        matchScore += 10;
        matchedConditions.push('minCapacity');
      }

      if (conditions.maxCapacity && requestData.resourceCapacity <= conditions.maxCapacity) {
        matchScore += 10;
        matchedConditions.push('maxCapacity');
      }
    }

    // Evaluar duración (peso: 20 puntos)
    const durationMinutes = requestData.duration || this.calculateDuration(requestData.startDate, requestData.endDate);

    if (conditions.minDuration && durationMinutes >= conditions.minDuration) {
      matchScore += 10;
      matchedConditions.push('minDuration');
    }

    if (conditions.maxDuration && durationMinutes <= conditions.maxDuration) {
      matchScore += 10;
      matchedConditions.push('maxDuration');
    }

    // Evaluar hora del día (peso: 10 puntos)
    if (conditions.timeOfDay) {
      const timeOfDay = this.getTimeOfDay(requestData.startDate);
      if (timeOfDay === conditions.timeOfDay) {
        matchScore += 10;
        matchedConditions.push('timeOfDay');
      }
    }

    // Evaluar día de la semana (peso: 10 puntos)
    if (conditions.dayOfWeek && conditions.dayOfWeek.length > 0) {
      const dayOfWeek = requestData.startDate.getDay();
      if (conditions.dayOfWeek.includes(dayOfWeek)) {
        matchScore += 10;
        matchedConditions.push('dayOfWeek');
      }
    }

    // Evaluar rol de usuario (peso: 10 puntos)
    if (conditions.userRole && requestData.userRole) {
      const userRoles = Array.isArray(conditions.userRole)
        ? conditions.userRole
        : [conditions.userRole];

      if (userRoles.includes(requestData.userRole)) {
        matchScore += 10;
        matchedConditions.push('userRole');
      }
    }

    // Evaluar condiciones personalizadas (peso: variable)
    if (conditions.customConditions) {
      const customScore = this.evaluateCustomConditions(
        conditions.customConditions,
        requestData,
      );
      matchScore += customScore;
      if (customScore > 0) {
        matchedConditions.push('customConditions');
      }
    }

    // Aplicar reglas de negocio
    const appliedRules = this.applyFlowRules(flow, requestData);

    return {
      flow,
      matchScore,
      matchedConditions,
      appliedRules,
    };
  }

  /**
   * Evalúa condiciones personalizadas
   */
  private evaluateCustomConditions(
    customConditions: Record<string, any>,
    requestData: ApprovalRequestData,
  ): number {
    let score = 0;

    // Ejemplo: evaluar si es evento institucional
    if (customConditions.isInstitutionalEvent && requestData.metadata?.isInstitutionalEvent) {
      score += 15;
    }

    // Ejemplo: evaluar si requiere equipamiento especial
    if (customConditions.requiresSpecialEquipment && requestData.metadata?.requiresSpecialEquipment) {
      score += 10;
    }

    // Ejemplo: evaluar si es evento externo
    if (customConditions.isExternalEvent && requestData.metadata?.isExternalEvent) {
      score += 5;
    }

    return score;
  }

  /**
   * Selecciona el mejor flujo de los resultados de matching
   */
  private selectBestFlow(matchResults: FlowMatchResult[]): FlowMatchResult {
    // Ordenar por score descendente
    matchResults.sort((a, b) => b.matchScore - a.matchScore);

    // Si hay empate en score, usar prioridad del flujo
    const topScore = matchResults[0].matchScore;
    const topMatches = matchResults.filter(m => m.matchScore === topScore);

    if (topMatches.length === 1) {
      return topMatches[0];
    }

    // Desempatar por prioridad (si existe en metadata)
    const withPriority = topMatches.sort((a, b) => {
      const priorityA = (a.flow?.metadata as any)?.priority || 0;
      const priorityB = (b.flow?.metadata as any)?.priority || 0;
      return priorityB - priorityA;
    });

    return withPriority[0];
  }

  /**
   * Aplica reglas de negocio específicas al flujo
   */
  private applyFlowRules(
    flow: ApprovalFlowEntity,
    requestData: ApprovalRequestData,
  ): string[] {
    const appliedRules: string[] = [];

    // Regla: Bypass para usuarios privilegiados
    if (requestData.userRole === 'ADMIN' || requestData.userRole === 'SUPER_ADMIN') {
      appliedRules.push('ADMIN_BYPASS');
    }

    // Regla: Aprobación automática para reservas cortas
    const durationMinutes = requestData.duration || this.calculateDuration(requestData.startDate, requestData.endDate);
    if (durationMinutes <= 60 && flow.metadata?.allowAutoApprovalShort) {
      appliedRules.push('AUTO_APPROVE_SHORT');
    }

    // Regla: Escalamiento automático para reservas largas
    if (durationMinutes > 240) {
      appliedRules.push('ESCALATE_LONG_DURATION');
    }

    // Regla: Aprobación múltiple para alta capacidad
    if (requestData.resourceCapacity && requestData.resourceCapacity > 200) {
      appliedRules.push('REQUIRE_MULTIPLE_APPROVALS');
    }

    return appliedRules;
  }

  /**
   * Calcula la duración en minutos entre dos fechas
   */
  private calculateDuration(startDate: Date, endDate: Date): number {
    const diffMs = endDate.getTime() - startDate.getTime();
    return Math.floor(diffMs / (1000 * 60));
  }

  /**
   * Determina la hora del día
   */
  private getTimeOfDay(date: Date): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = date.getHours();

    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  /**
   * Verifica si una solicitud cumple con todas las condiciones de un flujo
   * (método auxiliar para validaciones estrictas)
   */
  async evaluateConditions(
    flow: ApprovalFlowEntity,
    requestData: ApprovalRequestData,
  ): Promise<boolean> {
    const result = await this.evaluateFlow(flow, requestData);
    
    // Considerar que cumple si tiene al menos 50 puntos de score
    return result !== null && result.matchScore >= 50;
  }

  /**
   * Obtiene todos los flujos que coinciden con una solicitud
   * (útil para análisis o debugging)
   */
  async getAllMatchingFlows(
    requestData: ApprovalRequestData,
  ): Promise<FlowMatchResult[]> {
    const activeFlows = await this.approvalFlowService.getActiveFlows();
    const matchResults: FlowMatchResult[] = [];

    for (const flow of activeFlows) {
      const matchResult = await this.evaluateFlow(flow, requestData);
      
      if (matchResult && matchResult.matchScore > 0) {
        matchResults.push(matchResult);
      }
    }

    // Ordenar por score descendente
    return matchResults.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Obtiene estadísticas de matching para un flujo específico
   */
  async getFlowMatchingStats(flowId: string): Promise<{
    flowId: string;
    flowName: string;
    totalMatches: number;
    avgMatchScore: number;
    topMatchedConditions: string[];
  }> {
    // Este método podría implementarse con datos históricos
    // Por ahora retorna estructura básica
    const flow = await this.approvalFlowService.getFlowById(flowId);
    
    return {
      flowId,
      flowName: flow?.name || 'Unknown',
      totalMatches: 0,
      avgMatchScore: 0,
      topMatchedConditions: [],
    };
  }
}
