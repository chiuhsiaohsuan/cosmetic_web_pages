import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = () => {

  const auth = inject(AuthService);
  const router = inject(Router);

  // 是否已登入
  if (!auth.isLogin()) {
    router.navigate(['/login']);
    return false;
  }

  const user = auth.getUser();

  // 是否為管理員
  if (!user || user.role !== 'admin') {
    router.navigate(['/']);
    return false;
  }

  return true;
};