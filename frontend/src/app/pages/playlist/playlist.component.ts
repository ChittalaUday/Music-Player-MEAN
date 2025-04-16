import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, NavigationEnd, Router } from '@angular/router';
import { PlaylistService, Playlist } from '../../services/playlist.service';
import { SongService, Song } from '../../services/song.service';
import { Subscription, filter } from 'rxjs';
import { FormatDurationPipe } from '../../pipes/format-duration.pipe';

@Component({
  standalone: true,
  imports: [CommonModule,FormatDurationPipe, RouterModule],
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css']
})
export class PlaylistComponent implements OnInit, OnDestroy {
  playlist: Playlist | null = null;
  songs: (Song & { isPlaying?: boolean })[] = [];
  loading = true;
  error: string | null = null;
  totalDuration = 0;

  private routeSub?: Subscription;
  private navigationSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private playlistService: PlaylistService,
    private songService: SongService
  ) {}

  ngOnInit(): void {
    // Initial data load
    this.loadPlaylistData();

    // Subscribe to router events to detect when the component is revisited
    this.navigationSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Check if this is the same component being revisited
      if (this.router.url.includes('/playlist/')) {
        console.log('Playlist component revisited, refreshing data...');
        this.refreshData();
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.navigationSub) {
      this.navigationSub.unsubscribe();
    }
  }

  refreshData(): void {
    this.loading = true;
    this.error = null;
    this.songs = [];
    this.loadPlaylistData();
  }

  loadPlaylistData(): void {
    const playlistId = this.route.snapshot.paramMap.get('id');
    if (playlistId) {
      this.fetchPlaylist(playlistId);
    } else {
      this.error = 'No playlist ID provided';
      this.loading = false;
    }
  }

  fetchPlaylist(id: string): void {
    this.playlistService.getPlaylistById(id).subscribe(
      (playlist) => {
        this.playlist = playlist;
        this.fetchSongs(playlist.songIds);
        console.log('Playlist loaded:', playlist.name);
      },
      (error) => {
        console.error('Error fetching playlist:', error);
        this.error = 'Failed to load playlist';
        this.loading = false;
      }
    );
  }

  fetchSongs(songIds: string[]): void {
    if (!songIds || songIds.length === 0) {
      this.songs = [];
      this.loading = false;
      return;
    }

    const requests = songIds.map(id => this.songService.getSongDetails(id).toPromise());

    Promise.all(requests)
      .then(responses => {
        this.songs = responses
          .filter((r): r is { success: boolean; data: Song } => !!r && r.success && !!r.data)
          .map(r => ({
            ...r.data,
            isPlaying: false
          }));
        console.log(`Loaded ${this.songs.length} songs`);
        this.calculateTotalDuration();
      })
      .catch((err) => {
        console.error('Error fetching songs:', err);
        this.error = 'Failed to load songs';
      })
      .finally(() => {
        this.loading = false;
      });
  }

  calculateTotalDuration(): void {
    let totalSeconds = 0;

    this.songs.forEach(song => {
      if (typeof song.duration === 'number') {
        totalSeconds += song.duration;
      }
    });

    this.totalDuration = totalSeconds;
  }



  playSong(song: Song & { isPlaying?: boolean }): void {
    // Reset all songs to not playing
    this.songs.forEach(s => s.isPlaying = false);

    // Toggle the selected song
    song.isPlaying = true;

    console.log('Playing:', song.title);
    // Here you would typically call a service to actually play the song
  }

  playAll(): void {
    if (this.songs.length > 0) {
      this.playSong(this.songs[0]);
    }
  }

  deleteSong(index: number): void {
    // In a real app, you'd want to show a confirmation dialog
    if (confirm(`Remove "${this.songs[index].title}" from this playlist?`)) {
      // You'd typically call an API to update the playlist
      const removedSong = this.songs[index];

      this.songs.splice(index, 1);
      if (this.playlist?.songIds) {
        this.playlist.songIds.splice(index, 1);
        console.log(`Removed song: ${removedSong.title}`);

        // Here you would typically update the playlist on the server
        // this.playlistService.updatePlaylist(this.playlist).subscribe(...)
      }

      // Recalculate duration after deletion
      this.calculateTotalDuration();
    }
  }
}
