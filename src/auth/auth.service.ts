import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
    
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        private jwt: JwtService
    ) {}

    async register(email: string, password: string) {
        const exists = await this.userRepo.findOne({ where: { email } });
        if (exists) throw new ConflictException('Email already taken');

        const hash = await argon2.hash(password);

        const user = this.userRepo.create({ email, password: hash });
        await this.userRepo.save(user);
        return { message: 'User registered successfully' };
    }

    async login(email: string, password: string) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const pwMatches = await argon2.verify(user.password, password);
        if (!pwMatches) throw new UnauthorizedException('Invalid credentials');

        const token = await this.jwt.signAsync({ id: user.id, email: user.email });
        return { access_token: token };
    }

}