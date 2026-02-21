import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Tarea } from '../../tarea/entities/tarea.entity';

@Entity('categoria')
export class Categoria {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50 })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string;

  @Column({ length: 7, nullable: true })
  color!: string;
  
  //  Muchas Categorías tiene Muchas Tareas
  @ManyToMany(() => Tarea, (tarea) => tarea.categorias)
  tareas!: Tarea[];
}