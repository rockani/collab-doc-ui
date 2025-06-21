import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
///templateUrl: './app.component.html',
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  login() { console.log("Logging in..."); }
}
