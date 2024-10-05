import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    //see if email is in use
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('email in use');
    }
    //hash user password
    // generate salt
    const salt = randomBytes(8).toString('hex');

    //hash salt and password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    //join the hashed result and salt together
    const result = salt + '.' + hash.toString('hex');
    //create new user and save it
    const user = await this.usersService.create(email, result);

    //return the user
    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    // destructure salt and hash from stored password by spliting at '.'
    const [salt, storedHash] = user.password.split('.');

    // hash the provided password with the salt from the stored password
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // compare the stored hashed password with provided hashed password
    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('bad password');
    }

    return user;
  }
}
