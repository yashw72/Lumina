import { apiClient, isMockEnabled } from './client';

const MOCK_USERS_KEY = 'documentor_mock_users';
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getMockUsers = () => {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveMockUsers = (users) => {
  try {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
  } catch {
    // fallback
  }
};

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string }} credentials
 * @returns {Promise<{ accessToken: string, user: { id: number, name: string, email: string, created_at: string } }>}
 */
export async function signup({ name, email, password }) {
  if (isMockEnabled()) {
    // Demo mock implementation
    await delay(400);
    const users = getMockUsers();
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      const err = new Error('An account with this email already exists');
      err.status = 409;
      throw err;
    }

    const newUser = {
      id: users.length + 1,
      name: name.trim(),
      email: normalizedEmail,
      created_at: new Date().toISOString(),
    };
    users.push({ ...newUser, password });
    saveMockUsers(users);

    const fakeToken = `mock-token-${newUser.id}-${Date.now()}`;
    return {
      accessToken: fakeToken,
      user: newUser,
    };
  }

  const response = await apiClient.post('/auth/signup', { name, email, password });
  return {
    accessToken: response.data.access_token,
    user: response.data.user,
  };
}

/**
 * Log in with existing credentials.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ accessToken: string, user: { id: number, name: string, email: string, created_at: string } }>}
 */
export async function login({ email, password }) {
  if (isMockEnabled()) {
    // Demo mock implementation
    await delay(350);
    const users = getMockUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const matched = users.find((u) => u.email.toLowerCase() === normalizedEmail && u.password === password);

    if (!matched) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }

    const { password: _, ...user } = matched;
    const fakeToken = `mock-token-${user.id}-${Date.now()}`;
    return {
      accessToken: fakeToken,
      user,
    };
  }

  const response = await apiClient.post('/auth/login', { email, password });
  return {
    accessToken: response.data.access_token,
    user: response.data.user,
  };
}

/**
 * Retrieve profile of current authenticated user.
 * @returns {Promise<{ id: number, name: string, email: string, created_at: string }>}
 */
export async function getMe() {
  if (isMockEnabled()) {
    await delay(200);
    const users = getMockUsers();
    if (users.length > 0) {
      const { password: _, ...user } = users[0];
      return user;
    }
    const err = new Error('Not authenticated');
    err.status = 401;
    throw err;
  }

  const response = await apiClient.get('/auth/me');
  return response.data;
}

export default {
  signup,
  login,
  getMe,
};
