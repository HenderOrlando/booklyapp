import {
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { PermissionService } from "../../../src/application/services/permission.service";
import { RoleService } from "../../../src/application/services/role.service";

describe("PermissionService", () => {
  let service: PermissionService;
  let permissionModel: any;
  let roleService: jest.Mocked<RoleService>;

  const mockPermission = {
    _id: { toString: () => "perm-123" },
    code: "resources:read",
    name: "Read Resources",
    description: "Allows reading resources",
    resource: "resources",
    action: "read",
    isActive: true,
    audit: { createdBy: "admin-1", updatedBy: "admin-1" },
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: getModelToken("Permission"),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            findByIdAndDelete: jest.fn(),
            find: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
        {
          provide: getModelToken("User"),
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: getModelToken("Role"),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: RoleService,
          useValue: {
            getRolesWithPermission: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
    permissionModel = module.get(getModelToken("Permission"));
    roleService = module.get(RoleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- RF-41: Gestión de Roles y Permisos (Permission CRUD) ---

  describe("createPermission", () => {
    it("Given valid permission data, When createPermission is called, Then it should create and return the permission", async () => {
      permissionModel.findOne.mockResolvedValue(null);
      permissionModel.create.mockResolvedValue(mockPermission);

      const dto = {
        code: "resources:read",
        name: "Read Resources",
        description: "Allows reading resources",
        resource: "resources",
        action: "read",
      };

      const result = await service.createPermission(dto, "admin-1");

      expect(result).toBeDefined();
      expect(result.code).toBe("resources:read");
      expect(permissionModel.create).toHaveBeenCalled();
    });

    it("Given a duplicate code, When createPermission is called, Then it should throw ConflictException", async () => {
      permissionModel.findOne.mockResolvedValue(mockPermission);

      const dto = {
        code: "resources:read",
        name: "Read Resources",
        description: "Duplicate",
        resource: "resources",
        action: "read",
      };

      await expect(service.createPermission(dto, "admin-1")).rejects.toThrow(
        ConflictException
      );
    });

    it("Given a code without colon separator, When createPermission is called, Then it should throw ConflictException", async () => {
      permissionModel.findOne.mockResolvedValue(null);

      const dto = {
        code: "invalidformat",
        name: "Invalid",
        description: "Bad format",
        resource: "resources",
        action: "read",
      };

      await expect(service.createPermission(dto, "admin-1")).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe("updatePermission", () => {
    it("Given an existing permission, When updatePermission is called, Then it should update and return", async () => {
      permissionModel.findById.mockResolvedValue({ ...mockPermission, save: jest.fn().mockResolvedValue(true) });

      const result = await service.updatePermission("perm-123", { name: "Updated Name" }, "admin-1");

      expect(result).toBeDefined();
    });

    it("Given a non-existent permission, When updatePermission is called, Then it should throw NotFoundException", async () => {
      permissionModel.findById.mockResolvedValue(null);

      await expect(
        service.updatePermission("non-existent", { name: "Test" }, "admin-1")
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("deletePermission", () => {
    it("Given a permission not assigned to any role, When deletePermission is called, Then it should delete", async () => {
      permissionModel.findById.mockResolvedValue(mockPermission);
      roleService.getRolesWithPermission.mockResolvedValue([]);
      permissionModel.findByIdAndDelete.mockResolvedValue(true);

      await service.deletePermission("perm-123");

      expect(permissionModel.findByIdAndDelete).toHaveBeenCalledWith("perm-123");
    });

    it("Given a permission assigned to roles, When deletePermission is called, Then it should throw ConflictException", async () => {
      permissionModel.findById.mockResolvedValue(mockPermission);
      roleService.getRolesWithPermission.mockResolvedValue([
        { id: "role-1", name: "admin", displayName: "Admin" } as any,
      ]);

      await expect(service.deletePermission("perm-123")).rejects.toThrow(
        ConflictException
      );
    });

    it("Given a non-existent permission, When deletePermission is called, Then it should throw NotFoundException", async () => {
      permissionModel.findById.mockResolvedValue(null);

      await expect(service.deletePermission("non-existent")).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("getPermissions", () => {
    it("Given permissions exist, When getPermissions is called, Then it should return filtered list", async () => {
      permissionModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([mockPermission]),
      });

      const result = await service.getPermissions({ resource: "resources" });

      expect(result).toHaveLength(1);
    });
  });

  describe("getUserPermissions", () => {
    it("Given a user with roles and direct permissions, When getUserPermissions is called, Then it should combine all permissions", async () => {
      const userModel = (service as any).userModel;
      const roleModel = (service as any).roleModel;

      userModel.findById.mockResolvedValue({
        permissions: ["direct:perm"],
        roles: ["student"],
      });

      roleModel.find.mockResolvedValue([
        { permissions: ["role:perm1", "role:perm2"] },
      ]);

      const result = await service.getUserPermissions("user-123");

      expect(result).toContain("direct:perm");
      expect(result).toContain("role:perm1");
      expect(result).toContain("role:perm2");
    });

    it("Given a non-existent user, When getUserPermissions is called, Then it should return empty array", async () => {
      const userModel = (service as any).userModel;
      userModel.findById.mockResolvedValue(null);

      const result = await service.getUserPermissions("non-existent");

      expect(result).toEqual([]);
    });
  });
});
