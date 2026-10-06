import { db } from "./_db.mjs";
function response(body,status=200){return new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json"}});}
export default async event=>{
 if(event.method!=="POST") return response({error:"Method not allowed"},405);
 let b;try{b=await event.json()}catch{return response({error:"Invalid JSON"},400);}
 const id=Number(b.memberId), date=String(b.date||"");
 await db.sql`DELETE FROM sober_days WHERE member_id=${id} AND sober_date=${date}`;
 return response({ok:true});
};
export const config={path:"/api/clear-status"};