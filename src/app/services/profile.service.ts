import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private baseUrl = 'http://localhost:8080/api/users';

  /** In-memory cache: userId -> profile URL */
  private profileUrlMap: Record<string, string | null> = {};
  /** Reactive map subject (for components that want to react to updates) */
  private profileMap$ = new BehaviorSubject<Record<string, string | null>>({});

  constructor(private http: HttpClient) {}

  /** Subscribe to all cached URLs (optional) */
  getProfileMap$(): Observable<Record<string, string | null>> {
    return this.profileMap$.asObservable();
  }

  /** Get cached URL for one user (Observable, may return null) */
  getProfileUrl(userId: string): Observable<string | null> {
    return of(this.profileUrlMap[userId] ?? null);
  }

  /**
   * Fetch public (or signed) profile image URL from backend.
   * If cached, returns immediately.
   */
  fetchProfileUrl(userId: string): Observable<{ signedUrl: string; contentType: string }> {
    const cached = this.profileUrlMap[userId];
    if (cached) {
      return of({ signedUrl: cached, contentType: 'image/png' });
    }

    return this.http
      .get<{ signedUrl: string; contentType: string }>(`${this.baseUrl}/${userId}/profile-image`)
      .pipe(
        tap((res) => {
          if (res && res.signedUrl) {
            this.setProfileUrl(userId, res.signedUrl);
          }
        }),
        catchError((err) => throwError(() => err))
      );
  }

  /** Upload and cache profile image per user */
  uploadProfileImage(userId: string, file: File): Observable<{ publicUrl: string; objectName?: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<{ publicUrl: string; objectName?: string }>(`${this.baseUrl}/${userId}/profile-image`, formData)
      .pipe(
        tap((res) => {
          if (res && res.publicUrl) {
            this.setProfileUrl(userId, res.publicUrl);
          }
        })
      );
  }

  /** Delete profile image and clear cache */
  deleteProfileImage(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${userId}/profile-image`).pipe(
      tap(() => this.clearProfileUrl(userId))
    );
  }

  /** Internal helpers */
  private setProfileUrl(userId: string, url: string): void {
    this.profileUrlMap[userId] = url;
    this.profileMap$.next({ ...this.profileUrlMap });
  }

  private clearProfileUrl(userId: string): void {
    delete this.profileUrlMap[userId];
    this.profileMap$.next({ ...this.profileUrlMap });
  }
}
