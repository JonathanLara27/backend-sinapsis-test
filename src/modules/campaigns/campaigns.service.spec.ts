import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, QueryRunner, EntityManager } from 'typeorm';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { InternalServerErrorException } from '@nestjs/common';

// 1. MOCK DATA
const mockCampaignDto: CreateCampaignDto = {
  name: 'Test Campaign',
  scheduledAt: '2026-12-25T10:00:00Z',
  userId: 1,
  messages: ['Msg 1', 'Msg 2'],
};

// 2. MOCK DEL QUERY RUNNER
// Simulamos el comportamiento de la transacción
const mockEntityManager = {
  save: jest.fn(),
} as unknown as EntityManager;

const mockQueryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: mockEntityManager,
} as unknown as QueryRunner;

// 3. MOCK DEL DATA SOURCE
const mockDataSource = {
  createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  transaction: jest.fn().mockImplementation(async (cb) => {
      // Simulamos la implementación de .transaction()
      // Ejecutamos el callback pasando nuestro manager mockeado
      return cb(mockEntityManager);
  })
};

describe('CampaignsService', () => {
  let service: CampaignsService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignsService,
        {
          provide: DataSource,
          useValue: mockDataSource, // Inyectamos el mock
        },
      ],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a campaign and messages successfully (COMMIT)', async () => {
      // ARRANGE
      const savedCampaign = { id: 1, ...mockCampaignDto };
      // Cuando llamen a save la primera vez (campaña), devuelve esto:
      (mockEntityManager.save as jest.Mock).mockResolvedValueOnce(savedCampaign);
      // Cuando llamen a save la segunda vez (mensajes), devuelve array vacío (no nos importa el contenido exacto para este test):
      (mockEntityManager.save as jest.Mock).mockResolvedValueOnce([]);

      // ACT
      const result = await service.create(mockCampaignDto);

      // ASSERT
      expect(mockDataSource.transaction).toHaveBeenCalled(); // Se usó transacción
      expect(mockEntityManager.save).toHaveBeenCalledTimes(2); // Se guardó campaña y mensajes
      expect(result).toEqual({
        message: 'Campaña creada exitosamente',
        campaignId: 1,
        totalMessages: 2,
      });
    });

    it('should rollback transaction if save fails', async () => {
      // ARRANGE
      // Simulamos que la base de datos falla al guardar la campaña
      (mockEntityManager.save as jest.Mock).mockRejectedValue(new Error('DB Error'));

      // ACT & ASSERT
      await expect(service.create(mockCampaignDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});