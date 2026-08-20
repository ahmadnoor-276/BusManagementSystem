import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const routes = await prisma.route.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { buses: true } } },
  });
  return NextResponse.json(routes);
}

export async function POST(request: Request) {
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
    const route = await prisma.route.create({ data: { fromCity, toCity } });
    return NextResponse.json(route, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: `Route "${fromCity} -> ${toCity}" already exists.` },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create route." },
      { status: 500 }
    );
  }
}
