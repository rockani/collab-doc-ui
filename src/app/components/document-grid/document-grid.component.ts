import { Component, Input, HostListener } from '@angular/core';
import { DocumentModel } from '../../models/document.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginatedResponse } from '../../models/pagination.model';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from 'firebase/auth';
import { MatDialog } from '@angular/material/dialog';
import { ShareDialogComponent } from '../share-dialog/share-dialog.component';

@Component({
  selector: 'app-document-grid',
  imports: [CommonModule,FormsModule],
  templateUrl: './document-grid.component.html',
  styleUrls: ['./document-grid.component.css']
})
export class DocumentGridComponent {
  
  @Input() documents: DocumentModel[] = [];

  filteredDocuments: any[] = []; // Store filtered documents
  selectedFilter: string = 'owned'; // Default filter
  thumbnailMap: { [docId: string]: string } = {};

errorMessage: any;
  applyFilter() {
    this.documents = [];
    this.page = 0;
    this.pageSize = 8;
    this.loading = false;
    this.allLoaded = false;
    if(this.selectedFilter == "shared"){
    this.loadMoreSharedDocs();
    }else{
      this.loadMore();
    }
  }
  createNewDoc() {
    this.router.navigate(['/editor', Math.random()]); 
  }
  openShareDialog(id:string,event: Event) {
    event.stopPropagation(); // Prevent click from propagating to the document card
    console.log("Stopped Propogation");

    this.menuOpenMap[id]=false; // Close menu before opening dialog
    const dialogRef = this.dialog.open(ShareDialogComponent, {
      width: '500px',
      data: { docId: id, ownerId :this.ownerId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Shared with:', result);
      }
    });

  }
  menuOpenMap: { [key: string]: boolean } = {}; // Track state per doc

  toggleMenu(event: Event, docId: string): void {
    event.stopPropagation(); // Prevent click from propagating to the document card
    if(this.menuOpenMap[docId]==undefined)
      this.menuOpenMap[docId] = true;
    else
      this.menuOpenMap[docId] = !this.menuOpenMap[docId]; // Toggle for specific document
  }
  @HostListener('document:click', ['$event'])
  closeMenus(event: Event) {
    this.menuOpenMap = {}; // Close all menus when clicking outside
  }

  page = 0;
  pageSize = 8;
  loading = false;
  allLoaded = false; // Stop further loading if no more data
  private username = 'admin'; // Replace with actual username
  private password = 'admin'; // Replace with actual password
  ownerId :string  | null = null;
  constructor(private http: HttpClient,private router:Router,private authService: AuthService,private dialog: MatDialog) {}
  ngOnInit(): void {
    
    this.authService.getCurrentUserUID().subscribe((uid) => {
      if (uid) {
        this.ownerId = uid;
        this.loadMore(); // Now called only after ownerId is set
      }
    });
    //this.loadMore();
  }
  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100 && !this.loading && !this.allLoaded) {
      console.log("scrolled");
      if(this.selectedFilter=="owned"){
        this.loadMore();
      }
      else{
        this.loadMoreSharedDocs();
      }
    }
  }

  loadMore(): void {
    if (this.loading || this.allLoaded) return;
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa(`${this.username}:${this.password}`),
      'Content-Type': "application/json"
    });
    this.loading = true;
    
    this.http.get<PaginatedResponse<DocumentModel>>(`http://localhost:8080/documents/metadata?ownerId=${this.ownerId}&page=${this.page}&size=${this.pageSize}`,{headers})
      .subscribe(
        (data) => {
          console.log("See this : " + data);
          if (data.content.length === 0) {
            this.allLoaded = true; // Stop if no more data
          } else {
            this.documents = [...this.documents, ...data.content];
            for (let doc of data.content) {
              const docId = doc.id;
            
              // Fetch thumbnail
              this.http.get(`http://localhost:8080/fetchThumbnail?docId=${docId}`, { responseType: 'blob' })
                .subscribe(blob => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    this.thumbnailMap[docId] = reader.result as string; // base64 image
                  };
                  reader.readAsDataURL(blob);
                }, error => {
                  console.error(`Error fetching thumbnail for doc ${docId}`, error);
                  // Optional: Set a default image fallback
                  this.thumbnailMap[docId] = '/assets/default-thumbnail.png';
                });
            }
            this.page++;
          }
          this.loading = false;
        },
        (error) => {
          console.error('Error fetching documents', error);
          this.loading = false;
        }
      );
  }

  loadMoreSharedDocs(): void {
    if (this.loading || this.allLoaded) return;
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa(`${this.username}:${this.password}`),
      'Content-Type': "application/json"
    });
    this.loading = true;
    this.http.get<PaginatedResponse<DocumentModel>>(`http://localhost:8080/shared-documents?userUID=${this.ownerId}&page=${this.page}&size=${this.pageSize}`,{headers})
      .subscribe(
        (data) => {
          console.log(data);
          if (data.content.length === 0) {
            this.allLoaded = true; // Stop if no more data
          } else {
            this.documents = [...this.documents, ...data.content];
            for (let doc of data.content) {
              const docId = doc.id;
            
              // Fetch thumbnail
              this.http.get(`http://localhost:8080/fetchThumbnail?docId=${docId}`, { responseType: 'blob' })
                .subscribe(blob => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    this.thumbnailMap[docId] = reader.result as string; // base64 image
                  };
                  reader.readAsDataURL(blob);
                }, error => {
                  console.error(`Error fetching thumbnail for doc ${docId}`, error);
                  // Optional: Set a default image fallback
                  this.thumbnailMap[docId] = '/assets/default-thumbnail.png';
                });
            }
            this.page++;
          }
          this.loading = false;
        },
        (error) => {
          console.error('Error fetching documents', error);
          this.loading = false;
        }
      );
  }
  opendoc( doc:DocumentModel){ 
    
    this.router.navigate(['/editor', doc.id]);
  }
  // openShareDialog() {
  //   this.menuOpen = false; // Close menu before opening dialog
  //   const dialogRef = this.dialog.open(ShareDialogComponent, {
  //     width: '300px',
  //     data: { documentId: this.doc.id },
  //   });

  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result) {
  //       console.log('Shared with:', result);
  //     }
  //   });
  // }
}