import { Injectable, OnDestroy } from '@angular/core';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';

export interface CursorUpdate {
  userId: string;
  x: number;
  y: number;
  position: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentPresenceService implements OnDestroy {
  private static supabase: SupabaseClient; // ✅ static ensures single instance globally
  private presenceChannel?: RealtimeChannel;
  private currentUserId: string = '';

  private usersSubject = new BehaviorSubject<{ userId: string; userName: string }[]>([]);
  public users$ = this.usersSubject.asObservable();

  private cursorsMap = new Map<string, CursorUpdate>();
  private cursorsSubject = new BehaviorSubject<CursorUpdate[]>([]);
  public cursors$ = this.cursorsSubject.asObservable();

  constructor() {
    if (!DocumentPresenceService.supabase) {
      DocumentPresenceService.supabase = createClient(
        'https://lwccoczclqtbutmdhcau.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3Y2NvY3pjbHF0YnV0bWRoY2F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTYxMjEsImV4cCI6MjA3Njk5MjEyMX0.TXaxA8t5iR4EBHOn-5VvpxiyonTkhHWHDZ-nZcEHvD4'
      );
    }
  }

  get supabase() {
    return DocumentPresenceService.supabase;
  }

  /**
   * Join the presence room for a given document
   */
  async joinDocumentRoom(documentId: string, userId: string, userName: string) {
    this.currentUserId = userId;
    const roomName = `presence-${documentId}`;

    // ✅ Prevent duplicate subscriptions
    if (this.presenceChannel && this.presenceChannel.topic === roomName) {
      console.warn(`Already joined ${roomName}`);
      return;
    }

    // ✅ Clean up old channel before creating new one
    if (this.presenceChannel) {
      await this.presenceChannel.unsubscribe();
    }

    this.presenceChannel = this.supabase.channel(roomName, {
      config: { presence: { key: userId } },
    });

    // Handle presence sync
    this.presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = this.presenceChannel!.presenceState();
        const users = Object.entries(state).map(([id, entries]: [string, any]) => {
          const mostRecent = entries[entries.length - 1];
          return { userId: id, userName: mostRecent.userName };
        });
        this.usersSubject.next(users);
      })
      .on('broadcast', { event: 'cursor_update' }, (payload: any) => {
        const cursor: CursorUpdate = payload.payload;
        if (!cursor || cursor.userId === this.currentUserId) return;

        this.cursorsMap.set(cursor.userId, cursor);
        this.cursorsSubject.next([...this.cursorsMap.values()]);
      });

    // ✅ New Supabase v2 style subscribe (awaits status)
    await this.presenceChannel.subscribe();
    

    // ✅ Track user presence after subscription succeeds
    await this.presenceChannel.track({ userName });
    console.log(`✅ Joined presence room: ${roomName}`);
  }

  /**
   * Send cursor position updates
   */
  async updateCursor(cursor: { x: number; y: number; position: number },initials) {
    if (!this.presenceChannel || !this.currentUserId) return;

    const update: CursorUpdate = {
      userId: this.currentUserId,
      ...cursor
    };

    await this.presenceChannel.send({
      type: 'broadcast',
      event: 'cursor_update',
      payload: update,
    });
  }

  /**
   * Leave document room cleanly
   */
  async leaveDocumentRoom() {
    if (this.presenceChannel) {
      await this.presenceChannel.unsubscribe();
      this.presenceChannel = undefined;
    }
    this.cursorsMap.clear();
    this.cursorsSubject.next([]);
    this.usersSubject.next([]);
  }

  ngOnDestroy() {
    this.leaveDocumentRoom();
  }
}
