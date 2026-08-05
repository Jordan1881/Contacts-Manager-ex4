import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import type {
  ContactCreateInput,
  ContactPatchInput,
  ContactPutInput,
} from "../validators/contactSchemas.js";

function parseBirthday(value: string | null | undefined): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return new Date(`${value}T00:00:00.000Z`);
}

function serializeContact(contact: {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  birthday: Date | null;
  notes: string | null;
  photoUrl: string | null;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...contact,
    birthday: contact.birthday
      ? contact.birthday.toISOString().slice(0, 10)
      : null,
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
  };
}

function isUniquePhoneError(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002"
  );
}

export async function listContacts(params: {
  q?: string;
  favorite?: "true" | "false";
  page: number;
  limit: number;
}) {
  const where: Prisma.ContactWhereInput = {};

  if (params.favorite === "true") {
    where.isFavorite = true;
  }

  if (params.q?.trim()) {
    const q = params.q.trim();
    where.OR = [
      { name: { contains: q } },
      { phone: { contains: q } },
      { email: { contains: q } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.contact.count({ where }),
    prisma.contact.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    }),
  ]);

  return {
    data: rows.map(serializeContact),
    total,
    page: params.page,
    limit: params.limit,
  };
}

export async function getById(id: string) {
  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact) throw new AppError(404, "Contact not found");
  return serializeContact(contact);
}

export async function create(input: ContactCreateInput) {
  try {
    const contact = await prisma.contact.create({
      data: {
        name: input.name,
        phone: input.phone,
        email: input.email ?? null,
        address: input.address ?? null,
        birthday: parseBirthday(input.birthday ?? null) as Date | null,
        notes: input.notes ?? null,
        photoUrl: input.photoUrl ?? null,
        isFavorite: input.isFavorite ?? false,
      },
    });
    return serializeContact(contact);
  } catch (err) {
    if (isUniquePhoneError(err)) {
      throw new AppError(409, "Phone number already exists");
    }
    throw err;
  }
}

/** PUT: omitted optionals cleared to null / isFavorite false */
export async function replace(id: string, input: ContactPutInput) {
  await getById(id);
  try {
    const contact = await prisma.contact.update({
      where: { id },
      data: {
        name: input.name,
        phone: input.phone,
        email: input.email ?? null,
        address: input.address ?? null,
        birthday: (parseBirthday(input.birthday ?? null) as Date | null) ?? null,
        notes: input.notes ?? null,
        photoUrl: input.photoUrl ?? null,
        isFavorite: input.isFavorite ?? false,
      },
    });
    return serializeContact(contact);
  } catch (err) {
    if (isUniquePhoneError(err)) {
      throw new AppError(409, "Phone number already exists");
    }
    throw err;
  }
}

export async function updatePartial(id: string, input: ContactPatchInput) {
  await getById(id);
  const data: Prisma.ContactUpdateInput = {};

  if (input.name !== undefined) data.name = input.name;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.email !== undefined) data.email = input.email;
  if (input.address !== undefined) data.address = input.address;
  if (input.birthday !== undefined) {
    data.birthday = parseBirthday(input.birthday) as Date | null;
  }
  if (input.notes !== undefined) data.notes = input.notes;
  if (input.photoUrl !== undefined) data.photoUrl = input.photoUrl;
  if (input.isFavorite !== undefined) data.isFavorite = input.isFavorite;

  try {
    const contact = await prisma.contact.update({ where: { id }, data });
    return serializeContact(contact);
  } catch (err) {
    if (isUniquePhoneError(err)) {
      throw new AppError(409, "Phone number already exists");
    }
    throw err;
  }
}

export async function toggleFavorite(id: string) {
  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Contact not found");
  const contact = await prisma.contact.update({
    where: { id },
    data: { isFavorite: !existing.isFavorite },
  });
  return serializeContact(contact);
}

export async function remove(id: string) {
  try {
    await prisma.contact.delete({ where: { id } });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      throw new AppError(404, "Contact not found");
    }
    throw err;
  }
}
