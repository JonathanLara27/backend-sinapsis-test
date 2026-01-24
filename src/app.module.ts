import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsModule } from './modules/reports/reports.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    
    TypeOrmModule.forRootAsync({ // Usamos forRootAsync para inyectar ConfigService
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}