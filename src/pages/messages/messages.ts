import {Component, ViewChild} from '@angular/core';
import {Content, NavController, NavParams} from 'ionic-angular';
import {Message} from "../../app/Entity/Message";
import {User} from "../../app/Entity/User";
import {MyApp} from "../../app/app.component";
import {ApiProvider} from "../../providers/api/api";
import {ConversationPage} from "../conversation/conversation";
import {Demand} from "../../app/Entity/Demand";

/**
 * Generated class for the MessagesPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
    selector: 'page-messages',
    templateUrl: 'messages.html',
})
export class MessagesPage {
    @ViewChild(Content) content: Content;
    private conversations = Array<{ message: Message, opponent: User }|Demand>();

    private counts;

    loaded = false;
    me = MyApp.loggedUser;

    constructor(public navCtrl: NavController, public navParams: NavParams, private api: ApiProvider) {
        this.counts = {
            messages: 0
        };
        api.getMessages(MyApp.loggedUser.id).then(data => {
            this.conversations = Object.keys(data['messages']).filter(key => {
                return key != '';
            }).map(key => {
                let user = data['messages'][key]['UserFrom']['User']['id'] == MyApp.loggedUser.id ? data['messages'][key]['UserTo'] : data['messages'][key]['UserFrom'];
                user['isFarmer'] = typeof user['NeoContentFarmersProfile'] !== 'undefined';
                return {
                    opponent: ApiProvider.getUser(user, user),
                    message: ApiProvider.getMessage(data['messages'][key])
                };
            });
            this.loaded = true;
        });
        this.api.getDemands(MyApp.loggedUser.id).then(data => {
            data['demands'].map(item => {
                this.api.fetchDemand(item['NeoContentDemand']['id_demand']).then(response => {
                    this.conversations.push(ApiProvider.getDemand(response['demand'], response['messages'], ApiProvider.getProduct(response['offer'])));
                });
            });
            //MyApp.counts.demands = data['demands'].length;
            this.counts = MyApp.counts;
            this.loaded = true;
        });
    }

    openConversation(idUser, conversation: {message: Message, opponent: User}) {
        conversation.message.seen = true;
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

    isDemand(message: { message: Message; opponent: User } | Demand) {
        return message instanceof Demand;
    }
}
