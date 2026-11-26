import { investigate } from "./runner.js";

const input =
  process.argv[2] ?? "dynamic-form 页面中 nestedAddress 字段不显示，请检查。";

try {
  const result = await investigate(input);

  console.log("\n 最终任务结果：");
  console.dir(result, { depth: null });
} catch (error) {
  console.error(
    "模型请求或程序执行失败：",
    error instanceof Error ? error.message : "未知错误",
  );
  process.exitCode = 1;
}
