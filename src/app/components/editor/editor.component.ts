import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { ChatComponent } from "../chat/chat.component";
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../services/document.service';
import { QuillModule } from 'ngx-quill';
import { AuthService } from '../../services/auth.service';
import Quill from 'quill';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/dataService.service';
import { WebSocketService } from '../../services/web-socket.service';
import {DocumentPresenceService} from '../../services/document-presence.service';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged ,signOut} from 'firebase/auth';
import {app, auth} from '../../../firebase';
import { v4 as uuidv4 } from 'uuid';
import { Subscription } from 'rxjs';
import { ProfileService } from '../../services/profile.service';


interface CursorUpdate {
  userId: string;
  x: number;
  y: number;
  position: number;
  
}

// npm i uuid
@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule,FormsModule,QuillModule],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit{

  refreshInterval: any;
  private cursorsMap = new Map<string, CursorUpdate>(); // store latest positions
  private cursorElements = new Map<string, HTMLDivElement>();
   liveCursorsofUsers: CursorUpdate[]=[];
onKeyUpChange($event: KeyboardEvent) {
throw new Error('Method not implemented.');
}
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;

  title: string = '';
  content: string = '';
  docId: any;
  quill: any;
  isBrowser: boolean;
  ownerId: string = '';
  newdoc: any;
  cursorPosition = 0;
  loading = false;
  public currentlyViewingUsers:{ userId: string; userName: any;}[] = [];
  profileImageUrls: { [userId: string]: string | null } = {}; 
  private bgColors: string[] = [
    '#F44336', '#E91E63', '#9C27B0', '#3F51B5',
    '#03A9F4', '#009688', '#4CAF50', '#FF9800',
    '#795548', '#607D8B'
  ];
  lastCursorSent = 0;
  private colorMap: Map<string, string> = new Map();
  
  liveCursors: Map<string, HTMLDivElement> = new Map();
  cursorPositions: Map<string, CursorUpdate> = new Map();

  private cursorSubs?: Subscription;
  userName:string= '';
  
  constructor(private profileService: ProfileService, private documentService: DocumentService, private authService: AuthService,private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private wsService: WebSocketService,
    private docPresenceService: DocumentPresenceService,
    @Inject(PLATFORM_ID) private platformId: Object) {
      this.isBrowser = isPlatformBrowser(this.platformId);
      
    }
    getInitialsFromUserId(userId: string) {
      //return this.authService.getUsernameFromUID(userId);
      return this.getInitials(this.userName);
    }
  ngAfterViewInit() {
    this.quillMaker();
    
  }
  userNameDict= {};

  private loadProfileImages(): void {
    this.currentlyViewingUsers.forEach(user => {
      if (!this.profileImageUrls[user.userId]) {
       
        this.profileService.fetchProfileUrl(user.userId).subscribe(res => {
          this.profileImageUrls[user.userId] = res.signedUrl || null; // cache result
        });
      }
    });
  }
  logout() {
    
    signOut(auth)
      .then(() => {
        console.log('✅ User signed out');
        this.router.navigate(['/register']); // 🔁 redirect to /register after logout
      })
      .catch((error) => {
        console.error('❌ Error during logout:', error);
      });
  }
  saveDocument() {
    if (!this.title.trim()) {
      alert("Please enter a title before saving.");
      return;
    }
    const owner = this.authService.getCurrentUserUID()?.toString() || '';
    this.authService.getCurrentUserUID().subscribe((uid) => {
      if (uid) {
        this.ownerId = uid;
      }
    });
    this.documentService.saveDocument(this.title, this.content,this.ownerId)
      .subscribe(response => {
        
        alert("Document saved successfully! ID: " + response.id);
      }, error => {
        console.error("Error saving document:", error);
        alert("Failed to save document.");
      });
  }
  updateDocument() {
    if (!this.title.trim()) {
      alert("Please enter a title before saving.");
      return;
    }
  
   
    this.documentService.updateDocument(this.title, this.content,this.docId)
      .subscribe(response => {
        alert("Document updated successfully! ID: " + response.id);
        this.dataService.setCachedContent(this.docId, this.title,this.content);
      }, error => {
        console.error("Error saving document:", error);
        alert("Failed to save document.");
      });
  }

   ngOnInit() {
   
    this.docId = this.route.snapshot.paramMap.get('id')!;
    //this.refreshInterval = setInterval(() => this.renderAllCursors(), 50);

    this.authService.getCurrentUserUID().subscribe((uid) => {
          if (uid) {
            this.ownerId = uid;
          }
    });
    const cachedData : Array<string> | undefined= this.dataService.getCachedContent(this.docId);
    this.loading = true;
    if (cachedData) {
      this.content = cachedData[2];
      this.title = cachedData[1];
      this.loading = false;
    } else {
      this.dataService.getDocumentContent(this.docId).subscribe((data) => {
        this.loading = false;
        this.content = data.content;
        this.title = data.title;
        this.dataService.setCachedContent(this.docId, this.title,this.content);
        
      });
    }

    this.initEditor();

    const socket$ = this.wsService.connect(this.docId);
    socket$.subscribe(msg => {
      console.log(msg);
      if (msg.ops) {
        var delta = {};
        delta['ops'] = msg.ops;
        this.quillInstance.updateContents(delta); // Apply the incoming delta
      }
      if (msg.cursor) {
        //this.highlightCursor(msg.cursor.userId, msg.cursor.position);
      }
    });
    

    this.docPresenceService.joinDocumentRoom(this.docId, this.ownerId, this.userName);

    this.docPresenceService.cursors$.subscribe((cursors: CursorUpdate[]) => {
      cursors.forEach(c => {
        if (c.userId === this.ownerId) return; // skip own cursor
        this.cursorPositions.set(c.userId, c);
      });
      this.liveCursorsofUsers = cursors.filter(c => c.userId !== this.ownerId);
    });
    
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userId = user.uid;
        const userName = user.displayName || user.email?.split('@')[0] || 'Anonymous';
        this.userName = userName;
        this.userNameDict[userId] = userName;
        // Track presence in Supabase
        await this.docPresenceService.joinDocumentRoom(this.docId, userId, userName);

        this.docPresenceService.users$.subscribe((users) => {
          this.currentlyViewingUsers = users;
          this.loadProfileImages();
          // for(let {userId: string; userName: any; } userInfo of this.currentlyViewingUsers ){
          //   this.initials = this.getInitials(userInfo.userName);
          //   this.bgColor = this.getRandomColor();
          // }
        });
      }
    });
    //this.documentService.update_last_modified_time(this.docId).subscribe();
  }
  get avatarUrl(): string {
    const name = encodeURIComponent(this.userName);
    return `https://ui-avatars.com/api/?name=${name}&background=random&size=128`;
  }

  initials: string = '';
  bgColor: string = '';

  ngOnDestroy() {
    this.docPresenceService.leaveDocumentRoom();
    
  }
  getInitials(name: string): string {
    return name.split(' ')
               .map(part => part[0])
               .join('')
               .substring(0, 2)
               .toUpperCase();
  }

  getRandomColor(): string {
    return this.bgColors[Math.floor(Math.random() * this.bgColors.length)];
  }
  
  
  renderLoop() {
    // Use requestAnimationFrame for smooth async rendering
    requestAnimationFrame(() => this.renderLoop());

    this.cursorPositions.forEach((cursor, userId) => {
      let el = this.liveCursors.get(userId);
      if (!el) {
        el = document.createElement('div');
        el.classList.add('cursor-avatar');
        el.style.backgroundColor = this.getColor(cursor.userId);
        el.textContent = this.getInitials(this.userName);
        el.style.position = 'absolute';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.display = 'flex';
        el.style.justifyContent = 'center';
        el.style.alignItems = 'center';
        el.style.fontSize = '12px';
        el.style.color = '#fff';
        el.style.pointerEvents = 'none';
        el.style.transition = 'transform 0.05s linear';
        this.editorContainer.nativeElement.appendChild(el);
        this.liveCursors.set(userId, el);
      }

      // Update position
      el.style.transform = `translate(${cursor.x}px, ${cursor.y}px)`;
    });
  //  let el = this.cursorsMap.get(cursor.userId);
  //   if (!el) {
  //     el = document.createElement('div');
  //     el.classList.add('cursor-avatar');
  //     el.style.backgroundColor = this.getColor(cursor.userId);
  //     el.textContent = this.getInitials(cursor.userId);
  //     el.style.position = 'absolute';
  //     el.style.width = '24px';
  //     el.style.height = '24px';
  //     el.style.borderRadius = '50%';
  //     el.style.display = 'flex';
  //     el.style.justifyContent = 'center';
  //     el.style.alignItems = 'center';
  //     el.style.fontSize = '12px';
  //     el.style.color = '#fff';
  //     el.style.pointerEvents = 'none';
  //     el.style.transition = 'transform 0.05s linear'; // smooth
  //     this.editorContainer.nativeElement.appendChild(el);
  //     this.cursorsMap.set(cursor.userId, el);
  //   }
  
  //   // Use transform for smooth performance
  //   el.style.transform = `translate(${cursor.x}px, ${cursor.y}px)`;
  }



  onCursorMove(event: any) {
    this.cursorPosition = event.target?.selectionStart;
    this.wsService.sendMessage({ cursor: { userId: 'user1', position: this.cursorPosition } });
  }
  


  // highlightCursor(userId: string, position: number) {
  //   if (!this.quillInstance) return;
  
  //   const range = this.quillInstance.getBounds(position);
  //   const x = range.left;
  //   const y = range.top;
  
  //   // Get existing DOM element for this user
  //   let cursorEl = this.liveCursors.get(userId);
  
  //   if (!cursorEl) {
  //     // Create new cursor element if it doesn't exist
  //     cursorEl = document.createElement('div');
  //     cursorEl.classList.add('cursor-avatar');
  //     cursorEl.style.backgroundColor = this.getColor(userId);
  //     cursorEl.textContent = userId.split('-')[1]?.toUpperCase() || 'U';
  //     this.editorContainer.nativeElement.appendChild(cursorEl);
  //     this.liveCursors.set(userId, cursorEl);
  //   }
  
  //   // Update the position of the cursor element
  //   cursorEl.style.left = `${x}px`;
  //   cursorEl.style.top = `${y}px`;
  // }
  
  

  initEditor() {
    this.quillMaker();
   
  }

  async quillMaker() {
    if (this.isBrowser) {
      const m = await import('quill');
    }
  }
  quillInstance: any;
  onEditorCreated(quill:any) {
    this.quillInstance = quill;
    
    quill.on('selection-change', (range) => {
      if (range) {
        const position = range.index;
        this.docPresenceService.updateCursor({ x: 0, y: 0, position },this.getInitials(this.userName));
      }
    });

    // Track mouse movement to show avatar dynamically
    // this.editorContainer.nativeElement.addEventListener('mousemove', (e: MouseEvent) => {
    //   const rect = this.editorContainer.nativeElement.getBoundingClientRect();
    //   const x = e.clientX - rect.left;
    //   const y = e.clientY - rect.top;
    //   this.docPresenceService.updateCursor({ x, y, position: quill.getSelection()?.index || 0 });
    // });


    // this.editorContainer.nativeElement.addEventListener('mousemove', (e: MouseEvent) => {
    //   const now = Date.now();
    //   if (now - this.lastCursorSent < 50) return; // throttle
    //   this.lastCursorSent = now;
    
    //   const rect = this.editorContainer.nativeElement.getBoundingClientRect();
    //   const x = e.clientX - rect.left;
    //   const y = e.clientY - rect.top;
    //   const pos = quill.getSelection()?.index || 0;
    
    //   this.docPresenceService.updateCursor({ x, y, position: pos });
    // });
    this.editorContainer.nativeElement.addEventListener('mousemove', (e: MouseEvent) => {
      // const now = Date.now();
      // if (now - this.lastCursorSent < 50) return; // throttle 50ms
      // this.lastCursorSent = now;

      const rect = this.editorContainer.nativeElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const pos = quill.getSelection()?.index || 0;

      this.docPresenceService.updateCursor({ x, y, position: pos },this.getInitials(this.userName));
    });

    // Start the cursor render loop
    //this.renderLoop();
    // Listen to local cursor changes
    quill.on('selection-change', (range, oldRange, source) => {
      if (source === 'user' && range) {
        this.docPresenceService.updateCursor(range.index,this.getInitials(this.userName));
      }
    });
    // Listen for text changes
    quill.on('text-change', (delta:any, oldContent:any, source:any) => {
      console.log('Text changed:', delta, oldContent, source);
      this.handleTextChange(delta, oldContent, source);
    });
  }
  
  // renderCursor(cursor: CursorUpdate) {
  //   let el = this.cursorsMap.get(cursor.userId);
  //   if (!el) {
  //     el = document.createElement('div');
  //     el.classList.add('cursor-avatar');
  //     el.style.backgroundColor = this.getColor(cursor.userId);
  //     el.textContent = this.getInitials(cursor.userId);
  //     el.style.position = 'absolute';
  //     el.style.width = '24px';
  //     el.style.height = '24px';
  //     el.style.borderRadius = '50%';
  //     el.style.display = 'flex';
  //     el.style.justifyContent = 'center';
  //     el.style.alignItems = 'center';
  //     el.style.fontSize = '12px';
  //     el.style.color = '#fff';
  //     el.style.pointerEvents = 'none';
  //     el.style.transition = 'transform 0.05s linear'; // smooth
  //     this.editorContainer.nativeElement.appendChild(el);
  //     this.cursorsMap.set(cursor.userId, el);
  //   }
  
  //   // Use transform for smooth performance
  //   el.style.transform = `translate(${cursor.x}px, ${cursor.y}px)`;
  // }
handleTextChange(delta: any, oldContent: any, source: string) {
  if (source === 'user') { // Only process user edits
    const operation = {
      opId: uuidv4(),                  // Unique operation ID
      docId: this.docId,                // Current document ID
      userId: this.ownerId,             // Current user ID
      timestamp: Date.now(),            // Current timestamp
      ops: delta.ops,                   // Quill delta ops array
      cursorIndex: this.cursorPosition  // Current cursor position
    };

    console.log('User edit detected:', operation);

    // Send operation to WebSocket server
    this.wsService.sendMessage({ operation });
  }
}

  getColor(userId: string): string {
    if (!this.colorMap.has(userId)) {
      const colors = ['#f44336', '#e91e63', '#9c27b0', '#3f51b5', '#03a9f4', '#009688', '#4caf50', '#ff9800', '#795548'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      this.colorMap.set(userId, randomColor);
    }
    return this.colorMap.get(userId)!;
  }

  // private renderAllCursors() {
  //   this.cursorsMap.forEach((cursor, userId) => {
  //     if (userId === this.ownerId) return; // skip own cursor
  //     let el = this.cursorElements.get(userId);

  //     if (!el) {
  //       el = document.createElement('div');
  //       el.classList.add('cursor-avatar');
  //       el.style.backgroundColor = this.getColor(userId);
  //       el.textContent = this.getInitials(cursor.userId || userId);
  //       this.editorContainer.nativeElement.appendChild(el);
  //       this.cursorElements.set(userId, el);
  //     }

  //     // Smooth update using transform
  //     el.style.transform = `translate(${cursor.x}px, ${cursor.y}px)`;
  //   });
  // }

  // Call this whenever mouse moves
  trackMouseCursor(e: MouseEvent) {
    const rect = this.editorContainer.nativeElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const position = this.quill.getSelection()?.index || 0;

    this.docPresenceService.updateCursor({ x, y, position },this.getInitials(this.userName));
  }
  

}
