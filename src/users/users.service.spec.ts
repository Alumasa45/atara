import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let repo: ReturnType<typeof mockRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useFactory: mockRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get(getRepositoryToken(User));
    // mock oauth client verifyIdToken to avoid network calls
    (service as any).oauthClient = {
      verifyIdToken: jest.fn().mockResolvedValue({
        getPayload: () => ({ sub: 'sub123', email: 'google@u.com' }),
      }),
    };
  });

  it('login should return tokens on correct credentials', async () => {
    const password = 'secret123';
    const hashed = await bcrypt.hash(password, 10);
    const user = {
      user_id: 1,
      email: 'a@b.com',
      password: hashed,
      role: 'client',
    } as any;

    repo.findOne.mockResolvedValue(user);
    repo.update.mockResolvedValue(undefined);

    const res = await service.login('a@b.com', password);
    expect(res).toHaveProperty('accessToken');
    expect(res).toHaveProperty('refreshToken');
    expect(res.user.email).toBe('a@b.com');
  });

  it('login should throw on wrong password', async () => {
    const password = 'secret123';
    const hashed = await bcrypt.hash(password, 10);
    const user = { user_id: 1, email: 'a@b.com', password: hashed } as any;

    repo.findOne.mockResolvedValue(user);

    await expect(service.login('a@b.com', 'wrong')).rejects.toThrow();
  });

  it('google sign-in should create a new user when none exists', async () => {
    repo.findOne.mockResolvedValue(null);
    const saved = {
      user_id: 2,
      email: 'google@u.com',
      google_id: 'sub123',
      role: 'client',
    } as any;
    repo.save.mockResolvedValue(saved);

    const res = await service.loginWithGoogle(
      'sub123',
      'google@u.com',
      'guser',
      'dummy-token',
    );
    expect(res).toHaveProperty('accessToken');
    expect(res).toHaveProperty('refreshToken');
    expect(res.user.user_id).toBe(2);
  });
});
