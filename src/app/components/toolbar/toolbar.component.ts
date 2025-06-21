import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toolbar">
      <button (click)="format('bold')"><b>B</b></button>
      <button (click)="format('italic')"><i>I</i></button>
      <button (click)="format('underline')"><u>U</u></button>
      <button (click)="exportDocument()">Export</button>
    </div>
  `,
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent {
  format(command: string) { document.execCommand(command, false, ""); }
  exportDocument() { console.log("Exporting document..."); }
}
