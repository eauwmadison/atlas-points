import { cert, initializeApp, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import { Guild } from "discord.js";

import serviceAccountKey from "../../serviceAccountKey.json";

// initialize Firebase
initializeApp({
  credential: cert(serviceAccountKey as ServiceAccount)
});
const db = getFirestore();

export async function registerGuildIfNotExists(guild: Guild) {
  console.log(`Attempting to register Guild ${guild.id} in database.`);

  // const users = await guild.members
  //   .fetch()
  //   .then((members) => members.map((member) => member.user.id));

  // console.log(users);

  try {
    await db.collection("guilds").doc(guild.id).create({ users: {} });
    console.log(`Registered Guild ${guild.id} in database.`);
  } catch (e) {
    console.log(e);
  }
}

export async function registerUserIfNotExists(guildId: string, userId: string) {
  try {
    await db.collection(`guilds/${guildId}/users`).doc(userId).create({
      points: 0
    });
  } catch (e) {
    console.log(e);
  }
}
