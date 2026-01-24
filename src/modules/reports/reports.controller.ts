import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { GetReportFilterDto } from './dto/get-report-filter.dto';

@ApiTags('Reportes')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Obtener cantidad de mensajes por estado de envío' })
  @ApiResponse({ status: 200, description: 'Reporte generado' })
  getDashboardReport(@Query() filterDto: GetReportFilterDto) {
    return this.reportsService.getMessagesByStatus(filterDto);
  }
}