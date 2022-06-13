import { cert, initializeApp, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import { Guild } from "discord.js";

import serviceAccountKey from "../../serviceAccountKey.json";

// initialize Firebase
initializeApp({
  credential: cert(serviceAccountKey as ServiceAccount)
});
const db = getFirestore();

export async function registerUserIfNotExists(guildId: string, userId: string) {
  const userDoc = db.doc(`guilds/${guildId}/users/${userId}`);

  const neededToCreate = await db.runTransaction(async (transaction) => {
    const userDocData = await transaction.get(userDoc);
    if (userDocData.exists) {
      console.log(`already exists: user ${userId} in guild ${guildId}`);
      return false;
    }
    await transaction.create(userDoc, { points: 0 });
    console.log(`created: user ${userId} in guild ${guildId}`);
    return true;
  });

  return neededToCreate;
}

export async function registerGuildIfNotExists(guild: Guild) {
  console.log(`Attempting to register Guild ${guild.id} in database.`);

  const guildDoc = db.doc(`guilds/${guild.id}`);
  const neededToCreate = await db.runTransaction(async (transaction) => {
    const guildDocData = await transaction.get(guildDoc);
    if (guildDocData.exists) {
      console.log(`already exists: ${guild.id}`);
      return false;
    }
    transaction.create(guildDoc, {});
    console.log(`created: ${guild.id}`);
    return true;
  });

  if (neededToCreate) {
    (await guild.members.fetch()).map((member) =>
      registerUserIfNotExists(guild.id, member.id)
    );
  }
  return neededToCreate;
}

export async function getUserPoints(guildId: string, userId: string): Promise<number | undefined> {
  const user = await db.doc(`guilds/${guildId}/users/${userId}`).get();
  return user.data()?.points;
}

export async function getRankings(guildId: string) {
  const users = await db
    .collection(`guilds/${guildId}/users`)
    .orderBy("points", "desc")
    .get()
    .then((snapshot) => snapshot.docs.map((doc) => [doc.id, doc.data()]));

  return users;
}

// get the ranking of a user
export async function getUserRank(guildId: string, userId: string) {
  const users = await getRankings(guildId);

  return users.findIndex(([id]) => id === userId) + 1;
}

export async function incrementUserPoints(
  guildId: string,
  userId: string,
  points: number
) {
  console.log("ADDING:", points, "TO:", userId, "IN:", guildId);

  const recipient = db.doc(`guilds/${guildId}/users/${userId}`);

  const pointsIncremented = await db.runTransaction(async (transaction) => {
    const recipientData = await transaction.get(recipient);

    const oldPoints: number = recipientData.get("points");
    const newPoints = oldPoints + points < 0 ? 0 : oldPoints + points;

    transaction.update(recipient, { points: newPoints });
    return newPoints - oldPoints;
  });

  return pointsIncremented;
}

export async function givePoints(
  guildId: string,
  donorUserId: string,
  recipientUserId: string,
  points: number
) {
  const donor = db.doc(`guilds/${guildId}/users/${donorUserId}`);
  const recipient = db.doc(`guilds/${guildId}/users/${recipientUserId}`);

  const sentPoints = await db.runTransaction(async (transaction) => {
    const donorPointsOld: number = (await transaction.get(donor)).get("points");
    const recipientPointsOld: number = (await transaction.get(recipient)).get(
      "points"
    );

    const pointsGiven = points > donorPointsOld ? donorPointsOld : points;

    transaction.update(donor, {
      points: donorPointsOld - pointsGiven
    });
    transaction.update(recipient, {
      points: recipientPointsOld + pointsGiven
    });
    return pointsGiven;
  });

  return sentPoints;
}
