import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import type {
  SafeUser,
  RegisterUserDto,
  LoginUserDto,
  UpdateUserDto,
} from '../models';

/* ---------- 1. mocking only apiService ---------- */
vi.mock('./ApiService', () => ({
  apiService: {
    getToken: vi.fn(),
    setToken: vi.fn(),
    clearToken: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    postFormUrlEncoded: vi.fn(),
    put: vi.fn(),
  },
}));

/* ---------- 2. importing the mock ---------- */
import { apiService } from './ApiService';

/* ---------- 3. late import of userService ---------- */
let userService: typeof import('./UserService')['userService'];

beforeAll(async () => {
  vi.resetModules();
  const mod = await vi.importActual<typeof import('./UserService')>('./UserService');
  userService = mod.userService;
});

/* ---------- 4. tests ---------- */
describe('UserService', () => {
  /* --- common fixtures --- */
  const safeUser: SafeUser = {
    id: 'u1',
    username: 'tester',
    email: 't@test.com',
    is_admin: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const registerDto: RegisterUserDto = {
    username: 'tester',
    email: 't@test.com',
    password: 'pwd',
    continent: 'EU',
  };

  const loginDto: LoginUserDto = { email: 't@test.com', password: 'pwd' };
  const updateDto: UpdateUserDto = { username: 'newName' };
  const tokenResp = { access_token: 'tok', token_type: 'bearer' };

  beforeEach(() => {
    vi.clearAllMocks();
    userService.logout(); // Reset userService state between tests
  });
  afterEach(() => vi.resetAllMocks());

  /* ---------- addAuthStateListener / removeAuthStateListener ---------- */
  describe('auth state listeners', () => {
    it('callback is called immediately and after login', async () => {
      const cb = vi.fn();
      userService.addAuthStateListener(cb);        // immediately null
      expect(cb).toHaveBeenCalledWith(null);

      vi.mocked(apiService.postFormUrlEncoded).mockResolvedValueOnce(tokenResp);
      vi.mocked(apiService.get).mockResolvedValueOnce(safeUser);
      await userService.login(loginDto);

      expect(cb).toHaveBeenLastCalledWith(safeUser);
    });

    it('removeAuthStateListener unsubscribes the callback', async () => {
      const cb = vi.fn();
      userService.addAuthStateListener(cb);
      userService.removeAuthStateListener(cb);
      cb.mockClear();

      vi.mocked(apiService.postFormUrlEncoded).mockResolvedValueOnce(tokenResp);
      vi.mocked(apiService.get).mockResolvedValueOnce(safeUser);
      await userService.login(loginDto);

      expect(cb).not.toHaveBeenCalled();
    });
  });

  /* ---------- register ---------- */
  describe('register', () => {
    it('success', async () => {
      vi.mocked(apiService.post).mockResolvedValueOnce(safeUser);
      const res = await userService.register(registerDto);

      expect(apiService.post).toHaveBeenCalledWith('/auth/register', registerDto);
      expect(res).toEqual(safeUser);
    });

    it('error', async () => {
      vi.mocked(apiService.post).mockRejectedValueOnce(new Error('fail'));
      await expect(userService.register(registerDto)).rejects.toThrow('fail');
    });
  });

  /* ---------- login ---------- */
  describe('login', () => {
    it('success', async () => {
      vi.mocked(apiService.postFormUrlEncoded).mockResolvedValueOnce(tokenResp);
      vi.mocked(apiService.get).mockResolvedValueOnce(safeUser);

      const res = await userService.login(loginDto);

      expect(apiService.postFormUrlEncoded).toHaveBeenCalledWith('/auth/login', {
        username: loginDto.email,
        password: loginDto.password,
      });
      expect(apiService.setToken).toHaveBeenCalledWith(tokenResp.access_token);
      expect(apiService.get).toHaveBeenCalledWith('/users/me');
      expect(res).toEqual(safeUser);
    });

    it('error', async () => {
      vi.mocked(apiService.postFormUrlEncoded).mockRejectedValueOnce(new Error('bad'));
      await expect(userService.login(loginDto)).rejects.toThrow('bad');
    });
  });

  /* ---------- logout ---------- */
  describe('logout', () => {
    it('clears token and currentUser', () => {
      userService.logout();
      expect(apiService.clearToken).toHaveBeenCalled();
      expect(userService.getCurrentUser()).toBeNull();
    });
  });

  /* ---------- getCurrentUser ---------- */
  describe('getCurrentUser', () => {
    it('returns user after login', async () => {
      vi.mocked(apiService.postFormUrlEncoded).mockResolvedValueOnce(tokenResp);
      vi.mocked(apiService.get).mockResolvedValueOnce(safeUser);
      await userService.login(loginDto);

      expect(userService.getCurrentUser()).toEqual(safeUser);
    });

    it('null without login', () => {
      expect(userService.getCurrentUser()).toBeNull();
    });
  });

  /* ---------- updateUser ---------- */
  describe('updateUser', () => {
    it('updates current user', async () => {
      // login first
      vi.mocked(apiService.postFormUrlEncoded).mockResolvedValueOnce(tokenResp);
      vi.mocked(apiService.get).mockResolvedValueOnce(safeUser);
      await userService.login(loginDto);

      const updated = { ...safeUser, username: updateDto.username };
      vi.mocked(apiService.put).mockResolvedValueOnce(updated);

      const res = await userService.updateUser(safeUser.id, updateDto);

      expect(apiService.put).toHaveBeenCalledWith('/users/me', updateDto);
      expect(res).toEqual(updated);
    });

    it('error when trying to update another user', async () => {
      vi.mocked(apiService.postFormUrlEncoded).mockResolvedValueOnce(tokenResp);
      vi.mocked(apiService.get).mockResolvedValueOnce(safeUser);
      await userService.login(loginDto);

      await expect(userService.updateUser('other', updateDto)).rejects.toThrow(
          'Can only update the current user',
      );
    });

    it('put error', async () => {
      vi.mocked(apiService.postFormUrlEncoded).mockResolvedValueOnce(tokenResp);
      vi.mocked(apiService.get).mockResolvedValueOnce(safeUser);
      await userService.login(loginDto);

      vi.mocked(apiService.put).mockRejectedValueOnce(new Error('fail'));
      await expect(userService.updateUser(safeUser.id, updateDto)).rejects.toThrow('fail');
    });
  });

  /* ---------- getUserById ---------- */
  describe('getUserById', () => {
    it('success', async () => {
      vi.mocked(apiService.get).mockResolvedValueOnce(safeUser);
      const res = await userService.getUserById(safeUser.id);

      expect(apiService.get).toHaveBeenCalledWith(`/users/${safeUser.id}`);
      expect(res).toEqual(safeUser);
    });

    it('error', async () => {
      vi.mocked(apiService.get).mockRejectedValueOnce(new Error('404'));
      await expect(userService.getUserById('wrong')).rejects.toThrow('404');
    });
  });
});
