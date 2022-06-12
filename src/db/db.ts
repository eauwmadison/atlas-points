import { cert, initializeApp, ServiceAccount } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

import { Guild } from "discord.js";

import serviceAccountKey from "../../serviceAccountKey.json";
import { transcode } from "buffer";

// initialize Firebase
initializeApp({
  credential: cert(serviceAccountKey as ServiceAccount)
});
const db = getFirestore();

export async function registerGuildIfNotExists(guild: Guild) {
  console.log(`Attempting to register Guild ${guild.id} in database.`);

  const guild_doc = db.doc(`guilds/${guild.id}`);
  // fetching users currently times out
  const neededToCreate = await db.runTransaction(async (transaction) => {
    const guild_doc_data = await transaction.get(guild_doc);
    if (guild_doc_data.exists) {
      console.log(`already exists: ${guild.id}`);
      return true;
    } else {
      transaction.create(guild_doc, {});
      console.log(`created: ${guild.id}`);
      return false;
    }
  });

  if (neededToCreate) {
    // enumerate members
    const users = await guild.members.list({ cache: false });
    // give 0 points
    for (const [a, b] of users) {
      guild_doc.collection("users").add({
        points: 0
      });
    }
  }
  return neededToCreate;
}

export async function registerUserIfNotExists(guildId: string, userId: string) {
  const user_doc = db.doc(`guilds/${guildId}/users/${userId}`);

  const neededToCreate = await db.runTransaction(async (transaction) => {
    const user_doc_data = await transaction.get(user_doc);
    if (user_doc_data.exists) {
      console.log(`already exists: user ${userId} in guild ${guildId}`);
      return false;
    } else {
      await transaction.create(user_doc, { points: 0 });
      console.log(`created: user ${userId} in guild ${guildId}`);
      return true;
    }
  });

  return neededToCreate;
}

export async function getUserPoints(guildId: string, userId: string) {
  const user = await db.collection(`guilds/${guildId}/users`).doc(userId).get();

  return user.data()!.points;
}

export async function addUserPoints(
  guildId: string,
  userId: string,
  points: number
) {
  await db
    .collection(`guilds/${guildId}/users`)
    .doc(userId)
    .update({
      points: FieldValue.increment(points)
    });
}
