import { cert, initializeApp, ServiceAccount } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

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
      console.log(`ALREADY EXISTS: User ${userId} in Guild ${guildId}`);
      return false;
    }

    transaction.create(userDoc, { points: 0 });

    console.log(`REGISTERED: User ${userId} in Guild ${guildId}`);
    return true;
  });

  return neededToCreate;
}

export async function registerGuildIfNotExists(guildId: string) {
  console.log(`Attempting to register Guild ${guildId} in database.`);

  const guildDoc = db.doc(`guilds/${guildId}`);
  return db.runTransaction(async (transaction) => {
    const guildDocData = await transaction.get(guildDoc);
    if (guildDocData.exists) {
      console.log(`ALREADY EXISTS: Guild ${guildId}`);
      return false;
    }
    transaction.create(guildDoc, { permissionRoleName: "Instructor" });
    console.log(`REGISTERED: Guild ${guildId}`);
    return true;
  });
}

export async function getLogChannel(
  guildId: string
): Promise<string | undefined> {
  const guild = await db.doc(`guilds/${guildId}/`).get();
  return guild.data()?.logChannelId;
}

export async function setLogChannel(
  guildId: string,
  logChannelId: string
): Promise<void> {
  await db.doc(`guilds/${guildId}/`).set({ logChannelId }, { merge: true });
}

export async function clearLogChannel(guildId: string): Promise<void> {
  await db
    .doc(`guilds/${guildId}/`)
    .update({ logChannelId: FieldValue.delete() });
}

export async function getPermissionRoleName(
  guildId: string
): Promise<string | undefined> {
  const guild = await db.doc(`guilds/${guildId}`).get();
  return guild.data()?.permissionRoleName;
}

export async function setPermissionRoleName(
  guildId: string,
  permissionRoleName: string
): Promise<void> {
  await db.doc(`guilds/${guildId}/`).set({ permissionRoleName });
}

export async function getUserPoints(
  guildId: string,
  userId: string
): Promise<number | undefined> {
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
export async function getUserRank(
  guildId: string,
  userId: string
): Promise<number | null> {
  const users = await getRankings(guildId);

  const index = users.findIndex(([id]) => id === userId);

  return index === -1 ? null : index + 1;
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
