import{getSessionUser}from"@/lib/auth";export async function requireStaff(){const user=await getSessionUser();if(!user?.role)return null;return user}
