import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { ChatWithCenterComponent } from './chat-with-center.component';

describe('ChatWithCenterComponent', () => {
  let component: ChatWithCenterComponent;
  let fixture: ComponentFixture<ChatWithCenterComponent>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [ChatWithCenterComponent],
      providers: [{ provide: MatDialog, useValue: dialogSpy }]
    });
    fixture = TestBed.createComponent(ChatWithCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Regression: this used to be a blocking window.confirm() -- now it's the
  // app's own PromptModalComponent, opened through MatDialog instead.
  it('chatWhatsapp asks for confirmation via the custom prompt modal, not window.confirm', () => {
    dialogSpy.open.and.returnValue({ afterClosed: () => of(false) } as any);

    component.chatWhatsapp();

    expect(dialogSpy.open).toHaveBeenCalled();
    expect((dialogSpy.open.calls.mostRecent().args[1] as any)?.data?.confirmation).toBeTrue();
  });
});
