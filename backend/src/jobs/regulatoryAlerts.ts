import prisma from "../../prismaClient";
import sendEmail from "../config/email";
import sendSMS from "../config/sms";
import logAudit from "../middleware/auditLogger";

// This job runs daily to check for regulatory updates.
export default async function regulatoryAlerts() {
  // Assume we have a table PendingRegChange with fields { state, description, effectiveDate }
  const today = new Date();
  const changes = await prisma.pendingRegChange.findMany({
    where: { effectiveDate: today }
  });

  for (const change of changes) {
    const users = await prisma.trust.findMany({
      where: { state: change.state },
      distinct: ["userId"],
      select: { userId: true }
    });

    for (const { userId } of users) {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type: "RegulatoryUpdate",
          content: { message: \`\${change.state} law update: \${change.description}\` }
        }
      });

      // Send email if preference enabled
      const pref = await prisma.notificationPreference.findUnique({
        where: { userId_type: { userId, type: "RegulatoryUpdate" } }
      });
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (pref?.enabled && user?.email) {
        await sendEmail({
          to: user.email,
          subject: "Regulatory Update",
          html: \`<p>\${change.state} law update: \${change.description}</p>\`
        });
      }

      await logAudit({
        userId,
        resourceType: "Notification",
        resourceId: notification.id,
        action: "created",
        metadata: { changeId: change.id }
      });
    }
  }
}
