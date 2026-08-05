import "dotenv/config";

import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

function option(name: string) {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

async function main() {
  const name = option("name")?.trim();
  const email = option("email")?.trim().toLowerCase();
  const password = option("password");

  if (!name || !email || !password) {
    throw new Error(
      "Usage: npm run owner:setup -- --name=Owner --email=owner@example.com --password='a strong private password'",
    );
  }
  if (password.length < 4)
    throw new Error("The temporary shop code must contain at least four characters.");

  const user = await prisma.user.upsert({
    where: { email },
    create: { name, email, role: "ADMIN", passwordHash: hashPassword(password) },
    update: { name, role: "ADMIN", passwordHash: hashPassword(password) },
    select: { id: true, name: true, email: true, role: true },
  });

  await prisma.session.deleteMany({ where: { userId: user.id } });
  console.log(`Owner account ready: ${user.name} (${user.email}, ${user.role}).`);
  if (/^(.)\1{3,}$/.test(password) || /^(?:0123|1234|4321)$/.test(password)) {
    console.warn(
      "WARNING: This shop code is suitable only for local acceptance testing. Change it before deployment.",
    );
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
