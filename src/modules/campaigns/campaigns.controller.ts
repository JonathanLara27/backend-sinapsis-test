import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@ApiTags('Campañas') 
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @ApiOperation({ summary: 'Programar una nueva campaña con mensajes' })
  @ApiResponse({ status: 201, description: 'Campaña creada y programada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos (mensajes vacíos, etc).' })
  create(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignsService.create(createCampaignDto);
  }
}