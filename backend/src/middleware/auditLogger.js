const prisma = require("../../prismaClient");

async function logAudit({ userId, resourceType, resourceId, action, metadata = {} }) {
  await prisma.auditLog.create({
    data: { userId, resourceType, resourceId, action, metadata }
  });
}

module.exports = logAudit;
