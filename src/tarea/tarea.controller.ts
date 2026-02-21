import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TareaService } from './tarea.service';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';

@UseGuards(JwtAuthGuard)
@Controller('tarea')
export class TareaController {
  constructor(private readonly tareaService: TareaService) {}

  @Post()
  async create(@Body() createTareaDto: CreateTareaDto, @Req() req) {
    // El id del usuario autenticado viene en req.user.userId (JwtStrategy)
    const userId = req.user.userId;
    // Llamamos al servicio permitiendo el campo extra userCreadorId
    return await this.tareaService.create({ ...createTareaDto, userCreadorId: userId } as CreateTareaDto & { userCreadorId: number });
  }

  @Get()
  async findAll() {
    return await this.tareaService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.tareaService.findOne(+id);
  }

  @Get('usuario/:userId')
  async findAllByUserId(@Param('userId') userId: string) {
    return await this.tareaService.findAllByUserId(+userId);
  }

  @Get('estado/:estado')
  async findAllByEstado(@Param('estado') estado: string) {
    return await this.tareaService.findAllByEstado(estado);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTareaDto: UpdateTareaDto) {
    return await this.tareaService.update(+id, updateTareaDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.tareaService.remove(+id);
    return { message: 'Tarea eliminada' };
  }
}
