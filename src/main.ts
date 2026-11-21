import { investigate } from "./runner";

const input =
  process.argv[2] ?? "dynamic-form 页面中 nestedAddress 字段不显示，请检查配置";

try {
  const result = await investigate(input);

  console.dir(result.events, { depth: null });
  console.log("诊断回答：", result.answer);
} catch (error) {
  console.error(
    "任务失败：",
    error instanceof Error ? error.message : "未知错误",
  );
  process.exitCode = 1;
}
