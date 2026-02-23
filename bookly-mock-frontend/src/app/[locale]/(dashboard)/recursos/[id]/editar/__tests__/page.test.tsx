import EditResourcePage from "@/app/[locale]/(dashboard)/recursos/[id]/editar/page";
import { httpClient } from "@/infrastructure/http";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "res_001", locale: "es" }),
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("@/components/organisms/AppHeader", () => ({
  AppHeader: ({ title }: { title: string }) => <div>{title}</div>,
}));

jest.mock("@/components/organisms/AppSidebar", () => ({
  AppSidebar: () => <div>Sidebar</div>,
}));

jest.mock("@/components/templates/MainLayout", () => ({
  MainLayout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/infrastructure/http", () => ({
  httpClient: {
    get: jest.fn(),
    patch: jest.fn(),
  },
  isMockMode: () => true,
}));

const getMock = httpClient.get as jest.Mock;
const patchMock = httpClient.patch as jest.Mock;

const baseResource = {
  id: "res_001",
  code: "AULA-101",
  name: "Aula 101",
  description: "Salón de clase",
  type: "CLASSROOM",
  categoryId: "cat_001",
  capacity: 40,
  location: "Edificio A - Piso 1",
  floor: "1",
  building: "Edificio A",
  attributes: {
    hasProjector: true,
    hasAirConditioning: true,
    hasWhiteboard: true,
    hasComputers: false,
    characteristics: ["char_005"],
    features: ["Sistema de sonido"],
  },
  programIds: [] as string[],
  status: "AVAILABLE",
  isActive: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const programsPayload = {
  items: [
    {
      _id: "prog_001",
      code: "ING-SIST",
      name: "Ingeniería de Sistemas",
      faculty: "Facultad de Ingeniería",
      isActive: true,
    },
    {
      _id: "prog_002",
      code: "ING-ELEC",
      name: "Ingeniería Electrónica",
      faculty: "Facultad de Ingeniería",
      isActive: true,
    },
  ],
};

const categoriesPayload = {
  items: [
    { id: "cat_001", name: "Salones", code: "CLASSROOM", isActive: true },
  ],
};

const characteristicsPayload = {
  items: [
    {
      id: "char_001",
      code: "PROYECTOR",
      name: "Proyector",
      isActive: true,
    },
    {
      id: "char_005",
      code: "SISTEMA_SONIDO",
      name: "Sistema de sonido",
      isActive: true,
    },
    {
      id: "char_006",
      code: "VIDEOCONFERENCIA",
      name: "Videoconferencia",
      isActive: true,
    },
  ],
};

function setupGetMocks(overrides?: {
  programIds?: string[];
  attributes?: Record<string, unknown>;
}) {
  const resource = {
    ...baseResource,
    ...(overrides || {}),
    programIds: overrides?.programIds ?? [],
    attributes: {
      ...baseResource.attributes,
      ...(overrides?.attributes || {}),
    },
  };

  getMock.mockImplementation(async (endpoint: string) => {
    if (endpoint === "resources/res_001") {
      return { success: true, data: resource };
    }

    if (endpoint === "categories") {
      return { success: true, data: categoriesPayload };
    }

    if (endpoint === "programs") {
      return { success: true, data: programsPayload };
    }

    if (endpoint === "resources") {
      return {
        success: true,
        data: {
          items: [
            resource,
            {
              ...baseResource,
              id: "res_002",
              attributes: {
                hasProjector: false,
                hasAirConditioning: true,
                features: ["Mesa modular"],
              },
            },
          ],
        },
      };
    }

    if (endpoint === "resources/characteristics") {
      return {
        success: true,
        data: characteristicsPayload,
      };
    }

    return { success: true, data: null };
  });
}

describe("EditResourcePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupGetMocks();

    patchMock.mockResolvedValue({
      success: true,
      data: {
        id: "res_001",
      },
    });
  });

  it("allows selecting a single program without selecting all and persists only selected ids", async () => {
    const user = userEvent.setup();

    render(<EditResourcePage />);

    await screen.findByTestId("resource-edit-form");

    await user.click(screen.getByRole("tab", { name: /programas/i }));

    const firstProgramCheckbox = await screen.findByTestId(
      "resource-program-checkbox-prog_001",
    );
    const secondProgramCheckbox = await screen.findByTestId(
      "resource-program-checkbox-prog_002",
    );

    expect(firstProgramCheckbox).not.toBeChecked();
    expect(secondProgramCheckbox).not.toBeChecked();

    await user.click(firstProgramCheckbox);

    expect(firstProgramCheckbox).toBeChecked();
    expect(secondProgramCheckbox).not.toBeChecked();

    await user.click(screen.getByTestId("resource-edit-save-btn"));

    await waitFor(() => {
      expect(patchMock).toHaveBeenCalledTimes(1);
    });

    const payload = patchMock.mock.calls[0][1];
    expect(payload.programIds).toEqual(["prog_001"]);
  });

  it("renders action buttons only once at top section", async () => {
    render(<EditResourcePage />);

    await screen.findByTestId("resource-edit-form");

    expect(screen.getAllByTestId("resource-edit-cancel-btn")).toHaveLength(1);
    expect(screen.getAllByTestId("resource-edit-save-btn")).toHaveLength(1);
  });

  it("keeps new characteristic in UI until save and persists it only when saving", async () => {
    const user = userEvent.setup();

    render(<EditResourcePage />);

    await screen.findByTestId("resource-edit-form");

    await user.click(screen.getByRole("tab", { name: /características/i }));

    const searchInput = await screen.findByTestId(
      "resource-characteristics-search-input",
    );

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("resources/characteristics");
    });

    await user.type(searchInput, "Mesa interactiva");

    const createOption = await screen.findByTestId(
      "resource-characteristic-create-option",
    );
    await user.click(createOption);

    expect(
      screen.getByTestId("resource-characteristic-chip-new-mesa-interactiva"),
    ).toBeInTheDocument();
    expect(patchMock).not.toHaveBeenCalled();

    await user.click(screen.getByTestId("resource-edit-save-btn"));

    await waitFor(() => {
      expect(patchMock).toHaveBeenCalledTimes(1);
    });

    const payload = patchMock.mock.calls[0][1];

    expect(payload.attributes.characteristics).toEqual(
      expect.arrayContaining([
        "char_005",
        expect.objectContaining({
          name: "Mesa interactiva",
        }),
      ]),
    );

    expect(payload.attributes.features).toEqual(
      expect.arrayContaining(["Sistema de sonido", "Mesa interactiva"]),
    );
  });
});
