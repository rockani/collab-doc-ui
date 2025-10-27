import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$: WebSocketSubject<any> ;
  constructor() {
    this.socket$ = new WebSocketSubject(`ws://localhost:8080/ws/document`);
  }
  connect(docId: string) {
    this.socket$ = new WebSocketSubject(`ws://localhost:8080/ws/document?docId=${docId}`);
    return this.socket$;
  }

  sendMessage(message: any) {
    this.socket$.next(message);
  }

  close() {
    this.socket$.complete();
  }
}