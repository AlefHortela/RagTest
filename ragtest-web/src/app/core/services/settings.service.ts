import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-config';
import { AppSettings } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly baseUrl = `${API_BASE_URL}/settings`;

  constructor(private http: HttpClient) {}

  get(): Observable<AppSettings> {
    return this.http.get<AppSettings>(this.baseUrl);
  }

  update(settings: AppSettings): Observable<AppSettings> {
    return this.http.put<AppSettings>(this.baseUrl, settings);
  }
}
