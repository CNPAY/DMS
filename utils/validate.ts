/**
 * 判断url是否是http或https
 * @param url URL字符串
 * @returns 是否为http或https链接
 */
export function isHttp(url: string): boolean {
  return url.indexOf('http://') !== -1 || url.indexOf('https://') !== -1;
}

/**
 * 判断path是否为外链
 * @param path 路径字符串
 * @returns 是否为外链
 */
export function isExternal(path: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(path);
}

/**
 * 验证用户名是否有效
 * @param str 用户名字符串
 * @returns 是否为有效用户名
 */
export function validUsername(str: string): boolean {
  const valid_map = ['admin', 'editor'];
  return valid_map.indexOf(str.trim()) >= 0;
}

/**
 * 验证URL格式是否正确
 * @param url URL字符串
 * @returns 是否为有效URL
 */
export function validURL(url: string): boolean {
  const reg =
    /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
  return reg.test(url);
}

/**
 * 验证字符串是否全为小写字母
 * @param str 字符串
 * @returns 是否全为小写字母
 */
export function validLowerCase(str: string): boolean {
  const reg = /^[a-z]+$/;
  return reg.test(str);
}

/**
 * 验证字符串是否全为大写字母
 * @param str 字符串
 * @returns 是否全为大写字母
 */
export function validUpperCase(str: string): boolean {
  const reg = /^[A-Z]+$/;
  return reg.test(str);
}

/**
 * 验证字符串是否全为字母
 * @param str 字符串
 * @returns 是否全为字母
 */
export function validAlphabets(str: string): boolean {
  const reg = /^[A-Za-z]+$/;
  return reg.test(str);
}

/**
 * 验证邮箱格式是否正确
 * @param email 邮箱字符串
 * @returns 是否为有效邮箱
 */
export function validEmail(email: string): boolean {
  const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return reg.test(email);
}

/**
 * 判断是否为字符串类型
 * @param str 待检测值
 * @returns 是否为字符串
 */
export function isString(str: unknown): str is string {
  return typeof str === 'string' || str instanceof String;
}

/**
 * 判断是否为数组类型
 * @param arg 待检测值
 * @returns 是否为数组
 */
export function isArray(arg: unknown): arg is unknown[] {
  if (typeof Array.isArray === 'undefined') {
    return Object.prototype.toString.call(arg) === '[object Array]';
  }
  return Array.isArray(arg);
}

/**
 * 验证域名格式是否正确
 * @param domain 域名字符串
 * @returns 是否为有效域名
 */
export function validDomain(domain: string): boolean {
  const reg = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
  return reg.test(domain);
}

/**
 * 验证手机号格式是否正确（中国大陆）
 * @param phone 手机号字符串
 * @returns 是否为有效手机号
 */
export function validPhone(phone: string): boolean {
  const reg = /^1[3-9]\d{9}$/;
  return reg.test(phone);
}

/**
 * 验证身份证号格式是否正确（中国大陆）
 * @param idCard 身份证号字符串
 * @returns 是否为有效身份证号
 */
export function validIdCard(idCard: string): boolean {
  const reg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  return reg.test(idCard);
} 