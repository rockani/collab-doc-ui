export interface DocumentModel {
    id: string;
    title: string;
    content: string;
    lastModified: string; // LocalDateTime is stored as string in JSON
    createdAt: string;
    ownerId: string;
    sharedWith: string[];
    thumbnail: string;
  }