import lang_res_zh_CN from './zh_CN.js'
import lang_res_en_CN from './en_CN.js'

export function getIntlRes(lang) {
    if(lang == "en") return lang_res_en_CN
    return lang_res_zh_CN
}
