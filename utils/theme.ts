// 处理主题样式

/**
 * 处理主题样式
 * @param theme 主题颜色（十六进制格式，如 #409EFF）
 */
export function handleThemeStyle(theme: string): void {
  document.documentElement.style.setProperty('--el-color-primary', theme);
  // 去除所有按钮的边框
  document.documentElement.style.setProperty('--el-border-width', '0');
  // 默认灰色背景按钮
  document.documentElement.style.setProperty('--el-fill-color-blank', '#F2F3F5');

  for (let i = 1; i <= 9; i++) {
    document.documentElement.style.setProperty(`--el-color-primary-light-${i}`, getLightColor(theme, i / 10));
  }
  for (let i = 1; i <= 9; i++) {
    document.documentElement.style.setProperty(`--el-color-primary-dark-${i}`, getDarkColor(theme, i / 10));
  }
}

/**
 * hex颜色转rgb颜色
 * @param str 十六进制颜色字符串
 * @returns RGB数组 [r, g, b]
 */
export function hexToRgb(str: string): number[] {
  str = str.replace('#', '');
  const hexs = str.match(/../g);
  if (!hexs) return [0, 0, 0];
  
  const rgb: number[] = [];
  for (let i = 0; i < 3; i++) {
    rgb[i] = parseInt(hexs[i], 16);
  }
  return rgb;
}

/**
 * rgb颜色转Hex颜色
 * @param r 红色值 (0-255)
 * @param g 绿色值 (0-255)
 * @param b 蓝色值 (0-255)
 * @returns 十六进制颜色字符串
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const hexs = [r.toString(16), g.toString(16), b.toString(16)];
  for (let i = 0; i < 3; i++) {
    if (hexs[i].length === 1) {
      hexs[i] = `0${hexs[i]}`;
    }
  }
  return `#${hexs.join('')}`;
}

/**
 * 变浅颜色值
 * @param color 十六进制颜色字符串
 * @param level 变浅程度 (0-1)
 * @returns 变浅后的十六进制颜色字符串
 */
export function getLightColor(color: string, level: number): string {
  const rgb = hexToRgb(color);
  for (let i = 0; i < 3; i++) {
    rgb[i] = Math.floor((255 - rgb[i]) * level + rgb[i]);
  }
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
}

/**
 * 变深颜色值
 * @param color 十六进制颜色字符串
 * @param level 变深程度 (0-1)
 * @returns 变深后的十六进制颜色字符串
 */
export function getDarkColor(color: string, level: number): string {
  const rgb = hexToRgb(color);
  for (let i = 0; i < 3; i++) {
    rgb[i] = Math.floor(rgb[i] * (1 - level));
  }
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
} 