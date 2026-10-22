import test from "node:test";
import assert from "node:assert/strict";
import { ownerReplySchema } from "../src/lib/validation/schemas/ratings.ts";

test("ownerReplySchema validation", async (t) => {
  await t.test("accepts valid owner reply", () => {
    const res = ownerReplySchema.safeParse({ owner_reply: "Thank you for the thoughtful review!" });
    assert.equal(res.success, true);
    if (res.success) {
      assert.equal(res.data.owner_reply, "Thank you for the thoughtful review!");
    }
  });

  await t.test("trims whitespace from owner reply", () => {
    const res = ownerReplySchema.safeParse({ owner_reply: "   Trimmed reply   " });
    assert.equal(res.success, true);
    if (res.success) {
      assert.equal(res.data.owner_reply, "Trimmed reply");
    }
  });

  await t.test("rejects empty or whitespace-only reply", () => {
    const empty = ownerReplySchema.safeParse({ owner_reply: "" });
    assert.equal(empty.success, false);

    const whitespace = ownerReplySchema.safeParse({ owner_reply: "   " });
    assert.equal(whitespace.success, false);
  });

  await t.test("rejects reply exceeding 5000 characters", () => {
    const longText = "a".repeat(5001);
    const res = ownerReplySchema.safeParse({ owner_reply: longText });
    assert.equal(res.success, false);
  });
});

test("Route handler authorization and logic checks", async (t) => {
  const { PUT, DELETE } = await import("../src/app/api/ratings/[id]/reply/route.ts");

  await t.test("PUT returns 401 when Authorization header is missing", async () => {
    const req = new Request("http://localhost/api/ratings/1/reply", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner_reply: "Test reply" }),
    });

    const res = await PUT(req, { params: Promise.resolve({ id: "1" }) });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.error, "Unauthorized");
  });

  await t.test("DELETE returns 401 when Authorization header is missing", async () => {
    const req = new Request("http://localhost/api/ratings/1/reply", {
      method: "DELETE",
    });

    const res = await DELETE(req, { params: Promise.resolve({ id: "1" }) });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.error, "Unauthorized");
  });

  await t.test("PUT returns 400 when owner_reply is empty or invalid", async () => {
    const { signToken } = await import("../src/lib/auth.ts");
    const token = signToken({ userId: 1, role: "contributor" });
    const req = new Request("http://localhost/api/ratings/1/reply", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ owner_reply: "" }),
    });

    const res = await PUT(req, { params: Promise.resolve({ id: "1" }) });
    assert.equal(res.status, 400);
  });
});

