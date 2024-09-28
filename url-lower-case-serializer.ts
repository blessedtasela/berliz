import { DefaultUrlSerializer, UrlTree } from '@angular/router';

export class UrlLowerCaseSerializer extends DefaultUrlSerializer {
    override parse(url: string): UrlTree {
        // Convert the URL to lowercase before parsing
        return super.parse(url.toLowerCase());
    }
}
