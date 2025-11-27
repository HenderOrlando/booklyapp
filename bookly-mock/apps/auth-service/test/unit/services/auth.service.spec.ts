import { UserRole, UserStatus } from "@libs/common/enums";
import { RedisService } from "@libs/redis";
import { UnauthorizedException } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
import { AuthService } from "../../../src/application/services/auth.service";
import { UserEntity } from "../../../src/domain/entities/user.entity";
import { IUserRepository } from "../../../src/domain/repositories/user.repository.interface";

jest.mock("bcrypt");

describe("AuthService", () => {
  let service: AuthService;
  let userRepository: jest.Mocked<IUserRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let redisService: jest.Mocked<RedisService>;
  let eventBus: jest.Mocked<EventBus>;

  const mockUser: UserEntity = {
    id: "user-123",
    email: "test@ufps.edu.co",
    username: "testuser",
    password: "$2b$10$hashedpassword",
    firstName: "Test",
    lastName: "User",
    roles: [UserRole.STUDENT],
    permissions: ["read:resources"],
    status: UserStatus.ACTIVE,
    emailVerified: true,
    twoFactorEnabled: false,
    profilePicture: null,
    phoneNumber: null,
    address: null,
    preferences: {},
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as UserEntity;

  beforeEach(async () => {
    const mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const mockRedisService = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
    };

    const mockEventBus = {
      publish: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: "IUserRepository",
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: EventBus,
          useValue: mockEventBus,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get("IUserRepository");
    jwtService = module.get(JwtService);
    redisService = module.get(RedisService);
    eventBus = module.get(EventBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("validateUser", () => {
    it("should return user when credentials are valid", async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.validateUser(
        "test@ufps.edu.co",
        "password123"
      );

      // Assert
      expect(result).toEqual(mockUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        "test@ufps.edu.co"
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        mockUser.password
      );
    });

    it("should return null when user does not exist", async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);

      // Act
      const result = await service.validateUser(
        "nonexistent@ufps.edu.co",
        "password123"
      );

      // Assert
      expect(result).toBeNull();
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        "nonexistent@ufps.edu.co"
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it("should return null when password is invalid", async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await service.validateUser(
        "test@ufps.edu.co",
        "wrongpassword"
      );

      // Assert
      expect(result).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "wrongpassword",
        mockUser.password
      );
    });

    it("should return null when user status is not ACTIVE", async () => {
      // Arrange
      const inactiveUser = { ...mockUser, status: UserStatus.INACTIVE };
      userRepository.findByEmail.mockResolvedValue(inactiveUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.validateUser(
        "test@ufps.edu.co",
        "password123"
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("login", () => {
    it("should return tokens when 2FA is not enabled", async () => {
      // Arrange
      const tokens = {
        accessToken: "access-token-123",
        refreshToken: "refresh-token-456",
      };
      jwtService.sign.mockReturnValueOnce(tokens.accessToken);
      jwtService.sign.mockReturnValueOnce(tokens.refreshToken);
      redisService.set.mockResolvedValue();

      // Act
      const result = await service.login(mockUser);

      // Assert
      expect(result.requiresTwoFactor).toBe(false);
      expect(result.tokens).toEqual(tokens);
      expect(result.user).toEqual(mockUser);
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(redisService.set).toHaveBeenCalled();
    });

    it("should return tempToken when 2FA is enabled", async () => {
      // Arrange
      const userWith2FA = { ...mockUser, twoFactorEnabled: true };
      const tempToken = "temp-token-789";
      jwtService.sign.mockReturnValue(tempToken);

      // Act
      const result = await service.login(userWith2FA);

      // Assert
      expect(result.requiresTwoFactor).toBe(true);
      expect(result.tempToken).toBe(tempToken);
      expect(result.tokens).toBeUndefined();
      expect(result.user).toBeUndefined();
    });
  });

  describe("logout", () => {
    it("should invalidate refresh token in Redis", async () => {
      // Arrange
      const userId = "user-123";
      redisService.del.mockResolvedValue();

      // Act
      await service.logout(userId);

      // Assert
      expect(redisService.del).toHaveBeenCalledWith(
        expect.stringContaining(userId)
      );
    });
  });

  describe("refreshTokens", () => {
    it("should throw UnauthorizedException when refresh token is invalid", async () => {
      // Arrange
      redisService.get.mockResolvedValue(null);

      // Act & Assert
      await expect(service.refreshTokens("invalid-token")).rejects.toThrow(
        UnauthorizedException
      );
    });

    it("should return new tokens when refresh token is valid", async () => {
      // Arrange
      const oldRefreshToken = "old-refresh-token";
      const storedToken = "stored-token";
      const payload = {
        sub: "user-123",
        email: "test@ufps.edu.co",
        roles: [UserRole.STUDENT],
        permissions: ["read:resources"],
      };

      redisService.get.mockResolvedValue(storedToken);
      jwtService.verify.mockReturnValue(payload);
      userRepository.findById.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValueOnce("new-access-token");
      jwtService.sign.mockReturnValueOnce("new-refresh-token");
      redisService.set.mockResolvedValue();
      redisService.del.mockResolvedValue();

      // Act
      const result = await service.refreshTokens(oldRefreshToken);

      // Assert
      expect(result.accessToken).toBe("new-access-token");
      expect(result.refreshToken).toBe("new-refresh-token");
      expect(redisService.del).toHaveBeenCalled();
      expect(redisService.set).toHaveBeenCalled();
    });
  });

  describe("hashPassword", () => {
    it("should hash password with bcrypt", async () => {
      // Arrange
      const password = "plainPassword123";
      const hashedPassword = "$2b$10$hashedPassword";
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      // Act
      const result = await service.hashPassword(password);

      // Assert
      expect(result).toBe(hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });
  });
});
