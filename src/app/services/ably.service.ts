import { Injectable } from '@angular/core';
import { Realtime, RealtimeChannel } from 'ably';

@Injectable({ providedIn: 'root' })
export class AblyService {
  private ably: Realtime;
  private channel!: RealtimeChannel;

  constructor() {
    this.ably = new Realtime({
      key: 'your-ably-api-key', // replace with your Ably key
      clientId: 'user-' + Math.random().toString(36).substring(2, 7),
    });
  }

  joinRoom(docId: string) {
    this.channel = this.ably.channels.get(`doc:${docId}`);

    // Subscribe to cursor updates
    this.channel.subscribe('cursor', (msg) => {
      const data = msg.data;
      console.log('Cursor update:', data);
      // TODO: emit this event to components via Subject or EventEmitter
    });

    // Enter presence
    this.channel.presence.enter({ name: 'User Name' });

    // Subscribe to presence events
    this.channel.presence.subscribe('enter', (member) => {
      console.log(`${member.clientId} joined`);
    });

    this.channel.presence.subscribe('leave', (member) => {
      console.log(`${member.clientId} left`);
    });
  }

  updateCursor(x: number, y: number) {
    if (!this.channel) return;
    this.channel.publish('cursor', { x, y });
  }

  leaveRoom() {
    if (!this.channel) return;
    this.channel.presence.leave();
    this.channel.detach();
  }
}
