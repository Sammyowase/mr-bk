import db from "../../models/database";

export async function teardownTestDB() {
  await db.$disconnect();
}
