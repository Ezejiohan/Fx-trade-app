import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WalletsService } from './wallets.service';
import { WalletBalance } from './wallet-balance.entity';
import { FxService } from '../fx/fx.service';

describe('WalletsService - Conversion', () => {
  let service: WalletsService;
  let mockRepo: any;
  let mockFx: any;

  const mockUser = { id: 'user-1', email: 'test@example.com' };

  beforeEach(async () => {
    // Mock repository
    mockRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    // Mock FX service
    mockFx = {
      getRate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletsService,
        {
          provide: getRepositoryToken(WalletBalance),
          useValue: mockRepo,
        },
        {
          provide: FxService,
          useValue: mockFx,
        },
      ],
    }).compile();

    service = module.get<WalletsService>(WalletsService);
  });

  describe('convert', () => {
    it('should convert 1000 NGN to USD at rate 0.0065', async () => {
      const fromBalance = { id: '1', currency: 'NGN', amount: '1000', user: mockUser };
      const toBalance = { id: '2', currency: 'USD', amount: '0', user: mockUser };

      mockRepo.findOne.mockResolvedValueOnce(fromBalance).mockResolvedValueOnce(toBalance);
      mockRepo.create.mockImplementation((obj) => obj);
      mockRepo.save.mockImplementation((obj) => Promise.resolve(obj));
      mockFx.getRate.mockResolvedValue(0.0065);

      const result = await service.convert(mockUser, 'NGN', 'USD', 1000);

      expect(result.rate).toBe(0.0065);
      expect(result.received).toBe(6.5);
      expect(result.from.amount).toBe('0'); // 1000 - 1000 = 0
      expect(result.to.amount).toBe('6.5'); // 0 + 6.5 = 6.5
      expect(mockRepo.save).toHaveBeenCalledTimes(2);
    });

    it('should convert 50 EUR to NGN at rate 410', async () => {
      const fromBalance = { id: '3', currency: 'EUR', amount: '50', user: mockUser };
      const toBalance = { id: '4', currency: 'NGN', amount: '5000', user: mockUser };

      mockRepo.findOne.mockResolvedValueOnce(fromBalance).mockResolvedValueOnce(toBalance);
      mockRepo.create.mockImplementation((obj) => obj);
      mockRepo.save.mockImplementation((obj) => Promise.resolve(obj));
      mockFx.getRate.mockResolvedValue(410);

      const result = await service.convert(mockUser, 'EUR', 'NGN', 50);

      expect(result.rate).toBe(410);
      expect(result.received).toBe(20500); // 50 * 410
      expect(result.from.amount).toBe('0'); // 50 - 50 = 0
      expect(result.to.amount).toBe('25500'); // 5000 + 20500
      expect(mockRepo.save).toHaveBeenCalledTimes(2);
    });

    it('should throw error on insufficient balance', async () => {
      const fromBalance = { id: '5', currency: 'USD', amount: '5', user: mockUser };
      const toBalance = { id: '6', currency: 'NGN', amount: '0', user: mockUser };

      mockRepo.findOne.mockResolvedValueOnce(fromBalance).mockResolvedValueOnce(toBalance);
      mockRepo.create.mockImplementation((obj) => obj);
      mockFx.getRate.mockResolvedValue(150);

      await expect(service.convert(mockUser, 'USD', 'NGN', 100)).rejects.toThrow(
        'Insufficient balance',
      );
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('should handle same currency conversion (rate = 1)', async () => {
      const fromBalance = { id: '7', currency: 'USD', amount: '100', user: mockUser };
      const toBalance = { id: '8', currency: 'USD', amount: '50', user: mockUser };

      mockRepo.findOne.mockResolvedValueOnce(fromBalance).mockResolvedValueOnce(toBalance);
      mockRepo.create.mockImplementation((obj) => obj);
      mockRepo.save.mockImplementation((obj) => Promise.resolve(obj));
      mockFx.getRate.mockResolvedValue(1); // same currency

      const result = await service.convert(mockUser, 'USD', 'USD', 50);

      expect(result.rate).toBe(1);
      expect(result.received).toBe(50);
      expect(result.from.amount).toBe('50');
      expect(result.to.amount).toBe('100');
    });

    it('should ensure balances exist before conversion', async () => {
      const mockNewBalance = { id: '9', currency: 'GBP', amount: '0', user: mockUser };

      mockRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      mockRepo.create.mockReturnValue(mockNewBalance);
      mockRepo.save.mockResolvedValue(mockNewBalance);
      mockFx.getRate.mockResolvedValue(0.008);

      // Note: this will fail at conversion check since from balance is 0
      // This test demonstrates ensureBalance is called
      await expect(service.convert(mockUser, 'GBP', 'USD', 100)).rejects.toThrow(
        'Insufficient balance',
      );
    });
  });

  describe('fund', () => {
    it('should fund wallet with NGN', async () => {
      const balance = { id: '10', currency: 'NGN', amount: '1000', user: mockUser };
      mockRepo.findOne.mockResolvedValue(balance);
      mockRepo.create.mockImplementation((obj) => obj);
      mockRepo.save.mockResolvedValue({ ...balance, amount: '2500' });

      const result = await service.fund(mockUser, 'NGN', 1500);

      expect(result.amount).toBe('2500');
      expect(mockRepo.save).toHaveBeenCalled();
    });
  });

  describe('getBalances', () => {
    it('should return all balances for a user', async () => {
      const balances = [
        { currency: 'NGN', amount: '5000', user: mockUser },
        { currency: 'USD', amount: '25', user: mockUser },
      ];
      mockRepo.find.mockResolvedValue(balances);

      const result = await service.getBalances(mockUser.id);

      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { currency: 'NGN', amount: '5000' },
        { currency: 'USD', amount: '25' },
      ]);
    });
  });
});
