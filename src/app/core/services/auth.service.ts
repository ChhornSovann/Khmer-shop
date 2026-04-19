import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private api = `${environment.apiUrl}/auth`;

  private _user = signal<User | null>(null);
  private _accessToken = signal<string | null>(localStorage.getItem('accessToken'));
  private _refreshToken = signal<string | null>(localStorage.getItem('refreshToken'));

  user = this._user.asReadonly();
  isLoggedIn = computed(() => !!this._accessToken());
  isAdmin = computed(() => this._user()?.role === 'admin');
  accessToken = this._accessToken.asReadonly();

  setTokens(access: string, refresh: string) {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    this._accessToken.set(access);
    this._refreshToken.set(refresh);
  }

  login(email: string, password: string) {
    return this.http.post<{ success: boolean; accessToken: string; refreshToken: string; data: User }>(`${this.api}/login`, { email, password }).pipe(
      tap(res => { this.setTokens(res.accessToken, res.refreshToken); this._user.set(res.data); })
    );
  }

  register(name: string, email: string, password: string, phone?: string) {
    return this.http.post<{ success: boolean; accessToken: string; refreshToken: string; data: User }>(`${this.api}/register`, { name, email, password, phone }).pipe(
      tap(res => { this.setTokens(res.accessToken, res.refreshToken); this._user.set(res.data); })
    );
  }

  refreshAccessToken() {
    const refreshToken = this._refreshToken();
    if (!refreshToken) return;
    return this.http.post<{ accessToken: string; refreshToken: string }>(`${this.api}/refresh`, { refreshToken }).pipe(
      tap(res => this.setTokens(res.accessToken, res.refreshToken))
    );
  }

  loadProfile() {
    this.http.get<{ data: User }>(`${this.api}/me`).subscribe({
      next: res => this._user.set(res.data),
      error: () => this.logout()
    });
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this._user.set(null);
    this.router.navigate(['/']);
  }

  updateProfile(data: Partial<User>) {
    return this.http.put<{ data: User }>(`${this.api}/profile`, data).pipe(tap(r => this._user.set(r.data)));
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.http.put(`${this.api}/change-password`, { currentPassword, newPassword });
  }

  addAddress(address: any) {
    return this.http.post<{ data: any[] }>(`${this.api}/addresses`, address).pipe(
      tap(r => this._user.update(u => u ? { ...u, addresses: r.data } : u))
    );
  }

  deleteAddress(id: string) {
    return this.http.delete<{ data: any[] }>(`${this.api}/addresses/${id}`).pipe(
      tap(r => this._user.update(u => u ? { ...u, addresses: r.data } : u))
    );
  }
}
