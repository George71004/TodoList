import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuarioService {

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async register(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    // 1. Verificar si el usuario ya existe (usando el campo UNIQUE del email)
    const exists = await this.usuarioRepository.findOne({ where: { email: createUsuarioDto.email } });

    if (exists) {
        throw new ConflictException('El correo electrónico ya está registrado.');
    }

    // 2. Crear instancia del usuario
    const newUser = this.usuarioRepository.create(createUsuarioDto);
    
    // NOTA: El hash de la contraseña se hace automáticamente
    //       gracias al decorador @BeforeInsert en la Entidad.

    // 3. Guardar en la base de datos
    return await this.usuarioRepository.save(newUser);
  }

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const newUser = this.usuarioRepository.create(createUsuarioDto);
    return await this.usuarioRepository.save(newUser);
  }

  async findAll(): Promise<Usuario[]> {
    return await this.usuarioRepository.find();
  }

  async findOne(id: number): Promise<Usuario | null> {
    return await this.usuarioRepository.findOne({ where: { id } });
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario | null> {
    await this.usuarioRepository.update(id, updateUsuarioDto);
    return await this.usuarioRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.usuarioRepository.delete(id);
  }

    // Método auxiliar para el login (lo usaremos después)
  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { email } });
  }
  
}
