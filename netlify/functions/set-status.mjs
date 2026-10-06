import { db } from "./_db.mjs";
const start="2026-10-05";
const allowed=new Set([1,2,3,4,5,6]);
function response(body,status=200){return new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json"}});}
export default async event=>{
  if(event.method!=="POST") return response({error:"Method not allowed"},405);
  let b; try{b=await event.json()}catch{return response({error:"Invalid JSON"},400);}
  const memberId=Number(b.memberId), date=String(b.date||""), status=String(b.status||"");
  if(!allowed.has(memberId)||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!["sober","drank"].includes(status)) return response({error:"Invalid status"},400);
  const today=new Date().toISOString().slice(0,10);
  if(date<start||date>today) return response({error:"That date cannot be recorded."},400);
  await db.sql`INSERT INTO sober_days(member_id,sober_date,status) VALUES(${memberId},${date},${status})
    ON CONFLICT(member_id,sober_date) DO UPDATE SET status=EXCLUDED.status`;
  return response({ok:true});
};
export const config={path:"/api/set-status"};