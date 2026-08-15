import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-config';
import { Attachment, Occurrence, OccurrenceCreateRequest } from '../models/occurrence.model';

@Injectable({ providedIn: 'root' })
export class OccurrenceService {
  private readonly baseUrl = `${API_BASE_URL}/occurrences`;

  constructor(private http: HttpClient) {}

  list(): Observable<Occurrence[]> {
    return this.http.get<Occurrence[]>(this.baseUrl);
  }

  get(id: string): Observable<Occurrence> {
    return this.http.get<Occurrence>(`${this.baseUrl}/${id}`);
  }

  create(request: OccurrenceCreateRequest): Observable<Occurrence> {
    return this.http.post<Occurrence>(this.baseUrl, request);
  }

  uploadAttachment(occurrenceId: string, file: File): Observable<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Attachment>(`${this.baseUrl}/${occurrenceId}/attachments`, formData);
  }
}
