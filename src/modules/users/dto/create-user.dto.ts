import { IsInt, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'juan.perez', description: 'Nombre de usuario único' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(30, { message: 'El usuario no puede tener más de 30 caracteres' })
  username: string;

  @ApiProperty({ example: 1, description: 'ID del Cliente al que pertenece el usuario' })
  @IsNotEmpty()
  @IsInt()
  clientId: number;
}