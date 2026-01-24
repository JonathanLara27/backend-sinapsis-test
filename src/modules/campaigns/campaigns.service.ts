import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { Campaign } from '../../entities/campaign.entity';
import { Message } from '../../entities/message.entity';
import { Status } from '../../common/enums/status.enum';
import { ShippingStatus } from 'src/common/enums/shippingStatus.enum';

@Injectable()
export class CampaignsService {
  constructor(private readonly dataSource: DataSource) {}

  async create(createCampaignDto: CreateCampaignDto) {
    return await this.dataSource.transaction(async (manager) => {
      try {
        return await this.createCampaignTransaction(manager, createCampaignDto);
      } catch (error) {
        throw new InternalServerErrorException('Error al crear la campaña', error.message);
      }
    });
  }

  private async createCampaignTransaction(
    manager: EntityManager, 
    dto: CreateCampaignDto
  ) {
    const { name, scheduledAt, userId, messages } = dto;

    const newCampaign = Campaign.create(name, new Date(scheduledAt), userId);
    
    const savedCampaign = await manager.save(newCampaign);

    const messagesEntities = messages.map(msgText => 
      Message.create(msgText, savedCampaign)
    );

    await manager.save(messagesEntities);

    return {
      message: 'Campaña creada exitosamente',
      campaignId: savedCampaign.id,
      totalMessages: messagesEntities.length,
    };
  }
}