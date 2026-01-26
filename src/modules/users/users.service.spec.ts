import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { 
  BadRequestException, 
  InternalServerErrorException, 
  NotFoundException 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../../entities/user.entity';
import { Status } from '../../common/enums/status.enum';

const mockUser = {
  id: 1,
  username: 'testuser',
  clientId: 1,
  status: Status.ACTIVE,
  client: { id: 1, name: 'Empresa Test' }
};

const mockCreateDto = { username: 'nuevo', clientId: 1 };
const mockUpdateDto = { username: 'editado' };

const mockUserRepository = {
  create: jest.fn().mockReturnValue(mockUser),
  save: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear un usuario correctamente', async () => {
      // Arrange
      mockUserRepository.save.mockResolvedValue(mockUser);

      // Act
      const result = await service.create(mockCreateDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.save).toHaveBeenCalled();
      // Verificamos que se guarde con estado ACTIVE (Lógica de User.create)
      const saveCallArg = mockUserRepository.save.mock.calls[0][0];
      expect(saveCallArg.status).toBe(Status.ACTIVE);
    });

    it('debería lanzar BadRequestException si el cliente no existe (Error 1452)', async () => {
      // Arrange: Simulamos error de Foreign Key de MySQL
      mockUserRepository.save.mockRejectedValue({ errno: 1452 });

      // Act & Assert
      await expect(service.create(mockCreateDto)).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar InternalServerErrorException para otros errores', async () => {
      // Arrange: Error genérico de conexión
      mockUserRepository.save.mockRejectedValue(new Error('DB Connection failed'));

      // Act & Assert
      await expect(service.create(mockCreateDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('debería retornar datos paginados y metadatos', async () => {
      // Arrange
      const mockData = [mockUser];
      const mockTotal = 1;
      mockUserRepository.findAndCount.mockResolvedValue([mockData, mockTotal]);
      
      const paginationDto = { page: 1, limit: 10 };

      // Act
      const result = await service.findAll(paginationDto);

      // Assert
      expect(result.data).toEqual(mockData);
      expect(result.meta.total).toBe(1);
      expect(result.meta.lastPage).toBe(1);
    });
  });

  describe('findOne', () => {
    it('debería retornar un usuario si existe', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);
      expect(result).toEqual(mockUser);
    });

    it('debería lanzar NotFoundException si no existe', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debería actualizar el usuario si existe', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const updatedUser = { ...mockUser, ...mockUpdateDto };
      mockUserRepository.save.mockResolvedValue(updatedUser);

      // Act
      const result = await service.update(1, mockUpdateDto);

      // Assert
      expect(result.username).toBe('editado');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('debería cambiar el estado a INACTIVE (Soft Delete)', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser, status: Status.ACTIVE });
      mockUserRepository.save.mockImplementation((user) => Promise.resolve(user));

      // Act
      const result = await service.remove(1);

      // Assert
      expect(result.status).toBe(Status.INACTIVE);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });
});