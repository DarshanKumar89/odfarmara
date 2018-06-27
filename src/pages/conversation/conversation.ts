import {Component, ViewChild} from '@angular/core';
import {Content, NavController, NavParams} from 'ionic-angular';
import {Message} from "../../app/Entity/Message";
import {User} from "../../app/Entity/User";
import {MyApp} from "../../app/app.component";
import {ApiProvider} from "../../providers/api/api";
import {HomeCustomerPage} from "../home-customer/home-customer";
import {HomeFarmerPage} from "../home-farmer/home-farmer";

/**
 * Generated class for the ConversationPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
    selector: 'page-conversation',
    templateUrl: 'conversation.html',
})
export class ConversationPage {
    @ViewChild(Content) content: Content;

    private opponent: User = MyApp.emptyUser;
    private loggedUser: User;
    private body: string = '';

    constructor(public navCtrl: NavController, public navParams: NavParams, public api: ApiProvider) {

        this.loggedUser = MyApp.loggedUser;
        MyApp.message = {
            idFrom: MyApp.loggedUser.id,
            idTo: this.navParams.get('idUser'),
            idDemand: this.navParams.get('idDemand'),
        };
        if(navParams.get('idDemand')) {
            this.api.fetchDemand(navParams.get('idDemand'), true).then(item => {
                MyApp.mustAgree = item['mustAgree'];
                MyApp.conversation = item['messages'].map(it => {
                    let msg = ApiProvider.getMessage(it);
                    MyApp.opponent = this.opponent = msg.userFrom.id === navParams.get('idUser') ? msg.userFrom : msg.userTo;
                    return msg;
                });
                setTimeout(() => {
                    this.content.scrollToBottom(20);
                }, 300)
            });
        } else {
            this.api.getConversation(
                MyApp.loggedUser.id,
                navParams.get('idUser'),
                null,
                true
            ).then(data => {
                MyApp.conversation = data['messages'].map(it => {
                    let msg = ApiProvider.getMessage(it);
                    MyApp.opponent = this.opponent = msg.userFrom.id === navParams.get('idUser') ? msg.userFrom : msg.userTo;
                    return msg;
                });
                setTimeout(() => {
                    this.content.scrollToBottom(20);
                }, 300)
            });
        }
    }

    ionViewDidLoad() {
        MyApp.messageCnt = this.content;
    }

    getConversation() {
        return MyApp.conversation;
    }

    goHome() {
        this.navCtrl.setRoot(MyApp.loggedUser.farmer ? HomeFarmerPage : HomeCustomerPage);
    }
}
