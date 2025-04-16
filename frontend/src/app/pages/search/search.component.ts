import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SongService, Song } from '../../services/song.service';
import { FormatDurationPipe } from '../../pipes/format-duration.pipe';
import { SongCardComponent } from '../../components/song-card/song-card.component';
import { SongInfoComponent } from '../../components/song-info/song-info.component';
import { PlaylistService, Playlist } from '../../services/playlist.service';
import { UserService } from '../../services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  selector: 'app-search',
  imports: [
    CommonModule,
    FormsModule,
    SongInfoComponent,
    SongCardComponent,
    MatSnackBarModule
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  searchTerm = '';
  songs: Song[] = [];
  selectedSong: Song | null = null;
  currentlyPlayingSong: Song | null = null;
  favorites: string[] = [];
  library: Set<string> = new Set();
  playlists: Playlist[] = [];
  showPlaylistSelector = false;
  selectedPlaylistId: string | null = null;
  userId = '';
  showSongCard = false;

  constructor(
    private songService: SongService,
    private playlistService: PlaylistService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const parseUser = JSON.parse(localStorage.getItem('user') || '{}');
    this.userId = parseUser._id;

    this.songService.getAllSongs().subscribe({
      next: (res) => {
        this.songs = res.data;
      },
      error: (err) => {
        this.showMessage('Failed to load songs', true);
        console.error(err);
      }
    });

    this.userService.loadFavorites(this.userId);
    this.userService.favorites$.subscribe({
      next: (favIds: string[]) => {
        this.favorites = favIds;
      },
      error: (err) => {
        this.showMessage('Failed to get favorites', true);
        console.error(err);
      }
    });
    console.log(this.favorites);
  }

  showSongDetails(song: Song) {
    this.selectedSong = song;
    this.showSongCard = true;
  }

  get filteredSongs() {
    const lowerSearch = this.searchTerm.toLowerCase();
    return this.songs.filter(song =>
      song.title.toLowerCase().includes(lowerSearch) ||
      song.artist.toLowerCase().includes(lowerSearch)
    );
  }

  openSongDetails(song: Song): void {
    this.selectedSong = song;
  }

  playSong(song: Song): void {
    this.currentlyPlayingSong = song;
    this.showMessage(`Playing: ${song.title}`);
  }

  pauseSong(): void {
    if (this.currentlyPlayingSong) {
      this.showMessage(`Paused: ${this.currentlyPlayingSong.title}`);
    }
    this.currentlyPlayingSong = null;
  }

  isPlaying(song: Song): boolean {
    return this.currentlyPlayingSong?._id === song._id;
  }

  isFavorite(song: Song): boolean {
    return this.favorites.includes(song._id || '');
  }

  isInLibrary(song: Song): boolean {
    return this.library.has(song._id || '');
  }

  toggleFavorite(song: Song): void {
    const id = song._id || '';
    if (this.favorites.includes(id)) {
      this.userService.removeFromFavorites(this.userId, id).subscribe({
        next: () => this.showMessage(`Removed from favorites: ${song.title}`),
        error: () => this.showMessage('Failed to remove from favorites', true)
      });
    } else {
      this.userService.addToFavorites(this.userId, id).subscribe({
        next: () => this.showMessage(`Added to favorites: ${song.title}`),
        error: () => this.showMessage('Failed to add to favorites', true)
      });
    }
  }

  addToLibrary(song: Song): void {
    const id = song._id || '';
    this.library.add(id);
    this.showMessage(`Added to library: ${song.title}`);
  }

  removeFromLibrary(song: Song): void {
    const id = song._id || '';
    this.library.delete(id);
    this.showMessage(`Removed from library: ${song.title}`);
  }

  openPlaylistDialog(song: Song): void {
    this.fetchPlaylists();
    this.showPlaylistSelector = true;
    this.selectedSong = song;
  }

  fetchPlaylists(): void {
    this.playlistService.getUserPlaylists(this.userId).subscribe({
      next: (playlists) => (this.playlists = playlists),
      error: () => this.showMessage('Failed to fetch playlists', true)
    });
  }

  confirmAddToPlaylist(): void {
    if (this.selectedPlaylistId && this.selectedSong?._id) {
      this.playlistService.addSongsToPlaylist(this.selectedPlaylistId, [this.selectedSong._id]).subscribe({
        next: () => {
          this.showMessage('Song added to playlist');
          this.showPlaylistSelector = false;
          this.selectedPlaylistId = null;
        },
        error: () => this.showMessage('Failed to add song to playlist', true)
      });
    }
  }

  cancelPlaylistSelection(): void {
    this.showPlaylistSelector = false;
    this.selectedPlaylistId = null;
  }

  private showMessage(message: string, isError = false): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: isError ? ['snackbar-error'] : ['snackbar-success'],
      horizontalPosition: 'right',
      verticalPosition: 'bottom'
    });
  }
}
