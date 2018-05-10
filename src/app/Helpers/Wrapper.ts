import {MyApp} from "../app.component";
import {DomSanitizer} from "@angular/platform-browser";
import {NavController, NavParams} from "ionic-angular";
import ThumborUrlBuilder from 'thumbor-url-builder';
import {CustomImgComponent} from "../../components/custom-img/custom-img";

export class Wrapper {
    protected loggedUser = MyApp.loggedUser;

    constructor(public navCtrl: NavController, public navParams: NavParams, protected sanitizer: DomSanitizer) {
        
    }

    public sanitize(image) {
        let builder = new ThumborUrlBuilder('', CustomImgComponent.THUMBOR_URL);
        if(typeof image == 'object' && image != null) {
            let im = image['url'];
            image = im['main'];
        }
        if(image === undefined || image === '') {
            return image;
        }
        if(image === null || image.trim() === '') {
            return this.sanitizer.bypassSecurityTrustStyle('url("")');
        }
        return this.sanitizer.bypassSecurityTrustStyle('url("' + builder.setImagePath(image).resize(200, 200).smartCrop(true).buildUrl() + '")');
    }

    public sanitizeURL(url) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
}
