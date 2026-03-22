'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, getErrorMessage, LoginPayload, RegisterPayload } from '@/api/authService';

export function useLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (payload: LoginPayload, redirectTo = '/') => {
    setLoading(true);
    setError(null);
    try {
      await authService.login(payload);
      router.push(redirectTo);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}

export function useRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (payload: RegisterPayload, redirectTo = '/login') => {
    setLoading(true);
    setError(null);
    try {
      await authService.register(payload);
      router.push(redirectTo);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
}

export function useLogout() {
  const router = useRouter();

  const logout = async (redirectTo = '/login') => {
    await authService.logout();
    router.push(redirectTo);
  };

  return { logout };
}