// Reflective journal (Return Loop Phase 2). Signed-in entries live in Supabase
// behind owner-only RLS; signed-out entries live in this browser and import to
// the account on the next signed-in visit - the same promise the plan makes.
import { supabase } from "@/lib/supabase";
import { track } from "@/lib/track";

export interface JournalEntry {
  id: string;
  body: string;
  task_ref: string | null;
  created_at: string;
  /** True when the entry lives only in this browser (signed-out). */
  local?: boolean;
}

const LS_KEY = "vetpath_journal_v1";

function readLocal(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function writeLocal(entries: JournalEntry[]): void {
  try { localStorage.setItem(LS_KEY, JSON.stringify(entries)); } catch { /* private mode */ }
}

export async function listEntries(userId: string | null, limit = 20): Promise<JournalEntry[]> {
  if (userId && supabase) {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("id, body, task_ref, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data || []) as JournalEntry[];
  }
  return readLocal().sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, limit);
}

export async function addEntry(userId: string | null, body: string, taskRef?: string): Promise<JournalEntry> {
  const trimmed = body.trim().slice(0, 4000);
  if (!trimmed) throw new Error("empty");
  track("journal-entry");
  if (userId && supabase) {
    const { data, error } = await supabase
      .from("journal_entries")
      .insert({ body: trimmed, task_ref: taskRef ? taskRef.slice(0, 300) : null })
      .select("id, body, task_ref, created_at")
      .single();
    if (error) throw new Error(error.message);
    return data as JournalEntry;
  }
  const entry: JournalEntry = {
    id: crypto.randomUUID(),
    body: trimmed,
    task_ref: taskRef ? taskRef.slice(0, 300) : null,
    created_at: new Date().toISOString(),
    local: true,
  };
  writeLocal([entry, ...readLocal()]);
  return entry;
}

export async function deleteEntry(userId: string | null, id: string): Promise<void> {
  if (userId && supabase) {
    const { error } = await supabase.from("journal_entries").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  writeLocal(readLocal().filter((e) => e.id !== id));
}

/** One-time import of browser-only entries into the signed-in account.
 *  Clears local storage only after every insert succeeded. */
export async function importLocalEntries(userId: string): Promise<number> {
  if (!supabase) return 0;
  const locals = readLocal();
  if (locals.length === 0) return 0;
  const { error } = await supabase.from("journal_entries").insert(
    locals.map((e) => ({ body: e.body, task_ref: e.task_ref, created_at: e.created_at })),
  );
  if (error) return 0; // keep local copies; retry next visit
  writeLocal([]);
  return locals.length;
}
