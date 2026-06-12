export async function translate(text: string, source: string, target: string): Promise<string> {
  if (!text || source === target) return text;
  try {
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + source + '&tl=' + target + '&dt=t&q=' + encodeURIComponent(text);
    const r = await fetch(url); const j = await r.json();
    return (j[0] as any[]).map((x) => x[0]).join('');
  } catch { return text; }
}
