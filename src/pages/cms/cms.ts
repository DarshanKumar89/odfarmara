import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {ApiProvider} from "../../providers/api/api";
import {MyApp} from "../../app/app.component";
import {HomeCustomerPage} from "../home-customer/home-customer";
import {HomeFarmerPage} from "../home-farmer/home-farmer";
import {LoginPage} from "../login/login";
import {Wrapper} from "../../app/Helpers/Wrapper";
import {DomSanitizer} from "@angular/platform-browser";

/**
 * Generated class for the CmsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
    selector: 'page-cms',
    templateUrl: 'cms.html',
})
export class CmsPage extends Wrapper {

    page: { id: number, title: string, component: any, content: string, slug: string };
    url;
    constructor(public navCtrl: NavController, public navParams: NavParams, private provider: ApiProvider, public sanitizer: DomSanitizer) {
        super(navCtrl, navParams, sanitizer);
        this.page = this.navParams.data.page;
        //this.url = this.sanitizeURL(ApiProvider.URL + `/cms/${this.page.id}-${this.page.slug}?mobile=1`);
        this.provider.getCmsPage(this.page.id, this.page.slug).then((response) => {
            this.page.content = response['content']
                .replace(/(<a\s)/g, '<a target="_system" ')
                .replace(/href=(["'])\/(.+?)(["'])/g, 'href=$1https://odfarmara.sk/$2$3')
                .replace(/src=(["'])\/(.+?)(["'])/g, 'src=$1https://odfarmara.sk/$2$3')
                .replace('$countFarmers', 0)
                .replace('$countClients', 0)
                .replace('$countOrders', 0);
        });
    }

    goHome() {
        this.navCtrl.setRoot(MyApp.loggedUser ? (MyApp.loggedUser.farmer ? HomeFarmerPage : HomeCustomerPage) : LoginPage);
    }

}
