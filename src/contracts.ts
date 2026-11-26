export type ToolErrorCode =
  | "UNKNOWN_TOOL"          // 工具不在白名单
  | "INVALID_ARGUMENTS"     // 参数格式不对
  | "BUSINESS_RULE_DENIED"  // 业务规则拒绝（本次练习里 = 禁止查某页面）
  | "PAGE_NOT_FOUND"        // 页面不存在
  | "TOOL_EXECUTION_FAILED";// 查询时发生异常

export type ToolResult =
  | {
      ok: true;
      data: unknown;
    }
  | {
      ok: false;
      error: {
        code: ToolErrorCode;
        message: string;
      };
    };

export type ToolRequest = {
  id: string;
  name: string;
  args: unknown;
};

export type Evidence = {
  id: string;
  toolCallId: string;
  toolName: string;
  data: unknown;
};

export type RunStatus =
  | "completed"       // 有证据，正常出结论
  | "needs_input"     // 没有证据，模型在问用户要信息
  | "no_evidence"     // 页面没找到
  | "denied"          // 被业务规则拒绝
  | "failed"          // 其他失败
  | "limit_reached";  // 模型调用次数用完了
