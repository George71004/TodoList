import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @UseGuards(JwtAuthGuard) // Protegido
  @Post()
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    const user = await this.usuarioService.create(createUsuarioDto);
    const { password, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard) // Protegido
  @Get()
  async findAll() {
    const users = await this.usuarioService.findAll();
    return users.map(({ password, ...rest }) => rest);
  }

  @UseGuards(JwtAuthGuard) // Protegido
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usuarioService.findOne(+id);

    if (!user) {
      throw new NotFoundException(`El usuario con ID ${id} no existe`);
    }

    const { password, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard) // Protegido
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    const user = await this.usuarioService.update(+id, updateUsuarioDto);
    if (!user) return null;
    const { password, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard) // Protegido
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usuarioService.remove(+id);
    return { message: 'Usuario eliminado' };
  }

  // RUTA PÚBLICA: No tiene @UseGuards
  @Post('register') 
  async register(@Body() createUsuarioDto: CreateUsuarioDto) {
    const user = await this.usuarioService.register(createUsuarioDto);
    const { password, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard) // Protegido
  @Get('logout/:id')
  async logout(@Param('id') id: string) {
    return { message: `Usted ha cerrado sesión` };
  }
}