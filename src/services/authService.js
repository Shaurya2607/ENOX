import { api, setAuthToken } from './api';

class AuthService {
  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    setAuthToken(res.token);
    return res;
  }

  async register(credentials) {
    const res = await api.post('/auth/register', credentials);
    setAuthToken(res.token);
    return res;
  }

  async forgotPassword(email) {
    return api.post('/auth/forgot-password', { email });
  }

  async logout() {
    setAuthToken(null);
  }

  async getCurrentUser() {
    try {
      return await api.get('/auth/me');
    } catch {
      return null;
    }
  }

  async getToken() {
    return localStorage.getItem('enox_token');
  }
}

export const authService = new AuthService();
