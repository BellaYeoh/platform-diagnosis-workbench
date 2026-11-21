import { tool } from "langchain";
import { z } from "zod";

// 全部为虚拟练习数据
const pages = {
  "permission-management": {
    pageId: "permission-management",
    version: "3.0.0",
    enabled: true,
    allowedRoles: ["admin"],
    fields: [
      { name: "roleName", visible: true },
      { name: "permissionScope", visible: false },
    ],
  },
  "dynamic-form": {
    pageId: "dynamic-form",
    version: "3.0.1",
    enabled: true,
    allowedRoles: ["admin", "editor"],
    fields: [
      { name: "customerName", visible: true },
      { name: "nestedAddress", visible: false },
    ],
  },
};

export const PageInput = z.object({
  pageId: z.string().min(1).describe("用户提供的页面标识"),
});

/**
 * 业务查询
 * @param input
 * @returns
 */
export function lookupPage(input: unknown) {
  const { pageId } = PageInput.parse(input);

  if (!Object.hasOwn(pages, pageId)) {
    return {
      ok: false,
      code: "PAGE_NOT_FOUND",
      message: "未找到该页面配置",
    };
  }

  return {
    ok: true,
    data: pages[pageId as keyof typeof pages],
  };
}

/**
 * 提供给模型使用的工具包装
 */
export const getPageConfig = tool(lookupPage, {
  name: "get_page_config", // 模型用这个名字发起调用（习惯用蛇形命名）
  // 模型读这个来决定"什么时候该调这个工具"。写得越清楚，模型调用越准确。里面还埋了行为约束："没有标识时先问，不要猜"
  description:
    "只读查询页面配置，包括版本、启用状态、允许角色和字段可见性。" +
    "必须有页面标识；没有标识时先询问用户，不要猜测",
  schema: PageInput, // 模型照着这个 schema 生成调用参数；运行时也用它自动校验
});
