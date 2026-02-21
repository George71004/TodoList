import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { TypeOrmModule } from '@nestjs/typeorm'; // <-- Importación necesaria
import { Usuario } from './entities/usuario.entity'; // <-- Importación necesaria

@Module({
  // 1. Importar TypeOrmModule
  // 2. Registrar la Entidad Usuario usando forFeature()
  imports: [TypeOrmModule.forFeature([Usuario])], 
  controllers: [UsuarioController],
  providers: [UsuarioService],
  // 3. Exportar el servicio (necesario si otros módulos como AuthModule lo usarán)
  exports: [UsuarioService, TypeOrmModule] 
})
export class UsuarioModule {}