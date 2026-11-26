import { tool } from "langchain";
import { z } from "zod";

export const PageInput = z.object({
  pageId: z.string().trim().min(1),
});

// 全部为虚拟练习数据
const pages: Record<string, unknown> = {
  "permission-management": {
    pageId: "permission-management",
    version: "3.0.0",
    fields: [
      { name: "roleName", visible: true },
      { name: "permissionScope", visible: false },
    ],
  },
  "dynamic-form": {
    pageId: "dynamic-form",
    version: "3.0.1",
    fields: [
      { name: "customerName", visible: true },
      { name: "nestedAddress", visible: false },
    ],
  },
};

// 只负责查询，不负责权限、模型调用或错误包装
export function lookupPage(pageId: string): Promise<unknown | undefined> {
  return Promise.resolve(pages[pageId]);
}

// 用于向模型提供工具说明
export const getPageConfig = tool(
  async ({ pageId }) => {
    return lookupPage(pageId);
  },
  {
    name: "get_page_config",
    description:
      "只读查询页面配置。" +
      "必须使用用户提供的页面标识。" +
      "没有页面标识时先询问用户，不要猜测。",
    schema: PageInput, // 模型照着这个 schema 生成调用参数；运行时也用它自动校验
  },
);
