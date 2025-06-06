import prisma from "../../prismaClient";
import sendEmail from "../config/email";
import admin from "firebase-admin";
import logAudit from "../middleware/auditLogger";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FCM_SERVICE_ACCOUNT!))
  });
}

export default async function checkInScheduler() {
  const now = new Date();
  const dueCheckIns = await prisma.userCheckIn.findMany({
    where: { nextDate: { lte: now } }
  });

  for (const checkIn of dueCheckIns) {
    const userId = checkIn.userId;
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: "CheckInReminder",
        content: { message: "Time to review your estate plan." }
      }
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    // Send email if enabled
    const pref = await prisma.notificationPreference.findUnique({
      where: { userId_type: { userId, type: "CheckInReminder" } }
    });
    if (pref?.enabled && user?.email) {
      await sendEmail({
        to: user.email,
        subject: "Legacy Pro Check-In Reminder",
        html: "<p>Time to review your estate plan.</p>"
      });
    }

    // Send push notification
    const tokens = await prisma.pushToken.findMany({ where: { userId } });
    if (tokens.length > 0) {
      const payload = { notification: { title: "Check-In Reminder", body: "Time to review your estate plan." } };
      await admin.messaging().sendToDevice(tokens.map((t) => t.token), payload);
    }

    // Update nextDate
    let newNextDate = new Date(checkIn.nextDate);
    switch (checkIn.frequency) {
      case "DAILY":
        newNextDate.setDate(newNextDate.getDate() + 1);
        break;
      case "WEEKLY":
        newNextDate.setDate(newNextDate.getDate() + 7);
        break;
      case "MONTHLY":
        newNextDate.setMonth(newNextDate.getMonth() + 1);
        break;
    }

    await prisma.userCheckIn.update({
      where: { id: checkIn.id },
      data: { lastSent: now, nextDate: newNextDate }
    });

    await logAudit({
      userId,
      resourceType: "UserCheckIn",
      resourceId: checkIn.id,
      action: "reminder_sent",
      metadata: {}
    });
  }
}
