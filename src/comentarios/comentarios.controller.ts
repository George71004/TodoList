import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ComentariosService } from './comentarios.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';

@UseGuards(JwtAuthGuard)
@Controller('comentarios')
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  @Post()
  async create(@Body() createComentarioDto: CreateComentarioDto, @Req() req) {
    
    const userId = req.user.userId;

    return await this.comentariosService.create(createComentarioDto, userId);
  }

  @Get()
  async findAll() {
    return await this.comentariosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.comentariosService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateComentarioDto: UpdateComentarioDto) {
    return await this.comentariosService.update(+id, updateComentarioDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.comentariosService.remove(+id);
    return { message: 'Comentario eliminado' };
  }
}
