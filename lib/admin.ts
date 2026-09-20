import{getSessionUser}from"@/lib/auth";import type{StaffRole}from"@prisma/client";
export async function requireStaff(roles?:StaffRole[]){const user=await getSessionUser();if(!user?.role)return null;if(roles&&roles.length&&!roles.includes(user.role))return null;return user}
