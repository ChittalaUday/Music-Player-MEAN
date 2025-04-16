import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  standalone: true,
  imports:[CommonModule],
  selector: 'app-liked-songs',
  templateUrl: './liked-songs.component.html',
  styleUrls: ['./liked-songs.component.css']
})
export class LikedSongsComponent {
  likedSongs = [
    { title: 'Blinding Lights', artist: 'The Weeknd', emoji: '✨' },
    { title: 'Levitating', artist: 'Dua Lipa', emoji: '🚀' },
    { title: 'Peaches', artist: 'Justin Bieber', emoji: '🍑' },
    { title: 'Watermelon Sugar', artist: 'Harry Styles', emoji: '🍉' }
  ];
}
