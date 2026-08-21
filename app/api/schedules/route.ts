import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const routeId = searchParams.get("routeId");

  const schedules = await prisma.schedule.findMany({
    where: routeId ? { bus: { routeId } } : undefined,
    orderBy: { departureTime: "asc" },
    include: { bus: { include: { route: true, driver: true } } },
  });
  return NextResponse.json(schedules);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: { busId?: unknown; departureTime?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const busId = typeof body.busId === "string" ? body.busId.trim() : "";
  const departureTime =
    typeof body.departureTime === "string" ? body.departureTime.trim() : "";

  if (!busId) {
    return NextResponse.json({ error: "Please select a bus." }, { status: 400 });
  }
  if (!TIME_RE.test(departureTime)) {
    return NextResponse.json(
      { error: "A valid departure time (HH:MM) is required." },
      { status: 400 }
    );
  }

  const bus = await prisma.bus.findUnique({ where: { id: busId } });
  if (!bus) {
    return NextResponse.json(
      { error: "Selected bus does not exist." },
      { status: 400 }
    );
  }

  try {
    const schedule = await prisma.schedule.create({
      data: { busId, departureTime },
      include: { bus: { include: { route: true, driver: true } } },
    });
    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "This bus already has a departure at that time." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create schedule." },
      { status: 500 }
    );
  }
}
