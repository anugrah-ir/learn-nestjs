import { Controller, UseGuards, Patch, Req, Body, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
    constructor (
        private userService: UserService
    ) {}

    @Patch()
    async changePassword(
        @Req() req: any,
        @Body('oldPassword') oldPassword: string,
        @Body('newPassword') newPassword: string
    ) {
        return this.userService.changePassword(req.user.id , oldPassword, newPassword);
    }

    @Delete()
    async deleteAccount(
        @Req() req: any
    ) {
        return this.userService.deleteAccount(req.user.id);
    }

}
