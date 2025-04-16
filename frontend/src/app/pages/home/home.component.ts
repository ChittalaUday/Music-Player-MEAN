import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  // Declare a variable to store the localStorage data
  storedData: any = null; // Use 'any' type to handle parsed JSON
  name: string = '';

  constructor() { }

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.storedData = JSON.parse(userData);
      console.log(this.storedData);
      this.name = this.storedData.name; // Access the 'name' property
    }
  }
}
