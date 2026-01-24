import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Client } from './client.entity';
import { Campaign } from './campaign.entity';
import { Status } from 'src/common/enums/status.enum';

@Entity('usuario')
export class User {
  @PrimaryGeneratedColumn({ name: 'idUsuario' })
  id: number;

  @Column({ name: 'usuario', length: 30 })
  username: string;

  @Column({ name: 'estado', type: 'tinyint', width: 1, default: Status.ACTIVE })
  status: Status;

  // FK: idCliente
  @ManyToOne(() => Client, (client) => client.users)
  @JoinColumn({ name: 'idCliente' })
  client: Client;

  @Column({ name: 'idCliente' }) // Columna explícita para facilitar consultas
  clientId: number;

  // Relación: Un usuario crea muchas campañas
  @OneToMany(() => Campaign, (campaign) => campaign.user)
  campaigns: Campaign[];
}