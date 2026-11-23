import { z } from "zod";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  ToolMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import { model } from "./model";
import { investigate } from "./runner";

const input =
  process.argv[2] ?? "dynamic-form 页面中 nestedAddress 字段不显示，请检查配置";

/** 把一条消息转成一行纯文本，供诊断卡片调用阅读 */
function toTranscriptLine(message: BaseMessage): string {
  const content =
    typeof message.content === "string"
      ? message.content
      : JSON.stringify(message.content);

  if (message instanceof SystemMessage) return `[系统] ${content}`;
  if (message instanceof HumanMessage) return `[用户] ${content}`;
  if (message instanceof ToolMessage) return `[工具结果] ${content}`;
  if (message instanceof AIMessage) {
    const calls = (message.tool_calls ?? [])
      .map((call) => `${call.name}(${JSON.stringify(call.args)})`)
      .join("；");
    return `[助手] ${content}${calls ? `（动作：${calls}）` : ""}`;
  }
  return `[消息] ${content}`;
}

try {
  const result = await investigate(input);

  const Diagnosis = z.object({
    status: z.enum(["diagnosed", "need_input", "no_evidence"]),
    summary: z.string(),
    evidence: z.array(z.string()),
    suggestedActions: z.array(z.string()),
  });

  // 结构化输出的两个坑（针对 MiniMax 的 OpenAI 兼容接口实测）：
  // 1) withStructuredOutput 默认走 response_format=json_schema（OpenAI 专属能力），
  //    MiniMax 不支持，模型会返回 Markdown，解析时 JSON.parse 报 Unexpected token '#'。
  // 2) 不能直接把 investigate 的消息历史喂给这次调用：历史里含 get_page_config 的
  //    tool_calls/tool 消息，而本次 tools 列表里没有它，MiniMax 会忽略强制的
  //    tool_choice 只回文本，且解析器会静默返回 undefined。
  // 所以：显式用 functionCalling（走 tools + tool_choice，兼容性最好），
  // 并把调查过程转成纯文本记录，重新组织成"系统指令 + 一条用户消息"。
  const formatter = model.withStructuredOutput(Diagnosis, {
    method: "functionCalling",
    name: "submit_diagnosis",
    includeRaw: true,
  });

  const transcript = result.messages.map(toTranscriptLine).join("\n");

  const { raw, parsed } = await formatter.invoke([
    new SystemMessage(
      "将调查记录整理为诊断卡片。" +
        "只使用记录中实际出现的工具结果。" +
        "缺少页面标识时使用 need_input; " +
        "没有成功取得相关配置时使用 no_evidence。" +
        "不要声称执行了修复。",
    ),
    new HumanMessage(`调查记录：\n${transcript}\n\n请提交诊断卡片。`),
  ]);

  // 解析器在模型没调用工具时会静默返回 undefined（类型上看不出来），必须显式兜底
  if (!parsed) {
    throw new Error(
      `模型未调用 submit_diagnosis 工具，原始返回：${JSON.stringify(raw.content)}`,
    );
  }

  console.dir(parsed, { depth: null });
} catch (error) {
  console.error(
    "任务失败：",
    error instanceof Error ? error.message : "未知错误",
  );
  process.exitCode = 1;
}
