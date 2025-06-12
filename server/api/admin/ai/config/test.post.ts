import { ResponseData } from "~/server/utils/response";
import OpenAI from "openai";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { serviceKey, apiKey, baseUrl } = body;
    if (!serviceKey || !apiKey || !baseUrl) {
      return ResponseData.error("请填写完整的AI服务配置信息", 400);
    }
    const openai = new OpenAI({ apiKey, baseURL: baseUrl });
    const models = await openai.models.list();
    return ResponseData.success(models, "连接成功，支持的模型：" + models.data.map((item) => item.id).join(", "));
  } catch (e: any) {
    return ResponseData.error("连接失败: " + (e?.message || "未知错误"));
  }
});
