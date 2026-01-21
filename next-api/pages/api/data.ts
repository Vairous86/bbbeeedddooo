import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";

type Item = { id: string; [key: string]: any };

const DATA_KEY = "data";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      const data = (await kv.get<Item[]>(DATA_KEY)) || [];
      return res.status(200).json({ ok: true, data });
    }

    // For write operations, load current array
    const current = (await kv.get<Item[]>(DATA_KEY)) || [];

    if (req.method === "POST") {
      const body = req.body as Record<string, any>;
      const id = (Date.now() + Math.floor(Math.random() * 1000)).toString();
      const item: Item = { id, ...body };
      const next = [...current, item];
      await kv.set(DATA_KEY, next);
      return res.status(201).json({ ok: true, item });
    }

    if (req.method === "PUT") {
      const body = req.body as Record<string, any>;
      if (!body?.id)
        return res.status(400).json({ ok: false, error: "Missing id" });
      const idx = current.findIndex((r: Item) => r.id === body.id);
      if (idx === -1)
        return res.status(404).json({ ok: false, error: "Not found" });
      const updated = { ...current[idx], ...body };
      current[idx] = updated;
      await kv.set(DATA_KEY, current);
      return res.status(200).json({ ok: true, item: updated });
    }

    if (req.method === "DELETE") {
      const body = req.body as { id?: string };
      if (!body?.id)
        return res.status(400).json({ ok: false, error: "Missing id" });
      const exists = current.some((r: Item) => r.id === body.id);
      if (!exists)
        return res.status(404).json({ ok: false, error: "Not found" });
      const next = current.filter((r: Item) => r.id !== body.id);
      await kv.set(DATA_KEY, next);
      return res.status(200).json({ ok: true, id: body.id });
    }

    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ ok: false, error: err.message || String(err) });
  }
}
