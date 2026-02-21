import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert, BeforeUpdate  } from 'typeorm';
import { Tarea } from '../../tarea/entities/tarea.entity'; // Asegúrate que esta ruta sea correcta según tu estructura
import * as bcrypt from 'bcrypt'; // Importa bcrypt

@Entity('usuario') // Nombre de la tabla en la DB
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  // --- HASHING DE CONTRASEÑA ---
  // Estos métodos se ejecutan ANTES de guardar en la DB

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // Solo si el campo password ha sido modificado o es nuevo
    if (this.password) {
        // Generamos un "salt" (cadena aleatoria) y luego hasheamos
        const salt = await bcrypt.genSalt(10); // 10 es el costo recomendado
        this.password = await bcrypt.hash(this.password, salt);
    }
  }

  // --- Método para Comparar la Contraseña (útil para el Login) ---
  async comparePassword(password: string): Promise<boolean> {
    // Compara la contraseña plana ingresada con el hash guardado
    return await bcrypt.compare(password, this.password);
  }

  // --- RELACIONES INVERSAS ---
  // Esto permite hacer consultas como: "Traeme al usuario y todas sus tareas"
  
  @OneToMany(() => Tarea, (tarea) => tarea.userCreador)
  tareasCreadas!: Tarea[];

  @OneToMany(() => Tarea, (tarea) => tarea.userAsignado)
  tareasAsignadas!: Tarea[];

  // Descomentar cuando crees la entidad Comentario
  // @OneToMany(() => Comentario, (comentario) => comentario.userPost)
  // comentarios: Comentario[];
}