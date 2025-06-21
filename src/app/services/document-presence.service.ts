// src/app/services/document-presence.service.ts

import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DocumentPresenceService {
  private supabase: SupabaseClient;
  private presenceChannel: any;
  private usersSubject = new BehaviorSubject<{ userId: string; userName: any; }[]>([]);
  public users$ = this.usersSubject.asObservable();
  constructor() {
    this.supabase = createClient(
      'https://mukmtvtkpjphkvchyyha.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11a210dnRrcGpwaGt2Y2h5eWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNTA3NDEsImV4cCI6MjA2NTgyNjc0MX0.u9aqiFR72oGzmmZh0wOykKI14Rm4om8fHrNu5asuTVk'
    );
  }

  joinDocumentRoom(documentId: string, userId: string, userName: string) {
    const roomName = `presence-${documentId}`;
    this.presenceChannel = this.supabase.channel(roomName, {
      config: { presence: { key: userId } },
    });

    this.presenceChannel
    .on('presence', { event: 'sync' }, () => {
      const state = this.presenceChannel.presenceState();
      
      const users = Object.entries(state).map(([id, entries]: [string, any]) => {
        // multiple entries possible if user is connected on multiple tabs
        const mostRecent = entries[entries.length - 1];
        return {
          userId: id,
          userName: mostRecent.userName,
        };
      });

      this.usersSubject.next(users);  // Emit array of { userId, userName }
    })
    .subscribe(async (status: string) => {
      if (status === 'SUBSCRIBED') {
        await this.presenceChannel.track({ userName });  // userId already used as `key`
      }
    });
  }

  leaveDocumentRoom() {
    if (this.presenceChannel) {
      this.presenceChannel.unsubscribe();
    }
  }
}
