import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

type Item = { id: string; createdAt?: string; [key: string]: any };

const INDEX_KEY = "data:ids";
const PREFIX = "data:";

const requireApiKey = (req: Request) => {
  const key = req.headers.get("x-api-key");
  const expected = process.env.API_KEY;
  if (!expected) return false; // if not set, disallow writes
  return key === expected;
};

async function readAll(): Promise<Item[]> {
  const ids = (await kv.get<string[]>(INDEX_KEY)) || [];
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const items = await Promise.all(
    ids.map((id: string) => kv.get<Item>(PREFIX + id))
  );
  return items.filter(Boolean) as Item[];
}

export async function GET() {
  try {
    const data = await readAll();
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!requireApiKey(request))
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    const body = (await request.json()) as Record<string, any>;
    if (!body || typeof body !== "object")
      return NextResponse.json(
        { ok: false, error: "Invalid body" },
        { status: 400 }
      );

    const id =
      body.id ??
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? (crypto as any).randomUUID()
        : `${Date.now()}${Math.floor(Math.random() * 1000)}`);
    const createdAt = new Date().toISOString();
    const item: Item = { id, createdAt, ...body };

    // store item and update index
    await kv.set(PREFIX + id, item);
    const ids = (await kv.get<string[]>(INDEX_KEY)) || [];
    await kv.set(INDEX_KEY, [...ids, id]);

    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (!requireApiKey(request))
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    const body = (await request.json()) as Record<string, any>;
    if (!body?.id)
      return NextResponse.json(
        { ok: false, error: "Missing id" },
        { status: 400 }
      );

    const key = PREFIX + body.id;
    const existing = await kv.get<Item>(key);
    if (!existing)
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );

    const updated: Item = {
      ...existing,
      ...body,
      updatedAt: new Date().toISOString(),
    };
    await kv.set(key, updated);

    return NextResponse.json({ ok: true, item: updated }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!requireApiKey(request))
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    const body = (await request.json()) as { id?: string };
    if (!body?.id)
      return NextResponse.json(
        { ok: false, error: "Missing id" },
        { status: 400 }
      );

    const key = PREFIX + body.id;
    const exists = await kv.get(key);
    if (!exists)
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );

    await kv.del(key as any);
    const ids = (await kv.get<string[]>(INDEX_KEY)) || [];
    const next = ids.filter((i: string) => i !== body.id);
    await kv.set(INDEX_KEY, next);

    return NextResponse.json({ ok: true, id: body.id }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
