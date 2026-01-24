import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../../entities/message.entity';
import { Status } from '../../common/enums/status.enum';
import { GetReportFilterDto } from './dto/get-report-filter.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async getMessagesByStatus(filterDto: GetReportFilterDto) {
    const { month, clientId } = filterDto;

    const query = this.messageRepository.createQueryBuilder('message')
      .select('message.shippingStatus', 'shippingStatus')
      .addSelect('COUNT(message.id)', 'count')
      .innerJoin('message.campaign', 'campaign')
      .innerJoin('campaign.user', 'user')
      .where('message.status = :active', { active: Status.ACTIVE })
      .andWhere('campaign.status = :active', { active: Status.ACTIVE })
      .andWhere('user.status = :active', { active: Status.ACTIVE })
      .andWhere('MONTH(campaign.scheduledAt) = :month', { month });

    if (clientId) {
      query.andWhere('user.clientId = :clientId', { clientId });
    }

    // Agrupamiento
    query.groupBy('message.shippingStatus');

    const rawResults = await query.getRawMany();

    // Formatear respuesta
    return rawResults.map((item) => ({
      shippingStatus: Number(item.shippingStatus),
      count: Number(item.count),
    }));
  }
}