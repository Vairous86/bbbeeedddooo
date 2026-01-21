"use client";

import React, { useEffect, useState } from "react";

export default function DataPage() {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/data");
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      setItems(json?.data || []);
      setError(null);
    } catch (err: any) {
      setError(err?.message || String(err));
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 2000);
    return () => clearInterval(id);
  }, []);

  const adding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const body = { title };
    await fetch("/api/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": (process.env.NEXT_PUBLIC_API_KEY as string) || "",
      },
      body: JSON.stringify(body),
    });
    setTitle("");
    load();
  };

  if (error)
    return (
      <div className="container mx-auto p-6">Error loading data: {error}</div>
    );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Data</h1>

      <form onSubmit={adding} className="mb-6 flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="border p-2 flex-1"
        />
        <button className="px-4 py-2 bg-primary text-white">Add</button>
      </form>

      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="p-3 border rounded">
            <div className="text-sm text-muted">{it.createdAt}</div>
            <div className="font-medium">{it.title || JSON.stringify(it)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
