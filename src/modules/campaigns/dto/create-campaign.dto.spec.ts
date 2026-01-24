import { validate } from 'class-validator';
import { CreateCampaignDto } from './create-campaign.dto';

describe('CreateCampaignDto', () => {
  
  // Helper para crear un DTO válido base
  const generateValidDto = () => {
    const dto = new CreateCampaignDto();
    dto.name = 'Valid Campaign';
    dto.scheduledAt = '2026-12-25T10:00:00Z';
    dto.userId = 1;
    dto.messages = ['Oferta válida'];
    return dto;
  };

  it('debería pasar si todos los datos son correctos', async () => {
    const dto = generateValidDto();
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si un mensaje es un string vacío', async () => {
    const dto = generateValidDto();
    // Inyectamos el error: Mensaje vacío
    dto.messages = ['Mensaje bueno', '']; 

    const errors = await validate(dto);
    
    // Esperamos errores
    expect(errors.length).toBeGreaterThan(0);
    // Buscamos el error específico en la propiedad 'messages'
    const messageError = errors.find(err => err.property === 'messages');
    expect(messageError).toBeDefined();
    // Verificamos que falle por isNotEmpty
    expect(messageError.constraints).toHaveProperty('isNotEmpty');
  });

  it('debería fallar si un mensaje tiene menos de 5 caracteres', async () => {
    const dto = generateValidDto();
    // Inyectamos el error: Mensaje muy corto ("Hola" son 4 letras)
    dto.messages = ['Hola']; 

    const errors = await validate(dto);
    
    expect(errors.length).toBeGreaterThan(0);
    const messageError = errors.find(err => err.property === 'messages');
    expect(messageError).toBeDefined();
    // Verificamos que falle por minLength
    expect(messageError.constraints).toHaveProperty('minLength');
  });

  it('debería fallar si el array de mensajes está vacío', async () => {
    const dto = generateValidDto();
    dto.messages = []; // Array vacío

    const errors = await validate(dto);
    
    expect(errors.length).toBeGreaterThan(0);
    const messageError = errors.find(err => err.property === 'messages');
    expect(messageError.constraints).toHaveProperty('arrayMinSize');
  });
});