import {MyApp} from "../app.component";
import {DomSanitizer} from "@angular/platform-browser";
import {NavController, NavParams} from "ionic-angular";

export class Wrapper {
    protected loggedUser = MyApp.loggedUser;

    constructor(public navCtrl: NavController, public navParams: NavParams, protected sanitizer: DomSanitizer) {
        
    }

    public sanitize(image) {
        if(typeof image == 'object' && image != null) {
            let im = image['url'];
            image = im['main'];
        }
        return this.sanitizer.bypassSecurityTrustStyle('url("' + image + '")');
    }

    public sanitizeURL(url) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
}