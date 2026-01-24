import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Message } from '../../entities/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}