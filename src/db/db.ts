import { cert, initializeApp, ServiceAccount } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

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
    for (const [_, guildMember] of await guild.members.fetch()) {
      if (!guildMember.user.bot) {
        registerUserIfNotExists(guild.id, guildMember.user.id);
      }
    }
  }
  return neededToCreate;
}

export async function getUserPoints(guildId: string, userId: string) {
  const user = await db.collection(`guilds/${guildId}/users`).doc(userId).get();

  return user.data()!.points;
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
  const recipient = db.doc(`guilds/${guildId}/users/${userId}`);

  const pointsIncremented = await db.runTransaction(async (transaction) => {
    const recipient_data = await transaction.get(recipient);

    const old_points: number = recipient_data.get('points')
    const new_points = old_points + points < 0 ? 0 : old_points + points;

    transaction.update(recipient, { points: new_points });
    return new_points - old_points;
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
    const donor_points_old: number = (await transaction.get(donor)).get('points');
    const recipient_points_old: number = (await transaction.get(recipient)).get('points');

    const points_given = points > donor_points_old ? donor_points_old : points;

    transaction.update(donor, {
      points: donor_points_old - points_given
    });
    transaction.update(recipient, {
      points: recipient_points_old + points_given
    });
    return points_given;
  });

  return sentPoints;
}
