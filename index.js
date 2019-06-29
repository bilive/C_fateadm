"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_1 = __importStar(require("../../plugin"));
class Fateadm extends plugin_1.default {
    constructor() {
        super();
        this.name = '斐斐打码';
        this.description = '使用斐斐打码识别验证码';
        this.version = '0.0.1';
        this.author = 'lzghzr';
    }
    async load({ defaultOptions, whiteList }) {
        defaultOptions.config['fateadm'] = [];
        defaultOptions.info['fateadm'] = {
            description: '斐斐打码',
            tip: '斐斐打码账号秘钥, 格式: pd_id,pd_key',
            type: 'stringArray'
        };
        whiteList.add('fateadm');
        this.loaded = true;
    }
    async options({ options }) {
        this._ = options;
        plugin_1.tools.Captcha = captchaJPEG => this._captcha(captchaJPEG);
    }
    async _captcha(captchaJPEG) {
        const [pd_id, pd_key] = this._.config['fateadm'];
        if (pd_id === undefined || pd_key === undefined)
            return '';
        const ts = plugin_1.AppClient.TS.toString();
        const img_data = captchaJPEG.split(',')[1];
        const send = {
            method: 'POST',
            uri: 'http://pred.fateadm.com/api/capreg',
            form: {
                user_id: pd_id,
                timestamp: ts,
                sign: plugin_1.tools.Hash('md5', `${pd_id}${ts}${plugin_1.tools.Hash('md5', `${ts}${pd_key}`)}`),
                app_id: '313482',
                asign: plugin_1.tools.Hash('md5', `313482${ts}${plugin_1.tools.Hash('md5', `${ts}nhdDy+k0+QMZaI1tpQbb5vlUmToIP0O7`)}`),
                predict_type: '30500',
                src_url: 'passport.bilibili.com',
                img_data
            },
            json: true,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        };
        const ruokuaiResponse = await plugin_1.tools.XHR(send);
        if (ruokuaiResponse !== undefined && ruokuaiResponse.response.statusCode === 200) {
            const body = ruokuaiResponse.body;
            if (body.RetCode === '0') {
                plugin_1.tools.Log('斐斐打码', 'RequestId', body.RequestId);
                const RspData = await plugin_1.tools.JSONparse(body.RspData);
                if (RspData !== undefined)
                    return RspData.result;
                else {
                    plugin_1.tools.Log('斐斐打码', body.RspData);
                    return '';
                }
            }
            else {
                plugin_1.tools.Log('斐斐打码', body.ErrMsg);
                return '';
            }
        }
        else {
            plugin_1.tools.Log('斐斐打码', '网络错误');
            return '';
        }
    }
}
exports.default = new Fateadm();
