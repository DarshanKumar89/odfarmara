import {Component, NgZone, Pipe} from '@angular/core';
import {Events, NavController, NavParams} from 'ionic-angular';
import {ApiProvider} from "../../providers/api/api";
import {Wrapper} from "../../app/Helpers/Wrapper";
import {DomSanitizer} from "@angular/platform-browser";
import {Geolocation} from "@ionic-native/geolocation";
import {ProfileFarmerPage} from "../profile-farmer/profile-farmer";

/**
 * Generated class for the MapPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
    selector: 'page-map',
    templateUrl: 'map.html',
})
export class MapPage extends Wrapper {
    url;
    rurl;
    farmers = [];
    len = 0;
    page = 0;
    loading = 0;

    constructor(public navParams: NavParams, public navCtrl: NavController, public sanitizer: DomSanitizer, public geolocation: Geolocation, public api: ApiProvider, public events: Events,
                private zone: NgZone) {
        super(navCtrl, navParams, sanitizer);
        this.url = this.sanitizeURL('https://odfarmara.sk/sub_page/apiMap');
        this.farmers = [];
        this.load();
        setInterval(this.load, 1000 * 60);
        this.len = this.farmers.length;
        this.events.subscribe('updateScreen', () => {
            this.zone.run(() => {
                console.log('force update the screen');
            });
        });
    }

    load() {
        this.geolocation.getCurrentPosition().then(resp => {
            this.setup(`&lat=${resp.coords.latitude}&lng=${resp.coords.longitude}`);
        }).catch(resp => {
            this.setup();
        });
    }

    setup(url = '') {
        this.rurl = url;
        url += `&page=${this.page}`;
        var t = new Date().getTime() + Math.random() * 1000;
        this.url = this.sanitizeURL(`https://odfarmara.sk/sub_page/apiMap?t=${t}${url}`);
        this.api.get(`/sub_page/apiMap?t=${t}${url}`).then(response => {
            response['farms'].map(item => {
                item['isFarmer'] = true;
                let user = ApiProvider.getUser(item, item);
                this.farmers.push(user);
                return user;
            });
            this.len = this.farmers.length;
            this.loading = 0;
            this.events.publish('updateScreen')
        });
    }

    calc(rating) {
        let stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push('<span class="fa fa-star' + (i >= Math.round(rating) ? '-o' : '') + '"></span>');
        }
        return stars;
    }

    isElementInViewPort(element: HTMLElement, viewPortHeight: number) {
        let rect = element.getBoundingClientRect();
        return rect.top >= 0 && (rect.bottom <= viewPortHeight);
    }

    scroll(e) {
        if (this.loading == 0) {
            let top = e.scrollTop;
            let height = e.scrollHeight;
            let bottom = document.getElementById('bottom');
            if (top + height > bottom.offsetTop) {
                this.loading = 1;
                this.page++;
                this.setup(this.rurl);
            }
        }
    }

    openFarmer(user) {
        this.navCtrl.push(ProfileFarmerPage, {
            id: user.scopeId
        });
    }
}
