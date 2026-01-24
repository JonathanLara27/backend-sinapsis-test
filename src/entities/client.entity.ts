import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Status } from '../common/enums/status.enum';

@Entity('cliente')
export class Client {
  @PrimaryGeneratedColumn({ name: 'idCliente' })
  id: number;

  @Column({ name: 'nombre', length: 100 })
  name: string;

  @Column({ name: 'estado', type: 'tinyint', width: 1, default: Status.ACTIVE })
  status: Status;

  @OneToMany(() => User, (user) => user.client)
  users: User[];
}