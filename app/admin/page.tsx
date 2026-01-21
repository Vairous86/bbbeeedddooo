"use client";

import React, { useEffect, useState } from "react";

export default function AdminPage() {
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

  const updating = async (id: string, newTitle: string) => {
    try {
      await fetch("/api/data", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": (process.env.NEXT_PUBLIC_API_KEY as string) || "",
        },
        body: JSON.stringify({ id, title: newTitle }),
      });
      load();
    } catch (err) {
      console.error("Error updating item:", err);
    }
  };

  const deleting = async (id: string) => {
    try {
      await fetch("/api/data", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": (process.env.NEXT_PUBLIC_API_KEY as string) || "",
        },
        body: JSON.stringify({ id }),
      });
      load();
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  if (error)
    return (
      <div className="container mx-auto p-6">Error loading data: {error}</div>
    );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

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
          <div key={it.id} className="p-3 border rounded flex justify-between items-center">
            <div>
              <div className="text-sm text-muted">{it.createdAt}</div>
              <div className="font-medium">{it.title || JSON.stringify(it)}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const newTitle = prompt("Enter new title", it.title);
                  if (newTitle) updating(it.id, newTitle);
                }}
                className="px-2 py-1 bg-blue-500 text-white rounded"
              >
                Update
              </button>
              <button
                onClick={() => deleting(it.id)}
                className="px-2 py-1 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
