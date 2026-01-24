import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Campaign } from './campaign.entity';
import { ShippingStatus } from '../common/enums/shippingStatus.enum';
import { Status } from '../common/enums/status.enum';

@Entity('mensaje')
export class Message {
  @PrimaryGeneratedColumn({ name: 'idMensaje' })
  id: number;

  @Column({ name: 'mensaje', length: 160 })
  text: string;

  @Column({ name: 'estadoEnvio', type: 'int', default: ShippingStatus.PENDING })
  shippingStatus: ShippingStatus;

  @Column({ name: 'fechaHoraEnvio', type: 'datetime', nullable: true })
  sentAt: Date;

  @Column({ name: 'estado', type: 'tinyint', width: 1, default: Status.ACTIVE })
  status: Status;

  // FK: idCampania (Implícita en el diagrama por la línea conectora)
  @ManyToOne(() => Campaign, (campaign) => campaign.messages)
  @JoinColumn({ name: 'idCampania' })
  campaign: Campaign;

  @Column({ name: 'idCampania' })
  campaignId: number;

  static create(text: string, campaign: Campaign): Message {
    const message = new Message();
    message.text = text;
    message.shippingStatus = ShippingStatus.PENDING;
    message.campaign = campaign;
    message.status = Status.ACTIVE;
    return message;
  }
}