import { DefaultUrlSerializer, UrlTree } from '@angular/router';

export class UrlLowerCaseSerializer extends DefaultUrlSerializer {
    override parse(url: string): UrlTree {
        // Convert the URL to lowercase before parsing — covers hard refresh,
        // direct load, and browser back/forward.
        return super.parse(url.toLowerCase());
    }

    override serialize(tree: UrlTree): string {
        // Also lowercase URLs built via router.navigate([...]) so the address
        // bar stays consistently lowercase regardless of how navigation
        // happened, not just on the parse() path above.
        return super.serialize(tree).toLowerCase();
    }
}
