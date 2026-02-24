import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { TwoFactorService } from "../../../src/application/services/two-factor.service";
import { IUserRepository } from "../../../src/domain/repositories/user.repository.interface";

jest.mock("speakeasy", () => ({
  generateSecret: jest.fn().mockReturnValue({
    base32: "MOCK_SECRET_BASE32",
    otpauth_url: "otpauth://totp/Bookly:test@ufps.edu.co?secret=MOCK",
  }),
  totp: {
    verify: jest.fn(),
  },
}));

jest.mock("qrcode", () => ({
  toDataURL: jest.fn().mockResolvedValue("data:image/png;base64,MOCKQR"),
}));

const speakeasy = require("speakeasy");

describe("TwoFactorService", () => {
  let service: TwoFactorService;
  let userRepository: jest.Mocked<IUserRepository>;

  const createMockUser = (overrides = {}) => ({
    id: "user-123",
    email: "test@ufps.edu.co",
    twoFactorEnabled: false,
    twoFactorSecret: undefined,
    twoFactorBackupCodes: [],
    has2FAEnabled: jest.fn().mockReturnValue(false),
    enable2FA: jest.fn(),
    disable2FA: jest.fn(),
    useBackupCode: jest.fn(),
    regenerateBackupCodes: jest.fn(),
    ...overrides,
  });

  beforeEach(async () => {
    const mockUserRepository = {
      findById: jest.fn(),
      update: jest.fn().mockResolvedValue(true),
      findByEmail: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwoFactorService,
        {
          provide: "IUserRepository",
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<TwoFactorService>(TwoFactorService);
    userRepository = module.get("IUserRepository");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- RF-45: Verificación 2FA ---

  describe("setup2FA", () => {
    it("Given a user without 2FA, When setup2FA is called, Then it should return secret, qrCode and backupCodes", async () => {
      const mockUser = createMockUser();
      userRepository.findById.mockResolvedValue(mockUser as any);

      const result = await service.setup2FA("user-123");

      expect(result).toBeDefined();
      expect(result.secret).toBe("MOCK_SECRET_BASE32");
      expect(result.qrCode).toContain("data:image/png");
      expect(result.backupCodes).toHaveLength(10);
    });

    it("Given a user with 2FA already enabled, When setup2FA is called, Then it should throw BadRequestException", async () => {
      const mockUser = createMockUser({
        twoFactorEnabled: true,
        has2FAEnabled: jest.fn().mockReturnValue(true),
      });
      userRepository.findById.mockResolvedValue(mockUser as any);

      await expect(service.setup2FA("user-123")).rejects.toThrow(
        BadRequestException
      );
    });

    it("Given a non-existent user, When setup2FA is called, Then it should throw BadRequestException", async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.setup2FA("non-existent")).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("enable2FA", () => {
    it("Given a valid TOTP code, When enable2FA is called, Then 2FA should be enabled and backupCodes returned", async () => {
      const mockUser = createMockUser();
      userRepository.findById.mockResolvedValue(mockUser as any);
      speakeasy.totp.verify.mockReturnValue(true);

      const result = await service.enable2FA("user-123", "123456", "SECRET");

      expect(result.backupCodes).toHaveLength(10);
      expect(mockUser.enable2FA).toHaveBeenCalled();
      expect(userRepository.update).toHaveBeenCalledWith(
        "user-123",
        expect.objectContaining({ twoFactorEnabled: true })
      );
    });

    it("Given an invalid TOTP code, When enable2FA is called, Then it should throw UnauthorizedException", async () => {
      const mockUser = createMockUser();
      userRepository.findById.mockResolvedValue(mockUser as any);
      speakeasy.totp.verify.mockReturnValue(false);

      await expect(
        service.enable2FA("user-123", "000000", "SECRET")
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("verify2FA", () => {
    it("Given a valid TOTP code, When verify2FA is called, Then it should return true", async () => {
      const mockUser = createMockUser({
        twoFactorEnabled: true,
        twoFactorSecret: "SECRET",
        has2FAEnabled: jest.fn().mockReturnValue(true),
      });
      userRepository.findById.mockResolvedValue(mockUser as any);
      speakeasy.totp.verify.mockReturnValue(true);

      const result = await service.verify2FA("user-123", "123456");

      expect(result).toBe(true);
    });

    it("Given an invalid TOTP code, When verify2FA is called, Then it should return false", async () => {
      const mockUser = createMockUser({
        twoFactorEnabled: true,
        twoFactorSecret: "SECRET",
        has2FAEnabled: jest.fn().mockReturnValue(true),
      });
      userRepository.findById.mockResolvedValue(mockUser as any);
      speakeasy.totp.verify.mockReturnValue(false);

      const result = await service.verify2FA("user-123", "000000");

      expect(result).toBe(false);
    });

    it("Given a user without 2FA, When verify2FA is called, Then it should throw BadRequestException", async () => {
      const mockUser = createMockUser();
      userRepository.findById.mockResolvedValue(mockUser as any);

      await expect(service.verify2FA("user-123", "123456")).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("disable2FA", () => {
    it("Given a user with 2FA enabled, When disable2FA is called, Then 2FA should be disabled", async () => {
      const mockUser = createMockUser({
        twoFactorEnabled: true,
        has2FAEnabled: jest.fn().mockReturnValue(true),
      });
      userRepository.findById.mockResolvedValue(mockUser as any);

      await service.disable2FA("user-123");

      expect(mockUser.disable2FA).toHaveBeenCalled();
      expect(userRepository.update).toHaveBeenCalledWith(
        "user-123",
        expect.objectContaining({ twoFactorEnabled: false })
      );
    });

    it("Given a user without 2FA, When disable2FA is called, Then it should throw BadRequestException", async () => {
      const mockUser = createMockUser();
      userRepository.findById.mockResolvedValue(mockUser as any);

      await expect(service.disable2FA("user-123")).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("validateBackupCode", () => {
    it("Given a valid backup code, When validateBackupCode is called, Then it should return true", async () => {
      const mockUser = createMockUser({
        twoFactorEnabled: true,
        twoFactorBackupCodes: ["ABC123"],
        has2FAEnabled: jest.fn().mockReturnValue(true),
        useBackupCode: jest.fn().mockReturnValue(true),
      });
      userRepository.findById.mockResolvedValue(mockUser as any);

      const result = await service.validateBackupCode("user-123", "ABC123");

      expect(result).toBe(true);
      expect(userRepository.update).toHaveBeenCalled();
    });

    it("Given an invalid backup code, When validateBackupCode is called, Then it should return false", async () => {
      const mockUser = createMockUser({
        twoFactorEnabled: true,
        has2FAEnabled: jest.fn().mockReturnValue(true),
        useBackupCode: jest.fn().mockReturnValue(false),
      });
      userRepository.findById.mockResolvedValue(mockUser as any);

      const result = await service.validateBackupCode("user-123", "INVALID");

      expect(result).toBe(false);
    });
  });

  describe("regenerateBackupCodes", () => {
    it("Given a user with 2FA, When regenerateBackupCodes is called, Then new codes should be generated", async () => {
      const mockUser = createMockUser({
        twoFactorEnabled: true,
        has2FAEnabled: jest.fn().mockReturnValue(true),
      });
      userRepository.findById.mockResolvedValue(mockUser as any);

      const result = await service.regenerateBackupCodes("user-123");

      expect(result.backupCodes).toHaveLength(10);
      expect(mockUser.regenerateBackupCodes).toHaveBeenCalled();
      expect(userRepository.update).toHaveBeenCalled();
    });

    it("Given a user without 2FA, When regenerateBackupCodes is called, Then it should throw BadRequestException", async () => {
      const mockUser = createMockUser();
      userRepository.findById.mockResolvedValue(mockUser as any);

      await expect(service.regenerateBackupCodes("user-123")).rejects.toThrow(
        BadRequestException
      );
    });
  });
});
