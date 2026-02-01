import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { updateBusinessHoursSchema } from "@/lib/validations/business";
import {
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api-response";
import type { DayOfWeek } from "@/types/models";

const DAYS_OF_WEEK: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export async function GET() {
  try {
    let hours = await prisma.businessHours.findMany({
      orderBy: {
        dayOfWeek: "asc",
      },
    });

    if (hours.length === 0) {
      hours = await Promise.all(
        DAYS_OF_WEEK.map((day) =>
          prisma.businessHours.create({
            data: {
              dayOfWeek: day,
              isOpen: day !== "sunday",
              openTime: "10:00",
              closeTime: "22:00",
            },
          })
        )
      );
    }

    const orderedHours = DAYS_OF_WEEK.map(
      (day) => hours.find((h) => h.dayOfWeek === day)!
    );

    return successResponse(orderedHours);
  } catch (error) {
    console.error("Get business hours error:", error);
    return serverErrorResponse();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return unauthorizedResponse("Solo administradores pueden actualizar los horarios");
    }

    const body = await request.json();
    const result = updateBusinessHoursSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error.issues[0].message);
    }

    const updatedHours = await Promise.all(
      result.data.map((hour) =>
        prisma.businessHours.upsert({
          where: { dayOfWeek: hour.dayOfWeek },
          update: {
            isOpen: hour.isOpen,
            openTime: hour.openTime,
            closeTime: hour.closeTime,
          },
          create: {
            dayOfWeek: hour.dayOfWeek,
            isOpen: hour.isOpen,
            openTime: hour.openTime,
            closeTime: hour.closeTime,
          },
        })
      )
    );

    const orderedHours = DAYS_OF_WEEK.map(
      (day) => updatedHours.find((h) => h.dayOfWeek === day)!
    ).filter(Boolean);

    return successResponse(orderedHours);
  } catch (error) {
    console.error("Update business hours error:", error);
    return serverErrorResponse();
  }
}
