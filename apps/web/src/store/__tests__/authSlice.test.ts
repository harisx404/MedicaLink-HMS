import { describe, it, expect, vi } from 'vitest';
import authReducer, { setToken, setCredentials, logout, setRequires2FA } from '../../store/slices/authSlice';

// Mock localStorage for the initial state getter
const localStorageMock = {
  getItem: vi.fn().mockReturnValue(null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('Auth Slice (Redux)', () => {
  const initialState = authReducer(undefined, { type: 'unknown' });

  it('returns the correct initial state', () => {
    expect(initialState.isAuthenticated).toBe(false);
    expect(initialState.token).toBeNull();
    expect(initialState.user).toBeNull();
    expect(initialState.requires2FA).toBe(false);
  });

  it('stores the access token via setToken', () => {
    const state = authReducer(initialState, setToken('jwt-test-token-abc'));
    expect(state.token).toBe('jwt-test-token-abc');
  });

  it('stores user and token via setCredentials and marks as authenticated', () => {
    const mockUser = {
      _id: 'user-123',
      email: 'doctor@hospital.com',
      firstName: 'John',
      lastName: 'Smith',
      role: 'DOCTOR' as const,
      tenantId: 'tenant-abc',
      isActive: true,
    };

    const state = authReducer(
      initialState,
      setCredentials({
        user: mockUser as any,
        token: 'access-token-xyz',
        tenantSlug: 'city-hospital',
      })
    );

    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('access-token-xyz');
    expect(state.isAuthenticated).toBe(true);
    expect(state.tenantSlug).toBe('city-hospital');
    expect(state.requires2FA).toBe(false);
  });

  it('sets 2FA requirement with temp user ID', () => {
    const state = authReducer(
      initialState,
      setRequires2FA({ tempUserId: 'temp-user-456' })
    );

    expect(state.requires2FA).toBe(true);
    expect(state.tempUserId).toBe('temp-user-456');
  });

  it('clears auth state on logout but preserves tenantSlug', () => {
    // Start with authenticated state
    const authenticatedState = authReducer(
      initialState,
      setCredentials({
        user: { _id: '123', email: 'test@test.com', role: 'DOCTOR' } as any,
        token: 'some-token',
        tenantSlug: 'hospital-a',
      })
    );

    const state = authReducer(authenticatedState, logout());
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    // tenantSlug is preserved so user can re-login to same hospital
    expect(state.tenantSlug).toBe('hospital-a');
  });
});
