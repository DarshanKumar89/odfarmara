import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import {Storage} from "@ionic/storage";
import {User} from "../../app/Entity/User";
import {Product} from "../../app/Entity/Product";
import _ from "underscore";
import {Category} from "../../app/Entity/Category";
import moment from "moment";
import {MyApp} from "../../app/app.component";
import {AlertController} from "ionic-angular";
import {Demand} from "../../app/Entity/Demand";
import {Message} from "../../app/Entity/Message";

/*
  Generated class for the ApiProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class ApiProvider {

    public static URL = 'https://odfarmara.sk';
    alertPresented = false;
    errors = [];

    constructor(private http: Http, private storage: Storage, private alerts: AlertController) {
    }

    get(url, data = {}, error = false) {
        return this.doAjax('get', url, {}, error);
    }

    getOffers(url, id, data = {}, error = false) {
        return this.post(url, _.extend({
            _method: 'put',
            data: {
                force: {
                    loggedUserIdBASE64: btoa(`user_:(${id}de)`)
                }
            }
        }, data), id, error);
    }

    post(url, data, id: number = 0, error = false) {
        if (id > 0) {
            data = _.extend(data, {
                data: {
                    force: {
                        loggedUserIdBASE64: btoa(`user_:(${id}de)`)
                    }
                }
            });
        }
        return this.doAjax('post', url, data, error);
    }

    private doAjax(type, url, data = {}, error = false) {
        let params = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        };
        if (type !== 'post') {
            data = params;
        } else {
            data = JSON.stringify(data);
        }
        return new Promise((resolve, reject) => {
            let t = setTimeout((type, url, data, error) => {
                if (error) {
                    console.log(type);
                    console.log(url);
                    console.log(data);
                    console.log(error);
                    console.log((new Error()).stack);
                    this.error({}, reject);
                }

            }, 30 * 1000, type, url, data, error);
            this.errors.push(t);
            this.loadFresh(type, url, data, params, resolve, t);
            /*//console.log(ApiProvider.URL + url);
            //console.log(new Error().stack);
            this.storage.get(ApiProvider.URL + url + (type === 'get' ? '' : JSON.stringify(data)))
                .then(cached => {
                    if (cached === null) {
                        this.loadFresh(type, url, data, params, resolve, t);
                    } else {
                        resolve(cached);
                    }
                }).catch(() => {
            });*/
        });
    }

    private loadFresh(type, url, data, params, resolve, t) {
        this.http[type](ApiProvider.URL + url, data, params).subscribe(resp => {
            try {
                this.storage.set(ApiProvider.URL + url + (type === 'get' ? '' : JSON.stringify(data)), JSON.parse(resp['_body']));
                resolve(JSON.parse(resp['_body']));
            } catch (e) {
                this.storage.set(ApiProvider.URL + url + (type === 'get' ? '' : JSON.stringify(data)), resp['_body']);
                resolve(resp['_body']);
            }
            clearTimeout(t);
        }, error => {
            let err;
            try {
                err = JSON.parse(error['_body']);
            } catch (e) {
                err = {};
            }
            if (err['errCode'] == 8888) {
                this.storage.set('loggedUser', null).catch(error => {
                    console.error(error);
                });
            }
        })
    }

    private error(err, reject) {
        /*if (!this.alertPresented) {
            this.alertPresented = true;
            this.alerts.create({
                title: 'Chyba pripojenia',
                message: 'Prosím skúste to znova. Vaša požiadavka nebola spracovaná.',
                buttons: [
                    {
                        text: 'OK',
                        handler: () => {
                            this.alertPresented = false;
                        }
                    }
                ]
            }).present();
            for (let i in this.errors) {
                clearTimeout(this.errors[i]);
            }
            this.errors = [];
        }*/
        reject(err);
    }

    notifications() {
        return MyApp.loggedUser ? this.post('/neo_content/neo_content_inbox/unread', {
            data: {
                force: {
                    loggedUserIdBASE64: btoa(`user_:(${MyApp.loggedUser.id})`)
                }
            }
        }, 0, false) : new Promise<any>(res => {
        });
    }

    getCmsPage(id, slug) {
        return this.get('/cms/' + id + '-' + slug);
    }

    login(email, password) {
        return this.post('/login', {
            data: {
                User: {
                    username: email,
                    password: password
                }
            }
        }, 0, true);
    }

    register(email, password, isFarmer) {
        if (!isFarmer) {
            return this.post('/neo_shop/neo_shop_users/add', {
                data: {
                    agreement: true,
                    NeoShopUser: {
                        username: email,
                        password: password
                    }
                }
            }, 0, true);
        } else {
            return this.post('/neo_content/neo_content_farmers_profiles/register', {
                data: {
                    agreement: true,
                    User: {
                        username: email,
                        password: password
                    }
                }
            }, 0, true);
        }
    }

    static getUser(user, address) {
        if (user['isFarmer'] == undefined) {
            user['isFarmer'] = user['NeoShopUser'] == undefined || user['NeoShopUser']['id'] == undefined;
        }
        if (user['NeoUploadFile'] != undefined) {
            user['NeoUploadFile'] = user['NeoUploadFile'].sort((a, b) => {
                return a['description'] == 'cover' ? 1 : -1;
            });
        }
        let index = user['isFarmer'] ? 0 : (user['NeoUploadFile'] ? user['NeoUploadFile'].length - 1 : 0);
        return new User(
            typeof user['id'] === 'undefined' ? user['User']['id'] : user['id'],
            user['NeoUploadFile'] && user['NeoUploadFile'].length > 0 ? (user['NeoUploadFile'][index]['url'] ? user['NeoUploadFile'][index]['url']['main'] : (ApiProvider.URL + '/neo_files/' + user['NeoUploadFile'][index]['plugin'] + '/' + user['NeoUploadFile'][index]['model'] + '/' + user['NeoUploadFile'][index]['foreign_key'] + '/' + user['NeoUploadFile'][index]['filename'])) : null,
            user['NeoUploadFile'] && user['NeoUploadFile'].length > 1 ? (user['NeoUploadFile'][1]['url'] ? user['NeoUploadFile'][1]['url']['main'] : (ApiProvider.URL + '/neo_files/' + user['NeoUploadFile'][1]['plugin'] + '/' + user['NeoUploadFile'][1]['model'] + '/' + user['NeoUploadFile'][1]['foreign_key'] + '/' + user['NeoUploadFile'][1]['filename'])) : null,
            (user['isFarmer'] ? (user['NeoContentFarmersProfile'] ? user['NeoContentFarmersProfile']['name'] : '') : (user['NeoShopUser'] ? user['NeoShopUser']['name'] : '')) == '' ? user['username'] : user['isFarmer'] ? user['NeoContentFarmersProfile']['name'] : user['NeoShopUser']['name'],
            user['isFarmer'] ? user['NeoContentFarmersProfile']['region_id'] : user['NeoShopUser']['region_id'],
            user['isFarmer'] ? user['NeoContentFarmersProfile']['long_description'] : user['NeoShopUser']['description'],
            user['isFarmer'] ? user['NeoContentFarmersProfile']['contact_name'] : user['NeoShopUser']['name'],
            user['isFarmer'] ? user['NeoContentFarmersProfile']['name'] : (address ? address['NeoShopAddress']['name'] : ''),
            user['isFarmer'] ? user['NeoContentFarmersProfile']['address'] : (address ? address['NeoShopAddress']['address'] : ''),
            user['isFarmer'] ? user['NeoContentFarmersProfile']['zip'] : (address ? address['NeoShopAddress']['zip'] : ''),
            user['isFarmer'] ? user['NeoContentFarmersProfile']['city'] : (address ? address['NeoShopAddress']['city'] : ''),
            user['isFarmer'] ? user['NeoContentFarmersProfile']['country_id'] : user['NeoShopUser']['country_id'],
            user['isFarmer'] ? user['NeoContentFarmersProfile']['stars'] : user['NeoShopUser']['stars'],
            typeof user['username'] === 'undefined' ? user['User']['username'] : user['username'],
            user['isFarmer'],
            user['isFarmer'] ? user['NeoContentFarmersProfile']['slug'] : '',
            user['isFarmer'] ? user['NeoContentFarmersProfile']['id'] : user['NeoShopUser']['id'],
            user['isFarmer'] ? {
                opening_hours: user['NeoContentFarmersProfile']['opening_hours'],
                post_send: user['NeoContentFarmersProfile']['post_send'],
                phone: user['NeoContentFarmersProfile']['phone'],
                package_type: user['NeoContentFarmersProfile']['package_type']
            } : {
                name: address ? address['NeoShopAddress']['name'] : '',
                phone: user['NeoShopUser']['phone'],
                idAddress: address ? address['NeoShopAddress']['id'] : 0
            }
        );
    }

    userEdit(user: User) {
        let upload = [];
        if (user.avatar != null) {
            upload.push([]);
        }
        return this.post('/user/edit', {
            _method: 'put',
            data: {
                force: {
                    loggedUserIdBASE64: btoa(`user_:(${user.id})`)
                }
            }
        });
    }

    getNearbyOffers(lat, lng, area = null) {
        return this.post(`/neo_content/neo_content_offers/getNearby`, {
            data: {
                lat: lat,
                lng: lng,
                area: area
            }
        }, 0, false);
    }

    getFavouriteOffers(id) {
        return this.post('/neo_content/neo_content_offers/show_favourites', {
            _method: 'put',
            data: {
                force: {
                    loggedUserIdBASE64: btoa(`user_:(${id})`)
                }
            }
        }, 0, false);
    }

    getMyOffers(id) {
        return this.post('/neo_content/neo_content_offers/show_list', {
            data: {
                force: {
                    loggedUserIdBASE64: btoa(`user_:(${id})`)
                }
            }
        }, 0, true);
    }

    getMessages(id) {
        return this.post('/neo_content/neo_content_inbox/show_list', {
            data: {
                force: {
                    loggedUserIdBASE64: btoa(`user_:(${id})`)
                }
            }
        }, 0, false);
    }

    getDemands(id) {
        return this.post('/neo_content/neo_content_demand/show_list', {
            data: {
                force: {
                    loggedUserIdBASE64: btoa(`user_:(${id})`)
                }
            }
        }, 0, true);
    }

    getConversation(id, idOpponent, idDemand = null, error = false) {
        return this.post(`/neo_content/neo_content_inbox/view/${idOpponent}`, {
            data: {
                force: {
                    loggedUserIdBASE64: btoa(`user_:(${id})`)
                }
            }
        }, 0, error);
    }

    static getProduct(product, user: User = null) {
        product['isFarmer'] = true;
        return new Product(
            product['NeoContentOffer']['id'],
            user !== null ? user : (product['NeoContentFarmersProfile'] ? ApiProvider.getUser(product, {'NeoShopAddress': {}}) : null),
            product['NeoContentOffer']['title'],
            product['NeoContentOffer']['description'],
            product['NeoContentOffer']['price'],
            product['NeoContentOffer']['price_type'],
            product['NeoContentOffer']['quantity'],
            new Date(product['NeoContentOffer']['start_date']),
            new Date(product['NeoContentOffer']['end_date']),
            product['NeoUploadFile'],
            product['main'],
            product['NeoContentCategory'] ? ApiProvider.getCategory(product['NeoContentCategory'][0] ? {
                "NeoContentCategory": product['NeoContentCategory'][0],
                "ParentNeoContentCategory": product['ParentNeoContentCategory']
            } : product) : null,
            product['NeoContentOffer']['unit_coef']
        );
    }

    static getNeoProduct(product: Product, user: User) {
        return {
            NeoContentOffer: {
                "id": product.id,
                "user_id": product.author.id,
                "created_by": product.author.id,
                "title": product.name,
                "description": product.description,
                "price": product.price,
                "price_type": product.priceType,
                "region_id": product.author.region == null ? 0 : product.author.region,
                "start_date": moment(product.validFrom).format('YYYY-MM-DD'),
                "end_date": moment(product.validUntil).format('YYYY-MM-DD'),
                "quantity": product.quantity,
                "unit_coef": product.qtyType,
                "neo_content_category_id": product.category.id,
                gallery: product.photos
            },
            "parent-category": product.category.parent.id,
            User: ApiProvider.getNeoUser(product.author),
            CreatedBy: ApiProvider.getNeoUser(product.author),
        };
    }

    static getCategory(category, prefix = '') {
        return new Category(
            category[prefix + 'NeoContentCategory']['id'],
            category[prefix + 'NeoContentCategory']['name'],
            category[prefix + 'NeoContentCategory']['icon'],
            category['ParentNeoContentCategory'] && category['ParentNeoContentCategory']['id'] && prefix == '' ? ApiProvider.getCategory(category, 'Parent') : null,
            category[prefix + 'NeoContentCategory']['children'] ? category[prefix + 'NeoContentCategory']['children'].map(cat => {
                return ApiProvider.getCategory(cat);
            }) : []
        );
    }

    private static getNeoUser(user: User) {
        return {
            "id": user.id,
            "username": user.email
        };
    }

    editUser(data) {
        if (typeof data['NeoShopUser'] != 'undefined') {
            return this.post('/neo_shop/neo_shop_users/edit', {
                _method: 'put',
                data: {
                    force: {
                        loggedUserIdBASE64: btoa(`user_:(${MyApp.loggedUser.id})`)
                    },
                    NeoShopUser: data.NeoShopUser,
                    '0': data[0]
                }
            }, 0, true);
        } else {
            return this.post('/neo_content/neo_content_farmers_profiles/edit', {
                _method: 'put',
                data: {
                    force: {
                        loggedUserIdBASE64: btoa(`user_:(${MyApp.loggedUser.id})`)
                    },
                    NeoContentFarmersProfile: data.NeoContentFarmersProfile
                }
            }, 0, true);
        }
    }

    fetchDemand(id, error = false) {
        return this.post('/neo_content/neo_content_demand/view/' + id, {
            _method: 'put',
            data: {
                force: {
                    loggedUserIdBASE64: btoa(`user_:(${MyApp.loggedUser.id})`)
                }
            }
        }, 0, error);
    }

    static getDemand(data, messages, product: Product = null, userEnt: User = null) {
        let user;
        if (userEnt != null) {
            user = MyApp.loggedUser.farmer ? messages[0]['UserFrom'] : messages[0]['UserTo'];
            data = _.extend(data, user);
            // data['isFarmer'] = !MyApp.loggedUser.farmer;
            user = ApiProvider.getUser(data, data);
        } else {
            user = userEnt;
        }
        product = product || ApiProvider.getProduct(data);

        return new Demand(
            product,
            user,
            data['NeoContentDemand']['quantity'],
            ApiProvider.getMessage(data['NeoContentInbox'].sort((a, b) => {
                return a['NeoContentInbox']['id_inbox'] > b['NeoContentInbox']['id_inbox'] ? 1 : -1;
            })[data['NeoContentInbox'].length - 1]),
            data['NeoContentDemand']['id_demand']
        );
    }

    static getMessage(data) {
        data['UserFrom']['isFarmer'] = !!data['UserFrom']['NeoContentFarmersProfile'];
        data['UserTo']['isFarmer'] = !!data['UserTo']['NeoContentFarmersProfile'];
        return new Message(
            data['NeoContentInbox']['id_inbox'],
            ApiProvider.getUser(data['UserFrom'], data['UserFrom']),
            ApiProvider.getUser(data['UserTo'], data['UserTo']),
            data['NeoContentInbox']['content'].replace(/href=(['"])\//g, 'href=$1https://odfarmara.sk/'),
            new Date(data['NeoContentInbox']['created']),
            !!data['NeoContentInbox']['seen'] || data['UserFrom']['User']['id'] == MyApp.loggedUser.id,
            null
        );
    }

    uploadBase64(content, model = 'NeoContentOffer', id = 0, remove = false) {
        return new Promise((resolve, reject) => {
            console.log('MODEL_ID');
            console.log(id);
            this.post(`/neo_upload/neo_upload_handler/apiUpload`, {
                data: {
                    force: {
                        loggedUserIdBASE64: btoa(`user_:(${MyApp.loggedUser.id})`)
                    },
                    content: content,
                    model: model,
                    id: id,
                    remove: remove
                }
            }).then(response => {
                resolve(response);
            }).catch(err => {
                throw err;
            });
        });
    }
}
