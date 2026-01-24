import { User } from './user.entity';
import { Message } from './message.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Status } from 'src/common/enums/status.enum';

@Entity('campania')
export class Campaign {
  @PrimaryGeneratedColumn({ name: 'idCampania' })
  id: number;

  @Column({ name: 'nombre', length: 200 })
  name: string;

  @Column({ name: 'fechaHoraProgramacion', type: 'datetime' })
  scheduledAt: Date;

  @Column({ name: 'estado', type: 'tinyint', width: 1, default: Status.ACTIVE })
  status: Status;

  // FK: idUsuario
  @ManyToOne(() => User, (user) => user.campaigns)
  @JoinColumn({ name: 'idUsuario' })
  user: User;

  @Column({ name: 'idUsuario' })
  userId: number;

  // Relación: Una campaña tiene muchos mensajes
  @OneToMany(() => Message, (message) => message.campaign)
  messages: Message[];

  static create(name: string, scheduledAt: Date, userId: number): Campaign {
    const campaign = new Campaign();
    campaign.name = name;
    campaign.scheduledAt = scheduledAt;
    campaign.userId = userId;
    campaign.status = Status.ACTIVE;
    return campaign;
  }
}