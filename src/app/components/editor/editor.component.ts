import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
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
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule,FormsModule,QuillModule],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit{
  
  title: string = '';
  content: string = '';
  docId: any;
  quill: any;
  isBrowser: boolean;
  ownerId: string = '';
  newdoc: any;
  cursorPosition = 0;
  public currentlyViewingUsers:{ userId: string; userName: any; }[] = [];
  private bgColors: string[] = [
    '#F44336', '#E91E63', '#9C27B0', '#3F51B5',
    '#03A9F4', '#009688', '#4CAF50', '#FF9800',
    '#795548', '#607D8B'
  ];
  private colorMap: Map<string, string> = new Map();

  userName:string= '';
  constructor(private documentService: DocumentService, private authService: AuthService,private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private wsService: WebSocketService,
    private docPresenceService: DocumentPresenceService,
    @Inject(PLATFORM_ID) private platformId: Object) {
      this.isBrowser = isPlatformBrowser(this.platformId);
      
    }

  
  ngAfterViewInit() {
    this.quillMaker();
  }
  logout() {
    const auth = getAuth();
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
    // const owner = this.authService.getCurrentUserUID()?.toString() || '';
    // this.authService.getCurrentUserUID().subscribe((uid) => {
    //   if (uid) {
    //     this.ownerId = uid;
    //   }
    // });
    this.documentService.updateDocument(this.title, this.content,this.docId)
      .subscribe(response => {
        alert("Document updated successfully! ID: " + response.id);
      }, error => {
        console.error("Error saving document:", error);
        alert("Failed to save document.");
      });
  }

  async ngOnInit() {
    
    this.docId = this.route.snapshot.paramMap.get('id')!;
    this.authService.getCurrentUserUID().subscribe((uid) => {
          if (uid) {
            this.ownerId = uid;
          }
    });
    const cachedData : Array<string> | undefined= this.dataService.getCachedContent(this.docId);
    if (cachedData) {
      this.content = cachedData[1];
      this.title = cachedData[0];
    } else {
      this.dataService.getDocumentContent(this.docId).subscribe((data) => {
        this.content = data.content;
        this.title = data.title;
        this.dataService.setCachedContent(this.docId, this.content);
      });
    }

    this.initEditor();

    const socket$ = this.wsService.connect(this.docId);
    socket$.subscribe(msg => {
      console.log(msg);
      if (msg.delta) {
        this.quillInstance.updateContents(msg.delta); // Apply the incoming delta
      }
      if (msg.cursor) {
        this.highlightCursor(msg.cursor.userId, msg.cursor.position);
      }
    });
    
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const userId = user.uid;
        const userName = user.displayName || user.email?.split('@')[0] || 'Anonymous';

        // Track presence in Supabase
        this.docPresenceService.joinDocumentRoom(this.docId, userId, userName);
        this.docPresenceService.users$.subscribe((users) => {
          this.currentlyViewingUsers = users;
          // for(let {userId: string; userName: any; } userInfo of this.currentlyViewingUsers ){
          //   this.initials = this.getInitials(userInfo.userName);
          //   this.bgColor = this.getRandomColor();
          // }
        });

        


      }
    });

  }
  get avatarUrl(): string {
    const name = encodeURIComponent(this.userName);
    return `https://ui-avatars.com/api/?name=${name}&background=random&size=128`;
  }

  initials: string = '';
  bgColor: string = '';

  
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
  onTextChange(event:any) {
    const operation = {
      docId: this.docId,
      userId: 'user1',
      index: this.cursorPosition,
      text: event.target.value,
      isInsert: true
    };
    this.wsService.sendMessage({ operation });
  }

  onCursorMove(event:any) {
    this.cursorPosition = event.target?.selectionStart;
    this.wsService.sendMessage({ cursor: { userId: 'user1', position: this.cursorPosition } });
  }

  highlightCursor(userId: any, position: any) {
    console.log(`User ${userId} is at position ${position}`);
  }
  

  initEditor() {
    this.quillMaker();
   // this.quill.root.innerHTML = this.content;
  }

  async quillMaker() {
    if (this.isBrowser) {
      const m = await import('quill');
      // this.quill = new m.default('#editor-container', {
      //   // modules: { toolbar: '#toolbar' },
      //   theme: 'snow',
      //   placeholder: "placeholder",
      // });
    }
  }
  quillInstance: any;
  onEditorCreated(quill:any) {
    this.quillInstance = quill;

    // Listen for text changes
    quill.on('text-change', (delta:any, oldContent:any, source:any) => {
      console.log('Text changed:', delta, oldContent, source);
      this.handleTextChange(delta, oldContent, source);
    });
  }
  handleTextChange(delta: any, oldContent: any, source: string) {
    if (source === 'user') { // Only process user edits
      const operation = {
        docId: this.docId,      // The current document ID
        userId: this.ownerId,  // The current user ID
        delta: delta,           // Quill delta object representing changes
      };
  
      console.log('User edit detected:', delta);
      
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
}
