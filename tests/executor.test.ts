import test from "node:test";
import assert from "node:assert/strict";

import { executeTool } from "../src/executor.js";

function request(name: string, args: unknown) {
  return {
    id: "call-test-1",
    name,
    args,
  };
}

test("合法页面查询成功", async () => {
  const result = await executeTool(
    request("get_page_config", {
      pageId: "dynamic-form",
    }),
  );
  assert.equal(result.ok, true);
});

test("缺少 pageId 返回参数错误", async () => {
  const result = await executeTool(request("get_page_config", {}));

  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(result.error.code, "INVALID_ARGUMENTS");
  }
});

test("业务拒绝时，不执行查询", async () => {
  let queryCount = 0;

  const result = await executeTool(
    request("get_page_config", {
      pageId: "permission-management",
    }),
    async () => {
      queryCount++;
      return {};
    },
  );

  assert.equal(queryCount, 0);
  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(result.error.code, "BUSINESS_RULE_DENIED");
  }
});

test("未知页面返回 PAGE_NOT_FOUND", async () => {
  const result = await executeTool(
    request("get_page_config", {
      pageId: "unknown-page",
    }),
  );

  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(result.error.code, "PAGE_NOT_FOUND");
  }
});

test("查询异常返回执行失败", async () => {
  const result = await executeTool(
    request("get_page_config", {
      pageId: "dynamic-form",
    }),
    async () => {
      throw new Error("模拟数据库异常");
    },
  );

  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(result.error.code, "TOOL_EXECUTION_FAILED");
  }
});
