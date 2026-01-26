import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { User } from '../../entities/user.entity';
import { Status } from '../../common/enums/status.enum';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { username, clientId } = createUserDto;

    const newUser = User.create(username, clientId);

    try {
      return await this.userRepository.save(newUser);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any): never {
    this.logger.error(error);

    if (error.errno === 1452) {
      throw new BadRequestException('El Cliente indicado no existe.');
    }

    throw new InternalServerErrorException('Error inesperado al crear el usuario. Revise los logs del servidor.');
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const [data, total] = await this.userRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
      relations: ['client'], 
      order: { id: 'DESC' },
    });

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['client'],
    });
    
    if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    
    const updatedUser = Object.assign(user, updateUserDto);
    
    try {
      return await this.userRepository.save(updatedUser);
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar el usuario', error.message);
    }
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    
    user.status = Status.INACTIVE;
    
    try {
      return await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Error al eliminar el usuario', error.message);
    }
  }

}