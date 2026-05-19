import { createStart, createMiddleware } from "@tanstack/react-start";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { ensureAdminSeeded } from "@/lib/admin.seed";
import { renderErrorPage } from "./lib/error-page";


const adminSeedMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    await ensureAdminSeeded();
  } catch (error) {
    console.error(error);
  }
  return next();
});

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [adminSeedMiddleware, errorMiddleware],
  functionMiddleware: [attachSupabaseAuth],
}));
