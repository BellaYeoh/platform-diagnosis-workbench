import { z } from "zod";
import type { Evidence } from "./contracts.js";

export const DiagnosisSchema = z.object({
  summary: z.string(),
  findings: z
    .array(
      z.object({
        statement: z.string(),
        evidenceIds: z.array(z.string()),
      }),
    )
    .min(1),
});

export type Diagnosis = z.infer<typeof DiagnosisSchema>;

export function validateDiagnosis(
  input: unknown,
  evidence: Evidence[],
): Diagnosis {
  // 第 1 层：格式校验
  const diagnosis = DiagnosisSchema.parse(input);

  // 第 2 层：引用校验
  const knowIds = new Set(evidence.map((item) => item.id));

  for (const finding of diagnosis.findings) {
    if (finding.evidenceIds.length === 0) {
      throw new Error("发现缺少证据引用");
    }

    for (const id of finding.evidenceIds) {
      if (!knowIds.has(id)) {
        throw new Error(`证据不存在：${id}`);
      }
    }
  }

  return diagnosis;
}
