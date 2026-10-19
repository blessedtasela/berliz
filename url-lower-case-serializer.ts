import { DefaultUrlSerializer, UrlTree } from '@angular/router';

/**
 * Only the path is lowercased. Query keys and values (and the fragment) must keep their case: the app reads
 * camelCase keys such as `returnUrl`, `postId`, `userId` and `logId`, and values can be case-sensitive.
 */
function lowerCasePath(url: string): string {
    const end = url.search(/[?#]/);
    return end === -1 ? url.toLowerCase() : url.slice(0, end).toLowerCase() + url.slice(end);
}

export class UrlLowerCaseSerializer extends DefaultUrlSerializer {
    override parse(url: string): UrlTree {
        // Covers hard refresh, direct load, and browser back/forward.
        return super.parse(lowerCasePath(url));
    }

    override serialize(tree: UrlTree): string {
        // Also covers URLs built via router.navigate([...]) so the address bar stays consistently lowercase.
        return lowerCasePath(super.serialize(tree));
    }
}
