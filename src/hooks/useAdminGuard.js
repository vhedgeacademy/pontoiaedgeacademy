import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAdminGuard() {
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('ponto_ai_user');
    const token = localStorage.getItem('ponto_ai_token');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (!user.admin) {
        router.push('/');
      }
    } catch (e) {
      router.push('/login');
    }
  }, [router]);
}
