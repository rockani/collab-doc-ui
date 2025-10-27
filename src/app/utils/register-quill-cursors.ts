
import { PLATFORM_ID, inject } from '@angular/core';

let registered = false;

export async function registerQuillCursorsIfNeeded() {
  const platformId = inject(PLATFORM_ID);

 
  

  if (registered) return;

  const Quill = (await import('quill')).default;
  //const QuillCursors = (await import('quill-cursors')).default;

  //Quill.register('modules/cursors', QuillCursors);
  registered = true;
  
}
