import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { NEVER } from 'rxjs';

import { WebSocketService } from './web-socket.service';
import { RxStompService } from './rx-stomp.service';

describe('WebSocketService', () => {
  let service: WebSocketService;

  beforeEach(() => {
    const rxStompServiceSpy = jasmine.createSpyObj('RxStompService', ['watch']);
    rxStompServiceSpy.watch.and.returnValue(NEVER);

    TestBed.configureTestingModule({
      providers: [
        provideMockStore(),
        { provide: RxStompService, useValue: rxStompServiceSpy }
      ]
    });
    service = TestBed.inject(WebSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
