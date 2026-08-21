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

  let body: { fromCity?: unknown; toCity?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const fromCity = typeof body.fromCity === "string" ? body.fromCity.trim() : "";
  const toCity = typeof body.toCity === "string" ? body.toCity.trim() : "";

  if (!fromCity || !toCity) {
    return NextResponse.json(
      { error: "Both 'from' and 'to' cities are required." },
      { status: 400 }
    );
  }
  if (fromCity.toLowerCase() === toCity.toLowerCase()) {
    return NextResponse.json(
      { error: "Origin and destination cities must be different." },
      { status: 400 }
    );
  }

  try {
    const route = await prisma.route.update({
      where: { id: params.id },
      data: { fromCity, toCity },
    });
    return NextResponse.json(route);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: `Route "${fromCity} -> ${toCity}" already exists.` },
          { status: 409 }
        );
      }
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Route not found." },
          { status: 404 }
        );
      }
    }
    return NextResponse.json(
      { error: "Failed to update route." },
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
    await prisma.route.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Route not found." }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete route." },
      { status: 500 }
    );
  }
}
