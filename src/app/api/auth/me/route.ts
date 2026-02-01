import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return unauthorizedResponse();
    }

    return successResponse({ user });
  } catch (error) {
    console.error("Get current user error:", error);
    return serverErrorResponse();
  }
}
