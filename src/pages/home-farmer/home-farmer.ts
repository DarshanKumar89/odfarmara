import {Component} from '@angular/core';
import {AlertController, ModalController, NavController, NavParams} from 'ionic-angular';
import {User} from "../../app/Entity/User";
import {Message} from "../../app/Entity/Message";
import {MyApp} from "../../app/app.component";
import {ApiProvider} from "../../providers/api/api";
import {MyOffersPage} from "../my-offers/my-offers";
import {MessagesPage} from "../messages/messages";
import {OfferFormComponent} from "../../components/offer-form/offer-form";
import {ConversationPage} from "../conversation/conversation";

/**
 * Generated class for the HomeFarmerPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-home-farmer',
  templateUrl: 'home-farmer.html',
})
export class HomeFarmerPage {

    private conversations = Array<{ message: Message, opponent: User }>();
    private counts = MyApp.counts;
    private me = MyApp.loggedUser;

    constructor(public navCtrl: NavController, public navParams: NavParams, private api: ApiProvider, private modalCtrl: ModalController, public alerts: AlertController) {
        api.getMessages(MyApp.loggedUser.id).then(data => {
            this.conversations = Object.keys(data['messages']).filter(key => {
                return key != '';
            }).map(key => {
                let user = data['messages'][key]['UserFrom']['User']['id'] == MyApp.loggedUser.id ? data['messages'][key]['UserTo'] : data['messages'][key]['UserFrom'];
                return {
                    opponent: ApiProvider.getUser(user, user),
                    message: ApiProvider.getMessage(data['messages'][key])
                };
            });
            this.conversations = this.conversations.filter(item => {
                return !item.message.seen;
            });
            MyApp.counts.messages = this.counts.messages = this.conversations.length;
        });
    }

    openOfferFormModal() {
        let offerForm = this.modalCtrl.create(OfferFormComponent);
        offerForm.present();
    }

    showMyList() {
        this.navCtrl.push(MyOffersPage);
    }

    openMessages() {
        this.navCtrl.push(MessagesPage);
    }

    openConversation(idUser) {
        this.conversations = this.conversations.filter(item => {
            return item.opponent.id != idUser;
        });
        this.navCtrl.push(ConversationPage, {
            idUser: idUser
        });
    }

    deleteConversation(conversation: {message: Message, opponent: User}) {
        this.api.post('/neo_content/neo_content_inbox/delete/' + conversation.opponent.id, {
            data: {
                force: {
                    loggedUserIdBASE64: btoa(`user_:(${MyApp.loggedUser.id})`)
                }
            }
        }).then(() => {
            this.conversations = this.conversations.filter((item: {message: Message, opponent: User}) => {
                return item.opponent.id != conversation.opponent.id;
            });
            MyApp.counts.messages--;
        });
    }
}
