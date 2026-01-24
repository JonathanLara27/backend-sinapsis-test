import { IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetReportFilterDto {
  @ApiProperty({ description: 'Mes numérico (1-12)', example: 1 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiPropertyOptional({ description: 'ID del Cliente (opcional)', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  clientId?: number;
}