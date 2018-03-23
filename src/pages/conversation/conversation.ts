import {Component, ViewChild} from '@angular/core';
import {Content, NavController, NavParams} from 'ionic-angular';
import {Message} from "../../app/Entity/Message";
import {User} from "../../app/Entity/User";
import {MyApp} from "../../app/app.component";
import {ApiProvider} from "../../providers/api/api";

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

    private conversation: Array<Message>;
    private opponent: User = MyApp.emptyUser;
    private loggedUser: User;
    private body: string = '';

    constructor(public navCtrl: NavController, public navParams: NavParams, public api: ApiProvider) {
        this.loggedUser = MyApp.loggedUser;
        if(navParams.get('idDemand')) {
            this.api.fetchDemand(navParams.get('idDemand')).then(item => {
                this.conversation = item['messages'].map(it => {
                    let msg = ApiProvider.getMessage(it);
                    this.opponent = msg.userFrom.id === navParams.get('idUser') ? msg.userFrom : msg.userTo;
                    return msg;
                });
                setTimeout(() => {
                    this.content.scrollToBottom(20);
                }, 300)
            });
        } else {
            this.api.getConversation(
                MyApp.loggedUser.id,
                navParams.get('idUser')
            ).then(data => {
                this.conversation = data['messages'].map(it => {
                    let msg = ApiProvider.getMessage(it);
                    this.opponent = msg.userFrom.id === navParams.get('idUser') ? msg.userFrom : msg.userTo;
                    return msg;
                });
                setTimeout(() => {
                    this.content.scrollToBottom(20);
                }, 300)
            });
        }
    }

    sendMessage() {
        this.api.post('/neo_content/neo_content_inbox/add', {
            data: {
                NeoContentInbox: {
                    content: this.body,
                    id_user_from: MyApp.loggedUser.id,
                    id_user_to: this.navParams.get('idUser'),
                    id_demand: this.navParams.get('idDemand')
                },
                force: {
                    loggedUserIdBASE64: btoa(`user_:(${MyApp.loggedUser.id})`)
                }
            },
        }).then(response => {
        });
        this.conversation.push(new Message(
            0, MyApp.loggedUser, this.opponent, this.body, new Date, false
        ));
        this.body = '';
    }
}
