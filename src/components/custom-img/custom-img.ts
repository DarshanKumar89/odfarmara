import {Component, Input} from '@angular/core';
import ThumborUrlBuilder from 'thumbor-url-builder';

/**
 * Generated class for the CustomImgComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
    selector: 'custom-img',
    templateUrl: 'custom-img.html'
})
export class CustomImgComponent {
    @Input('src') src: string = '';
    @Input('alt') alt: string = '';
    @Input('w') w: number = 200;
    @Input('h') h: number = 200;
    public static THUMBOR_URL = 'http://odfarmara.sk:8000';
    private source;
    ngOnInit() {
        let builder = new ThumborUrlBuilder('', CustomImgComponent.THUMBOR_URL);
        if(this.src === '' || this.src === null) {
            this.source = this.src;
        } else {
            this.source = builder.setImagePath(this.src).resize(this.w, this.h).smartCrop(true).buildUrl();
        }
    }
}
