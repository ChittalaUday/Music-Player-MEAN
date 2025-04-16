import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-music-player',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './music-player.component.html',
  styleUrls: ['./music-player.component.css']
})
export class MusicPlayerComponent implements OnInit {
  currentTrack: any = {
    title: 'Midnight City',
    artist: 'M83',
    album: 'Hurry Up, We\'re Dreaming',
    coverArt: 'https://via.placeholder.com/300',
    duration: 260, // in seconds
  };

  playlist: any[] = [
    {
      title: 'Midnight City',
      artist: 'M83',
      album: 'Hurry Up, We\'re Dreaming',
      coverArt: 'https://via.placeholder.com/300',
      duration: 260,
      active: true
    },
    {
      title: 'Starlight',
      artist: 'Muse',
      album: 'Black Holes and Revelations',
      coverArt: 'https://via.placeholder.com/300',
      duration: 240,
      active: false
    },
    {
      title: 'Intro',
      artist: 'The xx',
      album: 'xx',
      coverArt: 'https://via.placeholder.com/300',
      duration: 210,
      active: false
    },
    {
      title: 'Dreams',
      artist: 'Fleetwood Mac',
      album: 'Rumours',
      coverArt: 'https://via.placeholder.com/300',
      duration: 270,
      active: false
    }
  ];

  isPlaying: boolean = false;
  currentTime: number = 0;
  volume: number = 80;
  isMuted: boolean = false;
  prevVolume: number = 80;
  repeatMode: 'off' | 'all' | 'one' = 'off';
  isShuffleOn: boolean = false;
  showPlaylist: boolean = false;

  constructor() { }

  ngOnInit(): void {
    // Initialize player
  }

  togglePlay(): void {
    this.isPlaying = !this.isPlaying;
  }

  playPrevious(): void {
    // Logic to play previous track
    console.log('Playing previous track');
  }

  playNext(): void {
    // Logic to play next track
    console.log('Playing next track');
  }

  updateProgress(event: any): void {
    const percent = event.target.value;
    this.currentTime = (percent * this.currentTrack.duration) / 100;
  }

  updateVolume(event: any): void {
    this.volume = event.target.value;
    if (this.volume > 0) {
      this.isMuted = false;
    } else {
      this.isMuted = true;
    }
  }

  toggleMute(): void {
    if (this.isMuted) {
      this.volume = this.prevVolume;
      this.isMuted = false;
    } else {
      this.prevVolume = this.volume;
      this.volume = 0;
      this.isMuted = true;
    }
  }

  toggleRepeat(): void {
    if (this.repeatMode === 'off') {
      this.repeatMode = 'all';
    } else if (this.repeatMode === 'all') {
      this.repeatMode = 'one';
    } else {
      this.repeatMode = 'off';
    }
  }

  toggleShuffle(): void {
    this.isShuffleOn = !this.isShuffleOn;
  }

  togglePlaylist(): void {
    this.showPlaylist = !this.showPlaylist;
  }

  selectTrack(track: any): void {
    this.playlist.forEach(t => t.active = false);
    track.active = true;
    this.currentTrack = track;
    this.currentTime = 0;
    this.isPlaying = true;
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }

  getProgressPercentage(): number {
    return (this.currentTime / this.currentTrack.duration) * 100;
  }
}
