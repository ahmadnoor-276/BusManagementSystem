import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const GENDERS = ["Male", "Female", "Other"];

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const drivers = await prisma.driver.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { buses: true } } },
  });
  return NextResponse.json(drivers);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: {
    name?: unknown;
    gender?: unknown;
    age?: unknown;
    contact?: unknown;
    address?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const gender = typeof body.gender === "string" ? body.gender.trim() : "";
  const contact = typeof body.contact === "string" ? body.contact.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";
  const age =
    typeof body.age === "number"
      ? body.age
      : typeof body.age === "string" && body.age.trim() !== ""
        ? Number(body.age)
        : NaN;

  if (!name || !gender || !contact || !address) {
    return NextResponse.json(
      { error: "Name, gender, contact and address are required." },
      { status: 400 }
    );
  }
  if (!GENDERS.includes(gender)) {
    return NextResponse.json(
      { error: "Gender must be Male, Female or Other." },
      { status: 400 }
    );
  }
  if (!Number.isInteger(age) || age < 18 || age > 100) {
    return NextResponse.json(
      { error: "Age must be a whole number between 18 and 100." },
      { status: 400 }
    );
  }

  const driver = await prisma.driver.create({
    data: { name, gender, age, contact, address },
  });
  return NextResponse.json(driver, { status: 201 });
}
