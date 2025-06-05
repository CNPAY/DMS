import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

// 配置dayjs
dayjs.locale('zh-cn')
dayjs.extend(relativeTime)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

/**
 * 格式化日期时间
 * @param date 日期对象、日期字符串或时间戳
 * @param format 格式模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(date: Date | string | number, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return ''
  const dayjsObj = dayjs(date)
  if (!dayjsObj.isValid()) return ''
  return dayjsObj.format(format)
}

/**
 * 格式化日期（不含时间）
 * @param date 日期对象、日期字符串或时间戳
 * @returns 格式化后的日期字符串 YYYY-MM-DD
 */
export function formatDate(date: Date | string | number): string {
  return formatDateTime(date, 'YYYY-MM-DD')
}

/**
 * 格式化时间（不含日期）
 * @param date 日期对象、日期字符串或时间戳
 * @returns 格式化后的时间字符串 HH:mm:ss
 */
export function formatTime(date: Date | string | number): string {
  return formatDateTime(date, 'HH:mm:ss')
}

/**
 * 获取相对时间描述
 * @param date 日期对象、日期字符串或时间戳
 * @returns 相对时间描述，如"刚刚"、"5分钟前"等
 */
export function getRelativeTime(date: Date | string | number): string {
  if (!date) return ''
  const dayjsObj = dayjs(date)
  if (!dayjsObj.isValid()) return ''
  return dayjsObj.fromNow()
}

/**
 * 判断是否为今天
 * @param date 日期对象、日期字符串或时间戳
 * @returns 是否为今天
 */
export function isToday(date: Date | string | number): boolean {
  if (!date) return false
  const dayjsObj = dayjs(date)
  if (!dayjsObj.isValid()) return false
  return dayjsObj.isSame(dayjs(), 'day')
}

/**
 * 判断是否为昨天
 * @param date 日期对象、日期字符串或时间戳
 * @returns 是否为昨天
 */
export function isYesterday(date: Date | string | number): boolean {
  if (!date) return false
  const dayjsObj = dayjs(date)
  if (!dayjsObj.isValid()) return false
  return dayjsObj.isSame(dayjs().subtract(1, 'day'), 'day')
}

/**
 * 获取两个日期之间的天数差
 * @param date1 第一个日期
 * @param date2 第二个日期
 * @returns 天数差（date1 - date2）
 */
export function getDaysDiff(date1: Date | string | number, date2: Date | string | number): number {
  const d1 = dayjs(date1)
  const d2 = dayjs(date2)
  
  if (!d1.isValid() || !d2.isValid()) return 0
  
  return d1.diff(d2, 'day')
}

/**
 * 添加天数到日期
 * @param date 原始日期
 * @param days 要添加的天数
 * @returns 新的dayjs对象
 */
export function addDays(date: Date | string | number, days: number) {
  return dayjs(date).add(days, 'day')
}

/**
 * 获取月份的第一天
 * @param date 日期
 * @returns 该月的第一天
 */
export function getFirstDayOfMonth(date: Date | string | number) {
  return dayjs(date).startOf('month')
}

/**
 * 获取月份的最后一天
 * @param date 日期
 * @returns 该月的最后一天
 */
export function getLastDayOfMonth(date: Date | string | number) {
  return dayjs(date).endOf('month')
}

/**
 * 判断日期是否在指定范围内
 * @param date 要检查的日期
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 是否在范围内
 */
export function isBetween(date: Date | string | number, startDate: Date | string | number, endDate: Date | string | number): boolean {
  const d = dayjs(date)
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  
  if (!d.isValid() || !start.isValid() || !end.isValid()) return false
  
  return d.isSameOrAfter(start, 'day') && d.isSameOrBefore(end, 'day')
}

/**
 * 获取友好的日期显示
 * @param date 日期
 * @returns 友好的日期字符串，如"今天 14:30"、"昨天 09:15"、"2024-01-15 16:20"
 */
export function getFriendlyDateTime(date: Date | string | number): string {
  if (!date) return ''
  const dayjsObj = dayjs(date)
  if (!dayjsObj.isValid()) return ''
  
  if (isToday(date)) {
    return `今天 ${dayjsObj.format('HH:mm')}`
  } else if (isYesterday(date)) {
    return `昨天 ${dayjsObj.format('HH:mm')}`
  } else {
    return dayjsObj.format('YYYY-MM-DD HH:mm')
  }
} 