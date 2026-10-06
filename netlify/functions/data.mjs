import { db } from "./_db.mjs";

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store"
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS
  });
}

function todayInChicago() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function isValidDateString(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function dayNumber(dateString) {
  return Math.floor(Date.parse(`${dateString}T00:00:00Z`) / 86400000);
}

function calculateStats(dateStrings, today) {
  const dates = [...new Set(dateStrings)].sort();

  if (!dates.length) {
    return {
      sober_days: 0,
      current_streak: 0,
      longest_streak: 0
    };
  }

  let longest = 1;
  let run = 1;

  for (let i = 1; i < dates.length; i += 1) {
    if (dayNumber(dates[i]) - dayNumber(dates[i - 1]) === 1) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  const latest = dates[dates.length - 1];
  const gapFromToday = dayNumber(today) - dayNumber(latest);

  let current = 0;

  // A streak remains active through today or yesterday. This means
  // someone isn't penalized at the start of a day for not having
  // marked that day yet.
  if (gapFromToday === 0 || gapFromToday === 1) {
    current = 1;
    for (let i = dates.length - 1; i > 0; i -= 1) {
      if (dayNumber(dates[i]) - dayNumber(dates[i - 1]) === 1) {
        current += 1;
      } else {
        break;
      }
    }
  }

  return {
    sober_days: dates.length,
    current_streak: current,
    longest_streak: longest
  };
}

async function getState() {
  const today = todayInChicago();

  const members = await db.sql`
    SELECT id, name
    FROM members
    ORDER BY id ASC
  `;

  const rows = await db.sql`
    SELECT member_id, sober_date::text AS sober_date
    FROM sober_days
    ORDER BY sober_date ASC
  `;

  const datesByMember = new Map();

  for (const row of rows) {
    if (!datesByMember.has(row.member_id)) {
      datesByMember.set(row.member_id, []);
    }
    datesByMember.get(row.member_id).push(row.sober_date);
  }

  const enriched = members.map((member) => {
    const sober_dates = datesByMember.get(member.id) ?? [];
    const stats = calculateStats(sober_dates, today);

    return {
      ...member,
      sober_dates,
      ...stats
    };
  });

  enriched.sort((a, b) =>
    b.sober_days - a.sober_days ||
    b.current_streak - a.current_streak ||
    b.longest_streak - a.longest_streak ||
    a.name.localeCompare(b.name)
  );

  const total = enriched.reduce((sum, member) => sum + member.sober_days, 0);
  const average = enriched.length ? Math.round(total / enriched.length) : 0;

  return {
    members: enriched,
    total,
    average,
    today
  };
}

export default async (req) => {
  try {
    if (req.method === "GET") {
      return json(await getState());
    }

    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid request body." }, 400);
    }

    const memberId = Number(body.memberId);
    const date = body.date;

    if (!Number.isInteger(memberId) || !isValidDateString(date)) {
      return json({ error: "A valid member and date are required." }, 400);
    }

    const today = todayInChicago();

    if (date > today) {
      return json({ error: "You cannot mark a future day." }, 400);
    }

    const member = await db.sql`
      SELECT id, name
      FROM members
      WHERE id = ${memberId}
    `;

    if (!member.length) {
      return json({ error: "Member not found." }, 404);
    }

    const existing = await db.sql`
      SELECT id
      FROM sober_days
      WHERE member_id = ${memberId}
        AND sober_date = ${date}::date
    `;

    if (existing.length) {
      await db.sql`
        DELETE FROM sober_days
        WHERE member_id = ${memberId}
          AND sober_date = ${date}::date
      `;
    } else {
      await db.sql`
        INSERT INTO sober_days (member_id, sober_date)
        VALUES (${memberId}, ${date}::date)
      `;
    }

    return json(await getState());
  } catch (error) {
    console.error(error);
    return json({
      error: "The server could not update the sober-day record."
    }, 500);
  }
};

export const config = {
  path: "/api/data"
};
