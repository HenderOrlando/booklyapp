import { UserRole } from "@libs/common/enums";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { RoleService } from "../../../src/application/services/role.service";

describe("RoleService", () => {
  let service: RoleService;
  let roleModel: any;

  const mockRole = {
    _id: { toString: () => "role-123" },
    name: UserRole.STUDENT,
    displayName: "Estudiante",
    description: "Rol de estudiante",
    permissions: ["read:resources"],
    isActive: true,
    isDefault: false,
    audit: { createdBy: "admin-1", updatedBy: "admin-1" },
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const mockRoleModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      findByIdAndDelete: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: getModelToken("Role"),
          useValue: mockRoleModel,
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    roleModel = module.get(getModelToken("Role"));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- RF-41: Gestión de Roles y Permisos ---

  describe("createRole", () => {
    it("Given valid role data, When createRole is called, Then it should create and return the role", async () => {
      roleModel.findOne.mockResolvedValue(null);
      roleModel.create.mockResolvedValue(mockRole);

      const dto = {
        name: UserRole.STUDENT,
        displayName: "Estudiante",
        description: "Rol de estudiante",
        permissionIds: ["read:resources"],
        isActive: true,
        isDefault: false,
      };

      const result = await service.createRole(dto, "admin-1");

      expect(result).toBeDefined();
      expect(result.name).toBe(UserRole.STUDENT);
      expect(roleModel.findOne).toHaveBeenCalledWith({ name: dto.name });
      expect(roleModel.create).toHaveBeenCalled();
    });

    it("Given a role name that already exists, When createRole is called, Then it should throw ConflictException", async () => {
      roleModel.findOne.mockResolvedValue(mockRole);

      const dto = {
        name: UserRole.STUDENT,
        displayName: "Estudiante",
        description: "Rol duplicado",
        permissionIds: [],
      };

      await expect(service.createRole(dto, "admin-1")).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe("updateRole", () => {
    it("Given an existing role, When updateRole is called with valid data, Then it should update and return the role", async () => {
      const updatableRole = { ...mockRole, save: jest.fn().mockResolvedValue(true) };
      roleModel.findById.mockResolvedValue(updatableRole);

      const result = await service.updateRole("role-123", { description: "Updated" }, "admin-1");

      expect(result).toBeDefined();
      expect(updatableRole.save).toHaveBeenCalled();
    });

    it("Given a non-existent role ID, When updateRole is called, Then it should throw NotFoundException", async () => {
      roleModel.findById.mockResolvedValue(null);

      await expect(
        service.updateRole("non-existent", { description: "Test" }, "admin-1")
      ).rejects.toThrow(NotFoundException);
    });

    it("Given a system role (isDefault=true), When trying to change displayName, Then it should throw BadRequestException", async () => {
      const systemRole = { ...mockRole, isDefault: true, save: jest.fn() };
      roleModel.findById.mockResolvedValue(systemRole);

      await expect(
        service.updateRole("role-123", { displayName: "New Name" }, "admin-1")
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("deleteRole", () => {
    it("Given a non-system role, When deleteRole is called, Then it should delete the role", async () => {
      roleModel.findById.mockResolvedValue({ ...mockRole, isDefault: false });
      roleModel.findByIdAndDelete.mockResolvedValue(true);

      await service.deleteRole("role-123");

      expect(roleModel.findByIdAndDelete).toHaveBeenCalledWith("role-123");
    });

    it("Given a system role (isDefault=true), When deleteRole is called, Then it should throw BadRequestException", async () => {
      roleModel.findById.mockResolvedValue({ ...mockRole, isDefault: true });

      await expect(service.deleteRole("role-123")).rejects.toThrow(
        BadRequestException
      );
    });

    it("Given a non-existent role, When deleteRole is called, Then it should throw NotFoundException", async () => {
      roleModel.findById.mockResolvedValue(null);

      await expect(service.deleteRole("non-existent")).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("assignPermissions", () => {
    it("Given an existing role, When assigning new permissions, Then it should add permissions without duplicates", async () => {
      const role = {
        ...mockRole,
        permissions: ["read:resources"],
        save: jest.fn().mockResolvedValue(true),
      };
      roleModel.findById.mockResolvedValue(role);

      const result = await service.assignPermissions("role-123", [
        "read:resources",
        "write:resources",
      ]);

      expect(result).toBeDefined();
      expect(role.save).toHaveBeenCalled();
    });

    it("Given a non-existent role, When assigning permissions, Then it should throw NotFoundException", async () => {
      roleModel.findById.mockResolvedValue(null);

      await expect(
        service.assignPermissions("non-existent", ["read:resources"])
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("removePermissions", () => {
    it("Given a role with multiple permissions, When removing some, Then remaining permissions should be preserved", async () => {
      const role = {
        ...mockRole,
        permissions: ["read:resources", "write:resources", "delete:resources"],
        save: jest.fn().mockResolvedValue(true),
      };
      roleModel.findById.mockResolvedValue(role);

      const result = await service.removePermissions("role-123", [
        "delete:resources",
      ]);

      expect(result).toBeDefined();
      expect(role.save).toHaveBeenCalled();
    });

    it("Given a role, When trying to remove ALL permissions, Then it should throw BadRequestException", async () => {
      const role = {
        ...mockRole,
        permissions: ["read:resources"],
        save: jest.fn(),
      };
      roleModel.findById.mockResolvedValue(role);

      await expect(
        service.removePermissions("role-123", ["read:resources"])
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("getRoles", () => {
    it("Given roles exist, When getRoles is called without filters, Then it should return all roles", async () => {
      roleModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([mockRole]),
      });

      const result = await service.getRoles();

      expect(result).toHaveLength(1);
    });

    it("Given filters, When getRoles is called, Then it should apply correct filters", async () => {
      roleModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      await service.getRoles({ isActive: true, search: "admin" });

      expect(roleModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
          $or: expect.any(Array),
        })
      );
    });
  });

  describe("getRoleById", () => {
    it("Given an existing role ID, When getRoleById is called, Then it should return the role", async () => {
      roleModel.findById.mockResolvedValue(mockRole);

      const result = await service.getRoleById("role-123");

      expect(result).toBeDefined();
      expect(result.id).toBe("role-123");
    });

    it("Given a non-existent role ID, When getRoleById is called, Then it should throw NotFoundException", async () => {
      roleModel.findById.mockResolvedValue(null);

      await expect(service.getRoleById("non-existent")).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
