  // src/app/services/song.service.ts

  import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
  import { Injectable } from '@angular/core';
  import { Observable } from 'rxjs';

  export interface Song {
    _id?: string;
    songId?: string;
    title: string;
    artist: string;
    artists: string[];
    composer: string | string[];
    album?: string;
    year?: number;
    genre: string[];
    duration?: number;
    bitrate?: number;
    sampleRate?: number;
    channels?: number;
    format?: string;
    fileSize?: number;
    originalFilename?: string;
    uploadDate?: string;
    fileUrl?: string;
    tags?: string[];
    userId?: string;
    coverImageUrl?: string;
  }

  @Injectable({
    providedIn: 'root'
  })
  export class SongService {
    private apiUrl = 'http://localhost:5000'; // Replace with your actual API base URL

    constructor(private http: HttpClient) {}

    getAllSongs(): Observable<{ success: boolean; data: Song[] }> {
      return this.http.get<{ success: boolean; data: Song[] }>(`${this.apiUrl}/songs`);
    }

    uploadSong(file: File, token: string): Observable<any> {
      const formData = new FormData();
      formData.append('songFile', file);

      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });

      return this.http.post(`${this.apiUrl}/songs/upload`, formData, { headers });
    }

    getSongDetails(id: string): Observable<{ success: boolean; data: Song }> {
      return this.http.get<{ success: boolean; data: Song }>(`${this.apiUrl}/songs/${id}`);
    }

    deleteSong(id: string, token: string): Observable<{ success: boolean; message: string }> {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });

      return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/songs/${id}`, { headers });
    }

    searchSongs(query: string): Observable<{ success: boolean; results: number; data: Song[] }> {
      const params = new HttpParams().set('query', query);
      return this.http.get<{ success: boolean; results: number; data: Song[] }>(`${this.apiUrl}/search`, { params });
    }

    addTags(songId: string, tags: string[]): Observable<any> {
      return this.http.post(`${this.apiUrl}/songs/${songId}/add-tags`, { tags });
    }

    removeTags(songId: string, tags: string[]): Observable<any> {
      return this.http.post(`${this.apiUrl}/songs/${songId}/remove-tags`, { tags });
    }


  }
