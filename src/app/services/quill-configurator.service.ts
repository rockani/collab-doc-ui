// src/app/quill-configurator.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class QuillConfiguratorService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async configureQuill() {
    
      const Quill = (await import('quill')).default;
      const QuillCursors = (await import('quill-cursors')).default;

      if (!(Quill as any)._cursorsRegistered) {
        Quill.register('modules/cursors', QuillCursors);
        (Quill as any)._cursorsRegistered = true;
      }
    
  }
}
