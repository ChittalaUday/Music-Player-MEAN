import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import * as jwt_decode from 'jwt-decode'; // You may need to install this package

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5000'; // Base URL for API
  private loginUrl = `${this.apiUrl}/login`; // Login URL
  private registerUrl = `${this.apiUrl}/register`; // Register URL

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Login method
  login(email: string, password: string): Observable<any> {
    return this.http.post(this.loginUrl, { email, password });
  }

  // Register method
  register(userData: any): Observable<any> {
    return this.http.post(this.registerUrl, userData);
  }

  // Save the authentication data
  saveAuthData(token: string, user: any) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  // Get the token from local storage
  getToken(): string | null {
    return isPlatformBrowser(this.platformId)
      ? localStorage.getItem('authToken')
      : null;
  }

  // Get the user data from local storage
  getUser(): any {
    if (!isPlatformBrowser(this.platformId)) return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Check if the token is valid
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    return !this.isTokenExpired(token);
  }

  // Decode and check if the JWT token has expired
  private isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwt_decode.jwtDecode(token); // Decode the JWT
      if (decoded.exp) {
        // Check if the token is expired
        const expirationDate = new Date(decoded.exp * 1000); // Convert to milliseconds
        return expirationDate < new Date();
      }
      return false;
    } catch (e) {
      return true; // In case decoding fails, treat it as expired
    }
  }

  // Log out the user
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }
  }
}
