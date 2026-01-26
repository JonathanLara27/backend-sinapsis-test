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

  //se pudo agregar CreateDateColumn y UpdateDateColumn, pero no estaba dentro del requerimiento.
  //Recomiendo usar esto en todas las entidades, para mantener un registro de cuando se crean y actualizan los registros.

  static create(name: string): Client {
    const client = new Client();
    client.name = name;
    client.status = Status.ACTIVE;
    return client;
  }
}