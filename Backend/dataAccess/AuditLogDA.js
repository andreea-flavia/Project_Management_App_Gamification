import AuditLog from "../entities/AuditLog.js";
import Users from "../entities/Users.js";

async function logAction(userId, action, entityType, entity_id = null, details = null) {
    try{
        await AuditLog.create({
            user_id: userId,
            action: action,
            entity_type: entityType,
            entity_id: entity_id,
            details: typeof details === 'object' ? JSON.stringify(details) : details
        });
    } catch (error){
        console.error('AUDIT LOG: Error logging action:', error);
    }
}

async function getAuditLogs() {
    return await AuditLog.findAll(
        {
            include: [{model: Users,  attributes: ['username']}],
            order: [['createdAt', 'DESC']]
        }
    );
}

async function getAuditLogsByentityId(entity_id) {
    return await AuditLog.findAll({ 
        where: { entity_id } ,
        include: [{model: Users,  attributes: ['username']}],
        order: [['createdAt', 'DESC']]
    });
}


export { logAction, getAuditLogs, getAuditLogsByentityId };

