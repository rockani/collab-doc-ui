import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
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
        this.documentUpdates.next(JSON.parse(message.body).content);
      });
    };

    this.stompClient.activate();
  }

  sendUpdate(content: string) {
    this.stompClient.publish({
      destination: '/app/edit',
      body: JSON.stringify({ content }),
    });
  }

  getUpdates() {
    return this.documentUpdates.asObservable();
  }
}
