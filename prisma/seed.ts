import "dotenv/config";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const locations = [
    ["Shop Floor", "Talbot Street shop floor"],
    ["Archive Cabinet", "Locked archive cabinet"],
    ["Back Room", "Back-room stock"],
  ] as const;

  for (const [name, publicLabel] of locations) {
    await prisma.stockLocation.upsert({
      where: { name },
      create: { name, publicLabel },
      update: { publicLabel, active: true },
    });
  }

  console.log("Bookmart reference locations are ready. Owner users are created separately.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
