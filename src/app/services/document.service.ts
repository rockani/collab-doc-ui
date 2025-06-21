import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  
  private apiUrl = 'http://localhost:8080/documents/create';
  private updateUrl = 'http://localhost:8080/documents/update';
  private username = 'admin'; // Replace with actual username
  private password = 'admin'; // Replace with actual password


  constructor(private http: HttpClient) {}
  // {
  //   "title": "My First Doc",
  //   "content": "Hello, MongoDB!",
  //   "ownerId": "user127"
  // }
  // Save document
  saveDocument(title: string, content: string, owner:string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${this.username}:${this.password}`)
    });

    const documentData = { "title": title, "content":content,"ownerId":owner,"sharedWith":[] };
    return this.http.post(`${this.apiUrl}`, documentData,{ headers });
  }
  updateDocument(title: string, content: string, docId: any) : Observable<any>{
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${this.username}:${this.password}`)
    });

    const documentData = { "title": title, "content":content,"id": docId};
    return this.http.post(`${this.updateUrl}`, documentData,{ headers });
  }
  // Fetch document by ID
  getDocumentById(id: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${this.username}:${this.password}`)
    });
    return this.http.get(`${this.apiUrl}/${id}`,{headers});
  }
}
