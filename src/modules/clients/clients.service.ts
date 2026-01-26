import { 
  Injectable, 
  NotFoundException, 
  InternalServerErrorException, 
  Logger 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { Client } from '../../entities/client.entity';
import { Status } from '../../common/enums/status.enum';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto) {
    const { name } = createClientDto;
    
    const newClient = Client.create(name);

    try {
      return await this.clientRepository.save(newClient);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const [data, total] = await this.clientRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
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
    const client = await this.clientRepository.findOneBy({ id });
    if (!client) throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    return client;
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    const client = await this.findOne(id);
    const updatedClient = Object.assign(client, updateClientDto);

    try {
      return await this.clientRepository.save(updatedClient);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: number) {
    const client = await this.findOne(id);
    client.status = Status.INACTIVE; // Soft Delete

    try {
      return await this.clientRepository.save(client);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error): never {
    throw new InternalServerErrorException(`Error inesperado al gestionar el cliente. ${error.message}`);
  }
}