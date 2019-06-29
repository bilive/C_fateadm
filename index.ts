import { Options as requestOptions } from 'request'
import Plugin, { tools, AppClient } from '../../plugin'

class Fateadm extends Plugin {
  constructor() {
    super()
  }
  public name = '斐斐打码'
  public description = '使用斐斐打码识别验证码'
  public version = '0.0.1'
  public author = 'lzghzr'
  /**
   * 获取设置
   *
   * @private
   * @type {options}
   * @memberof Fateadm
   */
  private _!: options
  public async load({ defaultOptions, whiteList }: {
    defaultOptions: options,
    whiteList: Set<string>
  }): Promise<void> {
    defaultOptions.config['fateadm'] = []
    defaultOptions.info['fateadm'] = {
      description: '斐斐打码',
      tip: '斐斐打码账号秘钥, 格式: pd_id,pd_key',
      type: 'stringArray'
    }
    whiteList.add('fateadm')
    this.loaded = true
  }
  public async options({ options }: { options: options }): Promise<void> {
    this._ = options
    tools.Captcha = captchaJPEG => this._captcha(captchaJPEG)
  }
  private async _captcha(captchaJPEG: string) {
    const [pd_id, pd_key] = <string[]>this._.config['fateadm']
    if (pd_id === undefined || pd_key === undefined) return ''
    const ts = AppClient.TS.toString()
    const img_data = captchaJPEG.split(',')[1]
    const send: requestOptions = {
      method: 'POST',
      uri: 'http://pred.fateadm.com/api/capreg',
      form: {
        user_id: pd_id,
        timestamp: ts,
        sign: tools.Hash('md5', `${pd_id}${ts}${tools.Hash('md5', `${ts}${pd_key}`)}`),
        app_id: '313482',
        asign: tools.Hash('md5', `313482${ts}${tools.Hash('md5', `${ts}nhdDy+k0+QMZaI1tpQbb5vlUmToIP0O7`)}`),
        predict_type: '30500',
        src_url: 'passport.bilibili.com',
        img_data
      },
      json: true,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
    const ruokuaiResponse = await tools.XHR<fateadmResponse>(send)
    if (ruokuaiResponse !== undefined && ruokuaiResponse.response.statusCode === 200) {
      const body = ruokuaiResponse.body
      if (body.RetCode === '0') {
        tools.Log('斐斐打码', 'RequestId', body.RequestId)
        const RspData = await tools.JSONparse<fateadmResponseData>(body.RspData)
        if (RspData !== undefined) return RspData.result
        else {
          tools.Log('斐斐打码', body.RspData)
          return ''
        }
      }
      else {
        tools.Log('斐斐打码', body.ErrMsg)
        return ''
      }
    }
    else {
      tools.Log('斐斐打码', '网络错误')
      return ''
    }
  }
}

/**
 * 斐斐打码返回
 *
 * @interface fateadmResponse
 */
interface fateadmResponse {
  RetCode: string
  ErrMsg: string
  RequestId: string
  RspData: string
}
interface fateadmResponseData {
  result: string
}

export default new Fateadm()