import { investigate } from "./runner.js";
import { model } from "./model.js";

import { DiagnosisSchema, validateDiagnosis } from "./diagnosis.js";

const input =
  process.argv[2] ?? "dynamic-form 页面中 nestedAddress 字段不显示，请检查。";

try {
  const result = await investigate(input);

  if (result.status === "completed") {
    // MiniMax 网关不支持 response_format: json_schema，
    // 必须显式用 functionCalling（第 1 阶段工具调用已验证可用）
    const formatter = model.withStructuredOutput(DiagnosisSchema, {
      method: "functionCalling",
    });

    const draft = await formatter.invoke([
      {
        role: "system",
        content:
          "根据提供的工具证据生成诊断。" +
          "每条发现必须引用已有证据 ID。" +
          "不得编造原因，不得声称执行了修改。",
      },
      {
        role: "user",
        content: JSON.stringify({
          question: input,
          evidence: result.evidence,
        }),
      },
    ]);

    const diagnosis = validateDiagnosis(draft, result.evidence);

    console.log("\n通过引用校验的诊断：");
    console.dir(diagnosis, { depth: null });
  }

  console.log("\n 最终任务结果：");
  console.dir(result, { depth: null });
} catch (error) {
  console.error(
    "模型请求或程序执行失败：",
    error instanceof Error ? error.message : "未知错误",
  );
  process.exitCode = 1;
}
