import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuarioModule } from '../usuario/usuario.module';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
	imports: [
		UsuarioModule,
		JwtModule.register({
			secret: 'supersecret', // Cambia esto por una variable de entorno en producción
			signOptions: { expiresIn: '1h' },
		}),
	],
	providers: [AuthService, JwtStrategy, JwtAuthGuard],
	controllers: [AuthController],
	exports: [AuthService],
})
export class AuthModule {}
