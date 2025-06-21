import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Permissions</h2>
    <p>Manage user access levels here.</p>
  `,
  styleUrls: ['./permissions.component.css']
})
export class PermissionsComponent {}
