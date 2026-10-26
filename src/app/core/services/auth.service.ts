import { Injectable, signal, computed } from '@angular/core';

export type UserRole = 'admin' | 'user';

export interface UserSession {
  username: string;
  role: UserRole;
  isAuthenticated: boolean;
}

interface UserAccount {
  username: string;
  password: string;
  role: UserRole;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Clave empleada en la Web Storage API
  private readonly STORAGE_KEY = 'DAM2_AUTH_SESSION';

  // Usuarios permitidos en el sistema (simulación de backend)
  private readonly USERS: UserAccount[] = [
    { username: 'admin', password: '123', role: 'admin' },
    { username: 'operador', password: '123', role: 'user' }
  ];

  // Signal reactivo para el estado en memoria
  private _currentUser = signal<UserSession | null>(this.readSessionFromStorage());

  // Selectores computados de solo lectura expuestos a la aplicación
  public currentUser = this._currentUser.asReadonly();
  public isAuthenticated = computed(() => this._currentUser()?.isAuthenticated ?? false);
  public role = computed(() => this._currentUser()?.role ?? null);

  /**
   * Valida credenciales: admin / 123 (rol 'admin') y operador / 123 (rol 'user')
   */
  public login(user: string, pass: string): boolean {
    const account = this.USERS.find(u => u.username === user && u.password === pass);
    if (!account) {
      return false;
    }

    const sessionData: UserSession = {
      username: account.username,
      role: account.role,
      isAuthenticated: true
    };

    // 1. Guardar en memoria reactiva
    this._currentUser.set(sessionData);

    // 2. Persistir en el navegador (Web Storage API)
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData));

    return true;
  }

  /**
   * Destruye la sesión activa en memoria y en almacenamiento local
   */
  public logout(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    this._currentUser.set(null);
  }

  /**
   * Ruta de inicio que corresponde a cada rol
   */
  public homeRouteFor(role: UserRole | null): string {
    return role === 'admin' ? '/admin' : '/user-dashboard';
  }

  /**
   * Recupera la sesión al refrescar la página
   */
  private readSessionFromStorage(): UserSession | null {
    const rawData = sessionStorage.getItem(this.STORAGE_KEY);
    if (!rawData) {
      return null;
    }
    try {
      return JSON.parse(rawData) as UserSession;
    } catch {
      sessionStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  }
}
