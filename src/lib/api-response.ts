import { NextResponse } from "next/server";

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(error: string, status = 400): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error }, { status });
}

export function messageResponse(message: string, status = 200): NextResponse<ApiResponse> {
  return NextResponse.json({ success: true, message }, { status });
}

export function createdResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return successResponse(data, 201);
}

export function notFoundResponse(resource = "Recurso"): NextResponse<ApiResponse> {
  return errorResponse(`${resource} no encontrado`, 404);
}

export function unauthorizedResponse(message = "No autorizado"): NextResponse<ApiResponse> {
  return errorResponse(message, 401);
}

export function forbiddenResponse(message = "Acceso denegado"): NextResponse<ApiResponse> {
  return errorResponse(message, 403);
}

export function validationErrorResponse(message: string): NextResponse<ApiResponse> {
  return errorResponse(message, 422);
}

export function serverErrorResponse(message = "Error interno del servidor"): NextResponse<ApiResponse> {
  return errorResponse(message, 500);
}
