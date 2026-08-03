import { IntakeWorkflow } from "@/components/intake-workflow";
import { aiConfigurationMessage } from "@/lib/intake/config";
import { db } from "@/lib/db";

export const metadata = { title: "Staff Intake" };

export default async function StaffIntakePage() {
  const locations = await db.stockLocation.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, publicLabel: true } });
  return <IntakeWorkflow locations={locations} aiMessage={aiConfigurationMessage()} />;
}
