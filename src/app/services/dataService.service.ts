import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private cachedDocuments = new Map<string, Array<string>>();

  constructor(private http: HttpClient) {}

//   getDocuments(): Observable<any[]> {
//     return this.http.get<any[]>('/api/documents');
//   }

getDocumentContent(id: string): Observable<any> {
    return this.http.get<string>(`http://localhost:8080/documents/content`, { params: { id } });
}

  // updateDocument(id: string, content: string): Observable<any> {
  //   return this.http.put(`/api/documents/${id}`, { content });
  // }

  getCachedContent(id: string): Array<string> | undefined {
    return this.cachedDocuments.get(id);
  }

  setCachedContent(id: string, title:string, content: string) {
     
    this.cachedDocuments.set(id,new Array(id, title, content) );
  }
}