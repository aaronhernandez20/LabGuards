import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

/**
 * Factoría de guards: devuelve un CanActivateFn que solo deja pasar
 * a los usuarios cuyo rol coincide con allowedRole.
 */
export const roleGuard = (allowedRole: UserRole): CanActivateFn => {
  return (route, state): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Sin sesión: al login, recordando la URL solicitada
    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // Rol correcto: se permite la navegación
    const role = authService.role();
    if (role === allowedRole) {
      return true;
    }

    // Rol incorrecto (p. ej. 'user' en /admin): a su panel correspondiente
    return router.createUrlTree([authService.homeRouteFor(role)]);
  };
};
