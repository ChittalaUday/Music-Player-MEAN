import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Playlist {
  _id?: string;
  name: string;
  description?: string;
  userId: string;
  songIds: string[];
  createdAt?:string
}

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private baseUrl = 'http://localhost:5000/playlist';

  constructor(private http: HttpClient) {}

  // Create a new playlist
  createPlaylist(playlist: Playlist): Observable<Playlist> {
    return this.http.post<Playlist>(`${this.baseUrl}`, playlist);
  }

  // Get playlists for a user
  getUserPlaylists(userId: string): Observable<Playlist[]> {
    // Fix the URL to correctly match the backend route
    return this.http.get<Playlist[]>(`${this.baseUrl}s/${userId}`);
  }

  // Get a specific playlist by ID
  getPlaylistById(playlistId: string): Observable<Playlist> {
    return this.http.get<Playlist>(`${this.baseUrl}/${playlistId}`);
  }

  // Add multiple songs to a playlist
  addSongsToPlaylist(playlistId: string, songIds: string[]): Observable<Playlist> {
    return this.http.put<Playlist>(`${this.baseUrl}/${playlistId}/add-song`, { songIds });
  }

  // Remove multiple songs from a playlist
  removeSongsFromPlaylist(playlistId: string, songIds: string[]): Observable<Playlist> {
    return this.http.put<Playlist>(`${this.baseUrl}/${playlistId}/remove-song`, { songIds });
  }
}
