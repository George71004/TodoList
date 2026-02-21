import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, JoinTable, OneToMany, ManyToMany } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity'; // Asumiendo que ya creaste este módulo
import { Categoria } from '../../categoria/entities/categoria.entity';
import { Comentario } from '../../comentarios/entities/comentario.entity';

@Entity('tarea') // Nombre real de la tabla en Postgres
export class Tarea {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  nombre!: string;

  @Column()
  titulo!: string;

  @Column({ name: 'story_points', default: 0 })
  storyPoints!: number;

  @Column({ name: 'fecha_entrega', type: 'timestamp', nullable: true })
  fechaEntrega!: Date;

  // --- RELACIONES ---

  // Muchas Tareas pertenecen a Un Usuario Creador
  @ManyToOne(() => Usuario, (usuario) => usuario.tareasCreadas)
  @JoinColumn({ name: 'user_creador_id' }) // Mapea a tu columna SQL exacta
  userCreador!: Usuario;

  // Muchas Tareas pueden ser asignadas a Un Usuario
  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'user_asignado_id' })
  userAsignado!: Usuario;

  // Muchas Tareas pertenecen a muchas Categoria
  @ManyToMany(() => Categoria, (categoria) => categoria.tareas)
  @JoinTable({
    name: 'tarea_categoria', // Nombre de la tabla intermedia
    joinColumn: { name: 'tarea_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoria_id', referencedColumnName: 'id' }
  })
  categorias!: Categoria[];
  
  // Una Tarea tiene Muchos Comentarios
  @OneToMany(() => Comentario, (comentario) => comentario.tarea)
  comentarios!: Comentario[];
}