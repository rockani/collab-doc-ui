import { Component, ElementRef, ViewChild } from '@angular/core';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  imports: [FormsModule,CommonModule,QuillModule],
  styleUrls: ['./editor.component.css']
})
export class EditorComponent {
  @ViewChild('editor') editor!: ElementRef;
  messageContent: string = '';
  messages: string[] = [];
  activeUsers: { name: string }[] = [];

  private stompClient!: Client;
  private documentUpdates = new BehaviorSubject<string>('');

  constructor() {
    this.connect();
  }

  private connect() {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      debug: (str) => console.log(str),
    });

    this.stompClient.onConnect = () => {
      this.stompClient.subscribe('/topic/document', (message) => {
        console.log("connected")
        this.showMessage(JSON.parse(message.body));
        //this.documentUpdates.next(JSON.parse(message.body).content);
      });
    };

    this.stompClient.activate();
  }

//   sendUpdate(content: string) {
//     this.stompClient.publish({
//       destination: '/app/edit',
//       body: JSON.stringify({ content }),
//     });
//   }

//   getUpdates() {
//     return this.documentUpdates.asObservable();
//   }

//   connectWebSocket() {
//     const socket = new SockJS('/ws');
//     this.stompClient = new Client({
//       webSocketFactory: () => socket,
//       debug: (str) => console.log(str),
//       reconnectDelay: 5000
//     });
    
//     this.stompClient.onConnect = (frame) => {
//       console.log('Connected: ' + frame);
//       this.stompClient?.subscribe('/topic/document', (messageOutput) => {
//         this.showMessage(JSON.parse(messageOutput.body));
//       });
//     };
    
//     this.stompClient.activate();

    
//   }

  disconnectWebSocket() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      console.log("Disconnected");
    }
  }

  sendMessage() {
    if (this.stompClient && this.stompClient.connected && this.messageContent) {
      this.stompClient.publish({
        destination: '/app/edit',
        body: JSON.stringify({ 'content': this.messageContent })
      });
      this.messageContent = '';
    }
  }

  showMessage(message: { content: string }) {
    this.messages.push(message.content);
  }

  format(command: string) {
    document.execCommand(command, false, '');
  }

  exportDocument() {
    const content = this.editor.nativeElement.innerHTML;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
  }

  onContentChange(event: any) {
    console.log('Content changed:', event.target.innerHTML);
  }
}
