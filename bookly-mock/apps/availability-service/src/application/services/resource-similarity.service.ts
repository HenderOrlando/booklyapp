import { Injectable } from "@nestjs/common";
import { SimilarityWeightsDto } from "../../infrastructure/dtos/reassignment.dto";

/**
 * Interfaz para recurso en scoring
 */
export interface ResourceForScoring {
  id: string;
  name: string;
  type: string;
  capacity?: number;
  features?: string[];
  location?: string;
  building?: string;
  floor?: number;
  [key: string]: any;
}

/**
 * Resultado del cálculo de similitud
 */
export interface SimilarityResult {
  resourceId: string;
  similarityScore: number;
  scoreBreakdown: {
    capacity: number;
    features: number;
    location: number;
    availability: number;
  };
}

/**
 * Servicio de cálculo de similitud entre recursos
 * Implementa algoritmo multi-criterio para scoring
 */
@Injectable()
export class ResourceSimilarityService {
  /**
   * Calcula la similitud entre un recurso original y candidatos alternativos
   */
  calculateSimilarity(
    originalResource: ResourceForScoring,
    candidateResources: ResourceForScoring[],
    weights: SimilarityWeightsDto = new SimilarityWeightsDto(),
    availabilityMap: Map<string, boolean> = new Map()
  ): SimilarityResult[] {
    return candidateResources
      .map((candidate) => {
        const capacityScore = this.calculateCapacityScore(
          originalResource,
          candidate
        );
        const featuresScore = this.calculateFeaturesScore(
          originalResource,
          candidate
        );
        const locationScore = this.calculateLocationScore(
          originalResource,
          candidate
        );
        const availabilityScore = availabilityMap.get(candidate.id) ? 100 : 0;

        // Calcular score total ponderado
        const totalScore =
          capacityScore * (weights.capacity || 0.3) +
          featuresScore * (weights.features || 0.35) +
          locationScore * (weights.location || 0.2) +
          availabilityScore * (weights.availability || 0.15);

        return {
          resourceId: candidate.id,
          similarityScore: Math.round(totalScore * 100) / 100,
          scoreBreakdown: {
            capacity: Math.round(capacityScore * 100) / 100,
            features: Math.round(featuresScore * 100) / 100,
            location: Math.round(locationScore * 100) / 100,
            availability: Math.round(availabilityScore * 100) / 100,
          },
        };
      })
      .sort((a, b) => b.similarityScore - a.similarityScore);
  }

  /**
   * Calcula score de similitud de capacidad (0-100)
   * Usa diferencia relativa con penalización mayor si es menor
   */
  private calculateCapacityScore(
    original: ResourceForScoring,
    candidate: ResourceForScoring
  ): number {
    if (!original.capacity || !candidate.capacity) {
      return 50; // Score neutral si no hay datos
    }

    const originalCap = original.capacity;
    const candidateCap = candidate.capacity;

    // Si el candidato tiene exactamente la misma capacidad: 100
    if (originalCap === candidateCap) {
      return 100;
    }

    // Si el candidato tiene más capacidad (mejor): score alto
    if (candidateCap > originalCap) {
      const ratio = originalCap / candidateCap;
      return Math.max(85, ratio * 100);
    }

    // Si el candidato tiene menos capacidad (peor): penalización mayor
    const ratio = candidateCap / originalCap;
    return ratio * 75; // Penalización del 25%
  }

  /**
   * Calcula score de similitud de características (0-100)
   * Usa Jaccard similarity coefficient
   */
  private calculateFeaturesScore(
    original: ResourceForScoring,
    candidate: ResourceForScoring
  ): number {
    const originalFeatures = new Set(original.features || []);
    const candidateFeatures = new Set(candidate.features || []);

    if (originalFeatures.size === 0 && candidateFeatures.size === 0) {
      return 100; // Ambos sin características: score perfecto
    }

    if (originalFeatures.size === 0 || candidateFeatures.size === 0) {
      return 0; // Uno tiene características y el otro no
    }

    // Calcular intersección y unión
    const intersection = new Set(
      [...originalFeatures].filter((x) => candidateFeatures.has(x))
    );
    const union = new Set([...originalFeatures, ...candidateFeatures]);

    // Jaccard similarity: |A ∩ B| / |A ∪ B|
    const jaccardScore = (intersection.size / union.size) * 100;

    // Bonus si el candidato tiene TODAS las características del original
    const hasAllOriginalFeatures = [...originalFeatures].every((f) =>
      candidateFeatures.has(f)
    );
    const bonus = hasAllOriginalFeatures ? 10 : 0;

    return Math.min(100, jaccardScore + bonus);
  }

  /**
   * Calcula score de similitud de ubicación (0-100)
   * Considera edificio, piso y proximidad
   */
  private calculateLocationScore(
    original: ResourceForScoring,
    candidate: ResourceForScoring
  ): number {
    let score = 0;

    // Mismo edificio: +60 puntos
    if (original.building && candidate.building) {
      if (original.building === candidate.building) {
        score += 60;

        // Mismo piso: +40 puntos adicionales (100 total)
        if (
          original.floor !== undefined &&
          candidate.floor !== undefined &&
          original.floor === candidate.floor
        ) {
          score += 40;
        } else if (
          original.floor !== undefined &&
          candidate.floor !== undefined
        ) {
          // Diferente piso pero mismo edificio: bonus por proximidad
          const floorDiff = Math.abs(original.floor - candidate.floor);
          score += Math.max(0, 40 - floorDiff * 10); // -10 puntos por cada piso de diferencia
        }
      }
    }

    // Si no hay datos de ubicación estructurados, usar ubicación textual
    if (score === 0 && original.location && candidate.location) {
      // Comparación simple de strings (puede mejorarse con distancia de Levenshtein)
      const similarity = this.calculateStringSimilarity(
        original.location,
        candidate.location
      );
      score = similarity * 100;
    }

    return Math.min(100, score);
  }

  /**
   * Calcula similitud entre dos strings (simple)
   * Retorna valor entre 0 y 1
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1;
    if (!str1 || !str2) return 0;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calcula distancia de Levenshtein entre dos strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Filtra recursos por score mínimo
   */
  filterByMinimumScore(
    results: SimilarityResult[],
    minimumScore: number = 60
  ): SimilarityResult[] {
    return results.filter((r) => r.similarityScore >= minimumScore);
  }

  /**
   * Obtiene los N mejores resultados
   */
  getTopN(results: SimilarityResult[], n: number = 5): SimilarityResult[] {
    return results.slice(0, n);
  }
}
