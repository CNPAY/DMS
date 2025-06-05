import { ElMessage, ElMessageBox } from 'element-plus';

export const Notification = (msg = '', type: 'success' | 'warning' | 'info' | 'error' = 'success', delay = 4.5) => {
  ElMessage({
    message: msg,
    type,
    duration: delay * 1000,
    dangerouslyUseHTMLString: true
  });
};
/**
 * @description 需要确认的操作提示
 * @param {string} msg 提示的文本
 * @param {string} type 提示类型
 * @returns
 */
export const Confirm = async (msg = '', type: 'success' | 'warning' | 'info' | 'error' = 'warning') => {
  return ElMessageBox.confirm(msg || '确定', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type,
    dangerouslyUseHTMLString: true
  });
};
// 返回项目路径
export const getNormalPath = (p) => {
  if (p.length === 0 || !p || p == 'undefined') {
    return p;
  }
  const res = p.replace('//', '/');
  if (res[res.length - 1] === '/') {
    return res.slice(0, res.length - 1);
  }
  return res;
};

//自动聚焦未填写的表单项
export const autoFocus = (dom: Element) => {
  setTimeout(() => {
    const isError = dom.getElementsByClassName('is-error');
    const error = isError?.[0];
    if (error) {
      error.querySelector('input')?.focus();
    }
  }, 100);
};

export const deepMapList = <T extends { disabled?: boolean; children: T[] }>(list: T[], valueKey: string, textKey: string): T[] => {
  return list.map((x: T) => {
    const item = { value: x[valueKey], text: x[textKey] } as any;
    x.disabled && (item.disabled = true);
    if (Array.isArray(x.children)) {
      item.children = deepMapList(x.children, valueKey, textKey);
    }
    return item;
  });
};

export const deepFindValues = <T extends { value?: string; children: T[] }>(arr: T[], str: string, depth = 0): T[] => {
  const result: T[] = [];
  arr.forEach((x) => {
    if (x.value === str.split(',')[depth]) {
      result.push(x);
    }
    if (Array.isArray(x.children)) {
      result.push(...deepFindValues<T>(x.children, str, depth + 1));
    }
  });
  return result;
};

export const deepGetPath = <T extends { value: string; children: T[] }>(arr: T[], value: string): string[] | undefined => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].value === value) {
      return [value];
    }
    if (Array.isArray(arr[i].children)) {
      const temp = deepGetPath(arr[i].children, value);
      if (temp) {
        return [arr[i].value, temp].flat();
      }
    }
  }
};

// 根据一个对象获取下拉选择需要使用的options
export const getItemList = (labelMap: Record<string, string>) => {
  const result: { text: string; value: string }[] = [];
  for (const k in labelMap) {
    result.push({
      text: labelMap[k],
      value: k
    });
  }
  return result;
};

/** 简易弹窗 */
export function confirmBox(title: string, content: string, cb: (close: () => void) => Promise<void>): void {
  ElMessageBox.confirm(content, title, {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, ctx, close) => {
      if (action !== 'confirm') {
        close();
        return;
      }
      ctx.confirmButtonLoading = true;
      cb(close)
        .finally(() => {
          ctx.confirmButtonLoading = false;
        })
        .catch(() => {
          ctx.confirmButtonLoading = false;
        });
    }
  });
}
/**
 * 将 Base64 字符串转换为 ArrayBuffer。
 */
export function fromBase64(base64) {
  const binary = window.atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
