import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, Injectable, Injector, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';

import {MyApp} from './app.component';
import {CmsPage} from "../pages/cms/cms";

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {ProfileFarmerPage} from "../pages/profile-farmer/profile-farmer";
import {SettingsPage} from "../pages/settings/settings";
import {ProductDetailPage} from "../pages/product-detail/product-detail";
import {AccountFarmerPage} from "../pages/account-farmer/account-farmer";
import {MyOffersPage} from "../pages/my-offers/my-offers";
import {ConversationPage} from "../pages/conversation/conversation";
import {LoginPage} from "../pages/login/login";
import {MessagesPage} from "../pages/messages/messages";
import {OfferListPage} from "../pages/offer-list/offer-list";
import {HomeCustomerPage} from "../pages/home-customer/home-customer";
import {HomeFarmerPage} from "../pages/home-farmer/home-farmer";
import {ApiProvider} from '../providers/api/api';
import {HttpModule} from "@angular/http";
import {IonicStorageModule} from "@ionic/storage";
import {OfferViewComponent} from '../components/offer-view/offer-view';
import {OfferMiniComponent} from '../components/offer-mini/offer-mini';
import {Geolocation} from '@ionic-native/geolocation';
import {DemandsPage} from "../pages/demands/demands";
import {OfferFormComponent} from '../components/offer-form/offer-form';
import {BtnFavouritesComponent} from '../components/btn-favourites/btn-favourites';
import {AccountCustomerPage} from "../pages/account-customer/account-customer";
import {FileTransfer} from "@ionic-native/file-transfer";
import {RegionSelectComponent} from '../components/region-select/region-select';
import {MapPage} from "../pages/map/map";
import {AutoCompleteModule} from "ionic2-auto-complete"
import {RegionAutocompleteProvider} from '../providers/region-autocomplete/region-autocomplete';
import {Deeplinks} from '@ionic-native/deeplinks';
import {BackgroundMode} from '@ionic-native/background-mode';
import {LocalNotifications} from '@ionic-native/local-notifications';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core'
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {ForgotPasswordPage} from "../pages/forgot-password/forgot-password";
import {Camera} from "@ionic-native/camera";
import {RegisterPage} from "../pages/register/register";
import {MessageComponent} from "../components/message/message";
import {PipesModule} from "../pipes/pipes.module";
import {Network} from "@ionic-native/network";
import {CustomImgComponent} from "../components/custom-img/custom-img";
import {GooglePlus} from "@ionic-native/google-plus";
import {Facebook} from "@ionic-native/facebook";
import {Pro} from '@ionic/pro';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '-1.json');
}

Pro.init('193a70ae', {
    appVersion: '1.0.14'
});

@Injectable()
class MyEH implements ErrorHandler {
    ionicErrorHandler: IonicErrorHandler;

    constructor(injector: Injector) {
        try {
            this.ionicErrorHandler = injector.get(IonicErrorHandler);
        } catch (e) {
            // Unable to get the IonicErrorHandler provider, ensure
            // IonicErrorHandler has been added to the providers list below
        }
    }


    handleError(error: any): void {
        console.error('ERROR');
        console.error(error);
        console.error(error.message);
        console.error(error.stack);
        Pro.monitoring.handleNewError(error);
        // Remove this if you want to disable Ionic's auto exception handling
        // in development mode.
        this.ionicErrorHandler && this.ionicErrorHandler.handleError(error);
    }

}

@NgModule({
    declarations: [
        MyApp,
        CmsPage,
        SettingsPage,
        ProfileFarmerPage,
        ProductDetailPage,
        AccountFarmerPage,
        AccountCustomerPage,
        MyOffersPage,
        ConversationPage,
        LoginPage,
        MessagesPage,
        DemandsPage,
        OfferListPage,
        HomeCustomerPage,
        HomeFarmerPage,
        MapPage,
        OfferFormComponent,
        OfferViewComponent,
        OfferMiniComponent,
        MessageComponent,
        BtnFavouritesComponent,
        RegionSelectComponent,
        ForgotPasswordPage,
        RegisterPage,
        CustomImgComponent
    ],
    imports: [
        BrowserModule,
        HttpModule,
        IonicModule.forRoot(MyApp, {
            mode: 'md',
            scrollPadding: true,
            scrollAssist: true,
            autoFocusAssist: true
        }),
        IonicStorageModule.forRoot(),
        AutoCompleteModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        }),
        PipesModule
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        CmsPage,
        SettingsPage,
        ProfileFarmerPage,
        ProductDetailPage,
        AccountFarmerPage,
        AccountCustomerPage,
        MyOffersPage,
        ConversationPage,
        LoginPage,
        MessagesPage,
        DemandsPage,
        OfferListPage,
        HomeCustomerPage,
        HomeFarmerPage,
        MapPage,
        MessageComponent,
        OfferFormComponent,
        ForgotPasswordPage,
        RegisterPage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        {provide: ErrorHandler, useClass: MyEH},
        ApiProvider,
        Geolocation,
        FileTransfer,
        RegionAutocompleteProvider,
        Deeplinks,
        BackgroundMode,
        LocalNotifications,
        TranslateService,
        HttpModule,
        HttpClientModule,
        Camera,
        Network,
        GooglePlus,
        Facebook,
        IonicErrorHandler
    ]
})
export class AppModule {
}
