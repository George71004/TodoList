import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Tarea } from '../../tarea/entities/tarea.entity';

@Entity('comentarios')
export class Comentario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  contenido!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha!: Date;

  // Muchas comentarios pertenecen a un Usuario
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'user_post_id' })
  userPost!: Usuario;

  // Muchos comentarios pertenecen a una Tarea
  @ManyToOne(() => Tarea, (tarea) => tarea.comentarios, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tarea_comentada_id' })
  tarea!: Tarea;
}