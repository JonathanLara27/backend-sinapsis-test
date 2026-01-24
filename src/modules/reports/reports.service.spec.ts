import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { Message } from '../../entities/message.entity';
import { Status } from '../../common/enums/status.enum';

// 1. DATA DE PRUEBA (Lo que devolvería la BD en formato RAW)
const mockRawResults = [
  { shippingStatus: '1', count: '5' }, // TypeORM suele devolver counts como strings
  { shippingStatus: '2', count: '10' },
];

// 2. MOCK DEL QUERY BUILDER (Cadena de métodos)
const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),      // Devuelve "this" para seguir encadenando
  addSelect: jest.fn().mockReturnThis(),
  innerJoin: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  getRawMany: jest.fn().mockResolvedValue(mockRawResults), // El final de la cadena
};

// 3. MOCK DEL REPOSITORIO
const mockMessageRepository = {
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
};

describe('ReportsService', () => {
  let service: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          // IMPORTANTE: Usar getRepositoryToken para inyectar el mock
          provide: getRepositoryToken(Message),
          useValue: mockMessageRepository,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMessagesByStatus', () => {
    it('should return aggregated data correctly formatted', async () => {
      // ARRANGE
      const filterDto = { month: 1, clientId: 5 };

      // ACT
      const result = await service.getMessagesByStatus(filterDto);

      // ASSERT
      // 1. Verificar que se llamó al QueryBuilder
      expect(mockMessageRepository.createQueryBuilder).toHaveBeenCalledWith('message');
      
      // 2. Verificar filtros obligatorios
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith('message.campaign', 'campaign');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('message.status = :active', { active: Status.ACTIVE });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('MONTH(campaign.scheduledAt) = :month', { month: 1 });

      // 3. Verificar filtro opcional (Client ID)
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('user.clientId = :clientId', { clientId: 5 });

      // 4. Verificar resultado final (Mapeo de String a Number)
      expect(result).toEqual([
        { shippingStatus: 1, count: 5 },  // '1' -> 1
        { shippingStatus: 2, count: 10 }, // '5' -> 5
      ]);
    });

    it('should query without clientId if not provided', async () => {
      // ARRANGE
      const filterDto = { month: 2 }; // Sin clientId

      // ACT
      await service.getMessagesByStatus(filterDto);

      // ASSERT
      // Verificamos que NO se llamó al filtro de cliente
      const calls = mockQueryBuilder.andWhere.mock.calls;
      const clientFilterCall = calls.find(call => call[0].includes('clientId'));
      
      expect(clientFilterCall).toBeUndefined();
    });
  });
});