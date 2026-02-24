/**
 * Query para generar template CSV dinámico
 */
export class GenerateImportTemplateQuery {
  constructor(
    public readonly includeExamples: boolean = true,
    public readonly categoryCode?: string
  ) {}
}
