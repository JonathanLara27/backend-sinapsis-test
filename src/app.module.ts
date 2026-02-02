import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsModule } from './modules/reports/reports.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';

@Module({
  imports: [
    // 🟢 OPTIMIZACIÓN PARA BUN:
    ConfigModule.forRoot({
      ignoreEnvFile: true, // Bun ya carga el .env nativamente, evitamos doble trabajo
      isGlobal: true,      // Para que ConfigService esté disponible en toda la app sin reimportar
    }),
    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        
        synchronize: configService.get<string>('DB_SYNCHRONIZE') === 'true',
        
        logging: configService.get<string>('DB_SYNCHRONIZE') === 'true',
      }),
    }),
    
    ReportsModule,
    
    CampaignsModule,
    
    UsersModule,
    
    ClientsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}