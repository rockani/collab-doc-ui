import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollabEditorPageComponent } from './collab-editor-page.component';

describe('CollabEditorPageComponent', () => {
  let component: CollabEditorPageComponent;
  let fixture: ComponentFixture<CollabEditorPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollabEditorPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollabEditorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
