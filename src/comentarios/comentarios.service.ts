
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comentario } from './entities/comentario.entity';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectRepository(Comentario)
    private readonly comentarioRepository: Repository<Comentario>,
  ) {}

  async create(createComentarioDto: CreateComentarioDto, userId: number): Promise<Comentario> {
    const comentario = this.comentarioRepository.create({...createComentarioDto, userPost: { id: userId } as any});
    return await this.comentarioRepository.save(comentario);
  }

  async findAll(): Promise<Comentario[]> {
    return await this.comentarioRepository.find({ relations: ['userPost', 'tarea'] });
  }

  async findOne(id: number): Promise<Comentario | null> {
    return await this.comentarioRepository.findOne({ where: { id }, relations: ['userPost', 'tarea'] });
  }

  async update(id: number, updateComentarioDto: UpdateComentarioDto): Promise<Comentario | null> {
    await this.comentarioRepository.update(id, updateComentarioDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.comentarioRepository.delete(id);
  }
}
