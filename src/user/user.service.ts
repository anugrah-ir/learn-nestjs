import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity'
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>
    ) {}

    async findByID(id: string) {
        const user = await this.userRepo.findOne({ where: { id } });
        if(!user) {
            throw new NotFoundException('User not found');
        }

        return user
    }

    async getProfile(id: string) {
        const user = await this.findByID(id);
        const { password, ...result } = user;
        return result;
    }

    async changePassword(id: string, oldPassword: string, newPassword: string) {
        const user = await this.findByID(id);

        const matches = await argon2.verify(user.password, oldPassword);
        if(!matches) {
            throw new BadRequestException('Old password is incorrect');
        }

        user.password = await argon2.hash(newPassword);
        await this.userRepo.save(user);

        return { message: 'Password updated successfully'};
    }

    async deleteAccount(id: string) {
        const result = await this.userRepo.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('User not found');
        }

        return { message: 'Account deleted successfully'};
    }
}
