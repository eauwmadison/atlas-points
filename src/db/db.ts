import { getFirestore } from "firebase-admin/firestore";

const db = getFirestore();

export async function registerGuildIfNotExists(guildId: string) {
  console.log(`Attempting to register guild ${guildId} in database.`);
  try {
    await db
      .collection("guilds")
      .doc(guildId)
      .create({ users: {} },);
  } catch (e) {
    console.log(e);
  }
}


export async function registerUserIfNotExists(guildId: string, userId: string) {
  try {
    await db
      .collection(`guilds/${guildId}/users`)
      .doc(userId)
      .create({
        points: 0
      });
  } catch (e) {
    console.log(e);
  }
}


