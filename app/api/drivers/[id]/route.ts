import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const GENDERS = ["Male", "Female", "Other"];

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
  const rawContact =
    typeof body.contact === "string" ? body.contact.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";
  const age =
    typeof body.age === "number"
      ? body.age
      : typeof body.age === "string" && body.age.trim() !== ""
        ? Number(body.age)
        : NaN;

  const contactDigits = rawContact.replace(/\D/g, "");
  const contact =
    contactDigits.length === 11
      ? `${contactDigits.slice(0, 4)}-${contactDigits.slice(4)}`
      : "";

  if (!name || !gender || !rawContact || !address) {
    return NextResponse.json(
      { error: "Name, gender, contact and address are required." },
      { status: 400 }
    );
  }
  if (!contact) {
    return NextResponse.json(
      { error: "Contact must be 11 digits, e.g. 0312-1234567." },
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

  try {
    const driver = await prisma.driver.update({
      where: { id: params.id },
      data: { name, gender, age, contact, address },
    });
    return NextResponse.json(driver);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Driver not found." }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to update driver." },
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
    await prisma.driver.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Driver not found." }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete driver." },
      { status: 500 }
    );
  }
}
