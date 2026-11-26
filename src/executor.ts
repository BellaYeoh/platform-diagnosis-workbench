import { PageInput, lookupPage } from "./tools.js";

import type { ToolRequest, ToolResult } from "./contracts.js";

type Lookup = (pageId: string) => Promise<unknown | undefined>;

export async function executeTool(
  request: ToolRequest,
  lookup: Lookup = lookupPage,
): Promise<ToolResult> {
  // 第 1 层：工具白名单
  if (request.name !== "get_page_config") {
    return {
      ok: false,
      error: {
        code: "UNKNOWN_TOOL",
        message: "请求的工具未注册",
      },
    };
  }

  // 第 2 层：参数格式
  const parsed = PageInput.safeParse(request.args);

  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "INVALID_ARGUMENTS",
        message: "pageId 必须是非空字符串",
      },
    };
  }

  const { pageId } = parsed.data;

  // 第 3 层：虚构业务规则
  // 仅用于练习，不是生产权限实现
  if (pageId === "permission-management") {
    return {
      ok: false,
      error: {
        code: "BUSINESS_RULE_DENIED",
        message: "当前练习不允许查询该页面",
      },
    };
  }

  // 第 4 层：实际查询
  try {
    const data = await lookup(pageId);

    if (data === undefined) {
      return {
        ok: false,
        error: {
          code: "PAGE_NOT_FOUND",
          message: "未找到页面配置",
        },
      };
    }

    return { ok: true, data };
  } catch {
    return {
      ok: false,
      error: {
        code: "TOOL_EXECUTION_FAILED",
        message: "配置查询发生异常",
      },
    };
  }
}
