import { environment } from 'src/environments/environment';
import { BookingPageComponent } from './booking-page.component';

describe('BookingPageComponent share', () => {

  let snackBar: { openSnackBar: jasmine.Spy };
  let page: BookingPageComponent;

  const setNavigator = (props: Record<string, unknown>) => {
    for (const [key, value] of Object.entries(props)) {
      Object.defineProperty(navigator, key, { value, configurable: true });
    }
  };

  beforeEach(() => {
    snackBar = { openSnackBar: jasmine.createSpy('openSnackBar') };
    // The share logic only needs these three fields, so skip the 13-service constructor.
    page = Object.create(BookingPageComponent.prototype);
    page.kind = 'trainer';
    page.providerName = 'Jo Smith';
    (page as any).snackBar = snackBar;
  });

  afterEach(() => {
    // Restore the real implementations the browser ships with.
    delete (navigator as any).share;
    delete (navigator as any).clipboard;
  });

  it('shares the canonical booking URL through the native sheet when there is one', async () => {
    const share = jasmine.createSpy('share').and.resolveTo();
    setNavigator({ share });

    await page.share();

    expect(share).toHaveBeenCalledWith({
      title: 'Book Jo Smith | Berliz',
      url: `${environment.baseUrl}/trainers/Jo-Smith/book`,
    });
    expect(snackBar.openSnackBar).not.toHaveBeenCalled();
  });

  it('uses the /centers path for a center', async () => {
    page.kind = 'center';
    page.providerName = 'Iron Works Gym';
    const share = jasmine.createSpy('share').and.resolveTo();
    setNavigator({ share });

    await page.share();

    expect(share.calls.mostRecent().args[0].url).toBe(`${environment.baseUrl}/centers/Iron-Works-Gym/book`);
  });

  it('copies the link when the browser has no share sheet', async () => {
    const writeText = jasmine.createSpy('writeText').and.resolveTo();
    setNavigator({ share: undefined, clipboard: { writeText } });

    await page.share();

    expect(writeText).toHaveBeenCalledWith(`${environment.baseUrl}/trainers/Jo-Smith/book`);
    expect(snackBar.openSnackBar).toHaveBeenCalledWith('Booking link copied', '');
  });

  it('stays quiet when the person closes the share sheet', async () => {
    const cancelled = new DOMException('cancelled', 'AbortError');
    setNavigator({ share: jasmine.createSpy('share').and.rejectWith(cancelled) });

    await page.share();

    expect(snackBar.openSnackBar).not.toHaveBeenCalled();
  });

  it('tells the person when neither sharing nor copying worked', async () => {
    setNavigator({ share: undefined, clipboard: { writeText: jasmine.createSpy().and.rejectWith(new Error('denied')) } });

    await page.share();

    expect(snackBar.openSnackBar).toHaveBeenCalledWith('Could not share the link', 'error');
  });
});
