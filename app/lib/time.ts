export function nextEdmontonMidnightISO(now = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Edmonton",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = fmt.formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");
  const current = { y: get("year"), m: get("month"), d: get("day") };
  const nextLocalDate = new Date(Date.UTC(current.y, current.m - 1, current.d + 1));
  const ty = nextLocalDate.getUTCFullYear();
  const tm = nextLocalDate.getUTCMonth() + 1;
  const td = nextLocalDate.getUTCDate();

  const start = Date.UTC(ty, tm - 1, td, 5, 0, 0);
  const end = Date.UTC(ty, tm - 1, td, 9, 0, 0);

  for (let ms = start; ms <= end; ms += 60_000) {
    const candidate = new Date(ms);
    const p = fmt.formatToParts(candidate);
    const val = (type: string) => Number(p.find((x) => x.type === type)?.value ?? "-1");
    if (val("year") === ty && val("month") === tm && val("day") === td && val("hour") === 0 && val("minute") === 0) {
      return candidate.toISOString();
    }
  }

  throw new Error("Could not resolve America/Edmonton midnight");
}
