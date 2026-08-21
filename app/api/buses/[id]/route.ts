import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: { busNumber?: unknown; driverId?: unknown; routeId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const busNumber =
    typeof body.busNumber === "string" ? body.busNumber.trim() : "";
  const driverId =
    typeof body.driverId === "string" ? body.driverId.trim() : "";
  const routeId = typeof body.routeId === "string" ? body.routeId.trim() : "";

  if (!busNumber) {
    return NextResponse.json(
      { error: "Bus number is required." },
      { status: 400 }
    );
  }
  if (!driverId) {
    return NextResponse.json(
      { error: "Please select a driver for this bus." },
      { status: 400 }
    );
  }
  if (!routeId) {
    return NextResponse.json(
      { error: "Please select a route for this bus." },
      { status: 400 }
    );
  }

  const [driver, route] = await Promise.all([
    prisma.driver.findUnique({ where: { id: driverId } }),
    prisma.route.findUnique({ where: { id: routeId } }),
  ]);
  if (!driver) {
    return NextResponse.json(
      { error: "Selected driver does not exist." },
      { status: 400 }
    );
  }
  if (!route) {
    return NextResponse.json(
      { error: "Selected route does not exist." },
      { status: 400 }
    );
  }

  try {
    const bus = await prisma.bus.update({
      where: { id: params.id },
      data: { busNumber, driverId, routeId },
      include: { route: true, driver: true },
    });
    return NextResponse.json(bus);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: `Bus number "${busNumber}" is already registered.` },
          { status: 409 }
        );
      }
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Bus not found." }, { status: 404 });
      }
    }
    return NextResponse.json(
      { error: "Failed to update bus." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    await prisma.bus.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Bus not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete bus." }, { status: 500 });
  }
}
