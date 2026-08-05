import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.contact.count();
  if (count > 0) {
    console.log(`Seed skipped: ${count} contacts already exist`);
    return;
  }

  await prisma.contact.createMany({
    data: [
      {
        name: "Ada Lovelace",
        phone: "+1-555-0100",
        email: "ada@example.com",
        address: "London",
        birthday: new Date("1815-12-10"),
        notes: "First programmer",
        isFavorite: true,
        photoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Ada_Lovelace_portrait.jpg",
      },
      {
        name: "Alan Turing",
        phone: "+1-555-0101",
        email: "alan@example.com",
        notes: "Computing pioneer",
        isFavorite: false,
      },
      {
        name: "Grace Hopper",
        phone: "+1-555-0102",
        email: "grace@example.com",
        notes: "COBOL",
        isFavorite: true,
      },
    ],
  });

  console.log("Seeded 3 demo contacts");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
