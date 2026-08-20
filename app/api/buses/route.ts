import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const buses = await prisma.bus.findMany({
    orderBy: { createdAt: "desc" },
    include: { route: true },
  });
  return NextResponse.json(buses);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: {
    busNumber?: unknown;
    driverName?: unknown;
    routeId?: unknown;
    newRoute?: { fromCity?: unknown; toCity?: unknown };
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const busNumber =
    typeof body.busNumber === "string" ? body.busNumber.trim() : "";
  const driverName =
    typeof body.driverName === "string" ? body.driverName.trim() : "";
  let routeId = typeof body.routeId === "string" ? body.routeId.trim() : "";

  if (!busNumber || !driverName) {
    return NextResponse.json(
      { error: "Bus number and driver name are required." },
      { status: 400 }
    );
  }

  // Allow creating a brand new route inline when no existing route is chosen.
  if (!routeId && body.newRoute) {
    const fromCity =
      typeof body.newRoute.fromCity === "string"
        ? body.newRoute.fromCity.trim()
        : "";
    const toCity =
      typeof body.newRoute.toCity === "string"
        ? body.newRoute.toCity.trim()
        : "";

    if (!fromCity || !toCity) {
      return NextResponse.json(
        { error: "A new route requires both 'from' and 'to' cities." },
        { status: 400 }
      );
    }
    if (fromCity.toLowerCase() === toCity.toLowerCase()) {
      return NextResponse.json(
        { error: "Origin and destination cities must be different." },
        { status: 400 }
      );
    }

    const route = await prisma.route.upsert({
      where: { fromCity_toCity: { fromCity, toCity } },
      update: {},
      create: { fromCity, toCity },
    });
    routeId = route.id;
  }

  if (!routeId) {
    return NextResponse.json(
      { error: "Please select or create a route for this bus." },
      { status: 400 }
    );
  }

  const route = await prisma.route.findUnique({ where: { id: routeId } });
  if (!route) {
    return NextResponse.json(
      { error: "Selected route does not exist." },
      { status: 400 }
    );
  }

  try {
    const bus = await prisma.bus.create({
      data: { busNumber, driverName, routeId },
      include: { route: true },
    });
    return NextResponse.json(bus, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: `Bus number "${busNumber}" is already registered.` },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create bus." },
      { status: 500 }
    );
  }
}
