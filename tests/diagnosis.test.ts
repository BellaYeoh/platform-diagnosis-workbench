import test from "node:test";
import assert from "node:assert/strict";

import { validateDiagnosis } from "../src/diagnosis.js";

const evidence = [
  {
    id: "ev-1",
    toolCallId: "call-1",
    toolName: "get_page_config",
    data: {
      field: "nestedAddress",
      visible: false,
    },
  },
];

test("真实证据引用通过", () => {
  const result = validateDiagnosis(
    {
      summary: "字段不可见",
      findings: [
        {
          statement: "visible 为 false",
          evidenceIds: ["ev-1"],
        },
      ],
    },
    evidence,
  );

  assert.equal(result.findings.length, 1);
});

test("不存在的证据引用被拒绝", () => {
  assert.throws(() =>
    validateDiagnosis(
      {
        summary: "字段不可见",
        findings: [
          {
            statement: "visible 为 false",
            evidenceIds: ["ev-999"],
          },
        ],
      },
      evidence,
    ),
  );
});
