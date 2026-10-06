import { db } from "./_db.mjs";

const people = [
  { id: 1, name: "Jesk", color: "#3b82f6" },
  { id: 2, name: "Data", color: "#22c55e" },
  { id: 3, name: "Voss", color: "#f97316" },
  { id: 4, name: "Tone", color: "#8b5cf6" },
  { id: 5, name: "Cletey", color: "#ef4444" },
  { id: 6, name: "Buster", color: "#111827" }
];

function response(body, status=200) {
  return new Response(JSON.stringify(body), {status, headers: {"Content-Type":"application/json"}});
}
function dateKey(d) {
  return d.toISOString().slice(0,10);
}
function streaks(dates) {
  const set = new Set(dates);
  const sorted = [...set].sort();
  let longest=0, run=0, prev=null;
  for (const s of sorted) {
    const d=new Date(s+"T00:00:00Z");
    if(prev && (d-prev)===86400000) run++; else run=1;
    prev=d; longest=Math.max(longest,run);
  }
  const today=new Date();
  const todayKey=dateKey(today);
  let start=new Date(todayKey+"T00:00:00Z");
  if(!set.has(todayKey)) start.setUTCDate(start.getUTCDate()-1);
  let current=0;
  while(set.has(dateKey(start))) { current++; start.setUTCDate(start.getUTCDate()-1); }
  return {current,longest};
}
export default async () => {
  const rows = await db.sql`SELECT member_id, sober_date, status FROM sober_days ORDER BY sober_date ASC`;
  const byPerson={};
  for(const p of people) byPerson[p.id]=[];
  for(const r of rows) if(byPerson[r.member_id] && r.status==="sober") byPerson[r.member_id].push(String(r.sober_date).slice(0,10));
  const stats=people.map(p=>{
    const days=byPerson[p.id]||[], s=streaks(days);
    return {...p,soberDays:days.length,currentStreak:s.current,longestStreak:s.longest};
  });
  return response({people:stats, entries:rows.map(r=>({...r,sober_date:String(r.sober_date).slice(0,10)}))});
};
export const config={path:"/api/data"};