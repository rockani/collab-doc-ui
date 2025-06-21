import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-share-dialog',
  templateUrl: './share-dialog.component.html',
  imports: [FormsModule,CommonModule],
  styleUrls: ['./share-dialog.component.css'],
})
export class ShareDialogComponent {
  email: string = '';
  errorMessage: string = '';
  loading: boolean = false; // Spinner state
  selectedRole: string = "viewer";

  constructor(
    private dialogRef: MatDialogRef<ShareDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient
  ) {}

  shareDocument() {
    if (!this.email || !this.selectedRole) {
      this.errorMessage = 'Please enter an email and select a role.';
      return;
    }

    if (!this.validateEmail(this.email)) {
      this.errorMessage = 'Invalid email address!';
      return;
    }

    this.loading = true; // Show spinner
    this.errorMessage = ''; // Reset error message
    const postBody = {
      _id: this.data?.docId,   // Use optional chaining to avoid errors
      ownerId: this.data?.ownerId,
      sharedWith: this.email,
      role: this.selectedRole
    };
    
    // Debugging log (remove this in production)
    console.log("Sharing Document Request:", JSON.stringify(postBody));
    
    this.loading = true; // Show spinner while request is in progress
    
    this.http.post(`http://localhost:8080/documents/share`, postBody).subscribe({
      next: () => {
        this.loading = false; // Hide spinner
        this.dialogRef.close(this.email); // Close dialog on success
      },
      error: (error) => {
        this.loading = false; // Hide spinner
        console.error("Error Sharing Document:", error);
        this.errorMessage = 'User does not exist or sharing failed!'; // Show error
      }
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}