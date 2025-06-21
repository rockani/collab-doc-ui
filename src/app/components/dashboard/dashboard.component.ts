import { Component, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DocumentGridComponent } from "../document-grid/document-grid.component";
import { PaginatedResponse } from '../../models/pagination.model';
import { DocumentModel } from '../../models/document.model';
import Quill from 'quill';
import { AuthService } from '../../services/auth.service';
import { getAuth, onAuthStateChanged,signOut } from 'firebase/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DocumentGridComponent],
  templateUrl: './dashboard.component.html', 
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  //documents = [{ id: 1, name: "Project Proposal" }, { id: 2, name: "Meeting Notes" }];

  constructor(private router: Router,private http: HttpClient,private authService: AuthService) {}

  createNewDoc() {
     this.router.navigate(['/editor', Math.random()]); 
  }
  openDoc(id: number) { this.router.navigate(['/editor', id]); }

  documents: DocumentModel[] = [];
  page = 0;
  pageSize = 8;
  loading = false;
  username = "admin";
  password = "admin";
  loadedPages: Set<number> = new Set(); // Track loaded pages
  allLoaded = false;
  userName:string= '';
  userPhotoURL: string | null = null;

  private bgColors: string[] = [
    '#F44336', '#E91E63', '#9C27B0', '#3F51B5',
    '#03A9F4', '#009688', '#4CAF50', '#FF9800',
    '#795548', '#607D8B'
  ];
  ngOnInit() {
    const auth = getAuth();
    //this.userName = user.displayName;
    onAuthStateChanged(auth, (user) => {
      if (user && user.displayName) {
        this.userName = user.displayName;
      } else if (user && user.email) {
        // fallback if displayName is not set
        this.userName = user.email.split('@')[0];
      } else {
        this.userName = '';
      }
      this.initials = this.getInitials(this.userName);
      this.bgColor = this.getRandomColor();
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
    // Initialize Quill editor
  
  // ngOnInit(): void {
  //   this.loadDocuments();
  // }

  // loadDocuments(): void {
  //   if (this.loading || this.allLoaded) return;

  //   this.loading = true;
  //   const headers = new HttpHeaders({
  //     'Authorization': 'Basic ' + btoa(`${this.username}:${this.password}`),
  //     'Content-Type': 'application/json'
  //   });
    
  //   this.http.get<PaginatedResponse<DocumentModel>>(`http://localhost:8080/documents?page=${this.page}&size=${this.pageSize}`,{headers})
  //     .subscribe(
  //       (data) => {
  //         if (!this.loadedPages.has(this.page)) {
  //           if (data.content.length === 0) {
  //             this.allLoaded = true; // Stop if no more data
  //           } else {
  //             this.documents = [...this.documents, ...data.content];
  //             this.page++;
  //           }
  //           this.loading = false;
  //         }
  //       },
  //       (error) => {
  //         console.error('Error fetching documents', error);
  //         this.loading = false;
  //       }
  //     );
  // }

  // loadMore(): void {
  //   this.page++;
  //   this.loadDocuments();
  // }
}
