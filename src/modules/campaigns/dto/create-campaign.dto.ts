import { IsNotEmpty, IsString, IsInt, IsArray, ArrayMinSize, IsDateString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Campaña Navidad 2026' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '2026-12-24 10:00:00' })
  @IsNotEmpty()
  @IsDateString() // Valida formato ISO 8601
  scheduledAt: string;

  @ApiProperty({ example: 1, description: 'ID del usuario que crea la campaña' })
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @ApiProperty({ example: ['Oferta Exclusiva', 'Descuento 50%'], type: [String] })
  @IsArray()
  @ArrayMinSize(1, { message: 'La campaña debe tener al menos un mensaje' })
  @IsString({ each: true })
  @IsNotEmpty({ each: true, message: 'No se permiten mensajes vacíos' })
  @MinLength(5, { each: true, message: 'Cada mensaje debe tener al menos 5 caracteres' }) 

  @Transform(({ value }) => Array.isArray(value) ? value.map(v => typeof v === 'string' ? v.trim() : v) : value)
  messages: string[];
}