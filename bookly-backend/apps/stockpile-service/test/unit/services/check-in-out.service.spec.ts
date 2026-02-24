import { CheckInOutStatus } from "@libs/common/enums";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { CheckInOutService } from "../../../src/application/services/check-in-out.service";

describe("CheckInOutService", () => {
  let service: CheckInOutService;
  let model: any;

  const mockCheckIn = {
    _id: "checkin-123",
    reservationId: "res-123",
    resourceId: "resource-123",
    userId: "user-123",
    status: CheckInOutStatus.CHECKED_IN,
    checkInTime: new Date(),
    checkInBy: "user-123",
    checkInType: "manual",
    toObject: jest.fn().mockReturnValue({
      _id: "checkin-123",
      reservationId: "res-123",
      resourceId: "resource-123",
      userId: "user-123",
      status: CheckInOutStatus.CHECKED_IN,
    }),
  };

  beforeEach(async () => {
    const mockModel = {
      create: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckInOutService,
        {
          provide: getModelToken("CheckInOut"),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<CheckInOutService>(CheckInOutService);
    model = module.get(getModelToken("CheckInOut"));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- RF-26: Check-in/Check-out digital ---

  describe("create (check-in)", () => {
    it("Given valid check-in data, When create is called, Then it should create a check-in record with QR code", async () => {
      model.create.mockResolvedValue(mockCheckIn);

      const result = await service.create({
        reservationId: "res-123",
        resourceId: "resource-123",
        userId: "user-123",
        status: CheckInOutStatus.CHECKED_IN,
        checkInTime: new Date(),
        checkInBy: "user-123",
        checkInType: "manual",
      });

      expect(result).toBeDefined();
      expect(model.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            qrCode: expect.stringContaining("CHECKIN-"),
          }),
        })
      );
    });
  });

  describe("findById", () => {
    it("Given an existing check-in, When findById is called, Then it should return the record", async () => {
      model.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockCheckIn.toObject()),
      });

      const result = await service.findById("checkin-123");

      expect(result).toBeDefined();
    });

    it("Given a non-existent check-in, When findById is called, Then it should return null", async () => {
      model.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("findByReservationId", () => {
    it("Given a reservation with check-in, When findByReservationId is called, Then it should return the record", async () => {
      model.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockCheckIn.toObject()),
      });

      const result = await service.findByReservationId("res-123");

      expect(result).toBeDefined();
    });
  });

  describe("update (check-out)", () => {
    it("Given an existing check-in, When update is called with check-out data, Then it should update", async () => {
      model.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          ...mockCheckIn.toObject(),
          status: CheckInOutStatus.CHECKED_OUT,
          checkOutTime: new Date(),
        }),
      });

      const result = await service.update("checkin-123", {
        status: CheckInOutStatus.CHECKED_OUT,
        checkOutTime: new Date(),
        checkOutBy: "user-123",
      });

      expect(result).toBeDefined();
      expect(model.findByIdAndUpdate).toHaveBeenCalled();
    });
  });
});
