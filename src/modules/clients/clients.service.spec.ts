import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { 
  BadRequestException, 
  InternalServerErrorException, 
  NotFoundException 
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Client } from '../../entities/client.entity';
import { Status } from '../../common/enums/status.enum';

const mockClient = {
  id: 1,
  name: 'Empresa Demo SAC',
  email: 'contacto@demo.com',
  status: Status.ACTIVE,
};

const mockCreateDto = { name: 'Empresa Nueva', email: 'new@demo.com' };
const mockUpdateDto = { name: 'Empresa Editada' };

const mockClientRepository = {
  create: jest.fn().mockReturnValue(mockClient),
  save: jest.fn(),
  findAndCount: jest.fn(),
  findOneBy: jest.fn(),
};

describe('ClientsService', () => {
  let service: ClientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: getRepositoryToken(Client),
          useValue: mockClientRepository,
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 🟢 TEST CREATE
  describe('create', () => {
    it('debería crear un cliente exitosamente', async () => {
      // Arrange
      mockClientRepository.save.mockResolvedValue(mockClient);

      // Act
      const result = await service.create(mockCreateDto);

      // Assert
      expect(result).toEqual(mockClient);
      expect(mockClientRepository.save).toHaveBeenCalled();
      
      // Verificamos que se usó el Factory Method (status ACTIVE)
      const saveArg = mockClientRepository.save.mock.calls[0][0];
      expect(saveArg.status).toBe(Status.ACTIVE);
    });

    it('debería lanzar InternalServerError para otros fallos', async () => {
      mockClientRepository.save.mockRejectedValue(new Error('DB Error'));
      await expect(service.create(mockCreateDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('debería retornar listado paginado', async () => {
      mockClientRepository.findAndCount.mockResolvedValue([[mockClient], 1]);
      const paginationDto = { page: 1, limit: 10 };

      const result = await service.findAll(paginationDto);

      expect(result.data).toEqual([mockClient]);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('debería retornar un cliente si existe', async () => {
      mockClientRepository.findOneBy.mockResolvedValue(mockClient);

      const result = await service.findOne(1);
      expect(result).toEqual(mockClient);
    });

    it('debería lanzar NotFoundException si no existe', async () => {
      mockClientRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debería actualizar datos correctamente', async () => {
      // Arrange
      mockClientRepository.findOneBy.mockResolvedValue(mockClient);
      const updatedClient = { ...mockClient, ...mockUpdateDto };
      mockClientRepository.save.mockResolvedValue(updatedClient);

      // Act
      const result = await service.update(1, mockUpdateDto);

      // Assert
      expect(result.name).toBe('Empresa Editada');
    });
  });

  describe('remove', () => {
    it('debería cambiar estado a INACTIVE', async () => {
      // Arrange
      mockClientRepository.findOneBy.mockResolvedValue({ ...mockClient, status: Status.ACTIVE });
      
      // Act
      await service.remove(1);

      // Assert
      // Verificamos qué se intentó guardar
      const saveArg = mockClientRepository.save.mock.calls[0][0];
      expect(saveArg.status).toBe(Status.INACTIVE);
    });
  });
});