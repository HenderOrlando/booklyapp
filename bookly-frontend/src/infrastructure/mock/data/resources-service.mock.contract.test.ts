import {
  mockAcademicPrograms,
  mockResources,
} from "@/infrastructure/mock/data/resources-service.mock";

describe("Mock resources/programs contract alignment", () => {
  it("uses only existing academic program IDs inside resource.programIds", () => {
    const validProgramIds = new Set(mockAcademicPrograms.map((program) => program.id));

    const invalidReferences = mockResources.flatMap((resource) =>
      resource.programIds
        .filter((programId) => !validProgramIds.has(programId))
        .map((programId) => `${resource.id}:${programId}`),
    );

    expect(invalidReferences).toEqual([]);
  });

  it("does not define duplicated program IDs per resource", () => {
    const resourcesWithDuplicatedProgramIds = mockResources
      .filter(
        (resource) =>
          new Set(resource.programIds).size !== resource.programIds.length,
      )
      .map((resource) => resource.id);

    expect(resourcesWithDuplicatedProgramIds).toEqual([]);
  });
});
