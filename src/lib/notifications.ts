import { createSupabaseServiceClient } from './supabase';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface CreateNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  targetUserId?: string; // If null, goes to all superadmins
  actionUrl?: string;
}

export async function createNotification({
  type,
  title,
  message,
  targetUserId,
  actionUrl
}: CreateNotificationParams) {
  const supabase = createSupabaseServiceClient();

  try {
    // If no target user specified, send to all superadmins
    if (!targetUserId) {
      const { data: superadmins } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'superadmin');

      if (superadmins && superadmins.length > 0) {
        const notifications = superadmins.map(admin => ({
          type,
          title,
          message,
          target_user_id: admin.id,
          action_url: actionUrl,
          read: false
        }));

        await supabase.from('notifications').insert(notifications);
      }
    } else {
      // Send to specific user
      await supabase.from('notifications').insert({
        type,
        title,
        message,
        target_user_id: targetUserId,
        action_url: actionUrl,
        read: false
      });
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

// Specific notification functions
export async function notifyNewApplication(applicationId: string, applicantName: string) {
  await createNotification({
    type: 'info',
    title: 'Yeni Müraciət',
    message: `${applicantName} tərəfindən yeni müraciət göndərildi`,
    actionUrl: `/admin/dashboard/applications`
  });
}

export async function notifyStatusChange(applicationId: string, applicantName: string, oldStatus: string, newStatus: string, agentId?: string) {
  const statusText = {
    'pending': 'Gözləmədə',
    'assigned': 'Gözləmədə',
    'in_progress': 'Təsdiqlənib', 
    'closed': 'İmtina olunub'
  };

  const message = `${applicantName} müraciətinin statusu "${statusText[oldStatus as keyof typeof statusText]}"-dən "${statusText[newStatus as keyof typeof statusText]}"-ə dəyişdirildi`;

  // Agent-ə notification göndər (əgər agentId varsa)
  if (agentId) {
    await createNotification({
      type: 'success',
      title: 'Status Dəyişikliyi',
      message: message,
      targetUserId: agentId,
      actionUrl: `/admin/dashboard/applications`
    });
  }

  // Superadmin-lərə də notification göndər
  await createNotification({
    type: 'info',
    title: 'Agent Status Dəyişikliyi',
    message: `Agent tərəfindən: ${message}`,
    actionUrl: `/admin/dashboard/applications`
  });
}

export async function notifyAgentAssignment(applicationId: string, applicantName: string, agentName: string, agentId: string) {
  await createNotification({
    type: 'info',
    title: 'Müraciət Təyinatı',
    message: `${applicantName} müraciəti ${agentName} agentinə təyin edildi`,
    targetUserId: agentId,
    actionUrl: `/admin/dashboard/applications`
  });
}

export async function notifyAgentInvite(agentEmail: string, agentName: string) {
  await createNotification({
    type: 'success',
    title: 'Agent Dəvəti',
    message: `${agentName} (${agentEmail}) agent kimi dəvət edildi`,
    actionUrl: `/admin/dashboard/agents`
  });
}

export async function notifySystemError(error: string, context: string) {
  await createNotification({
    type: 'error',
    title: 'Sistem Xətası',
    message: `${context}: ${error}`,
    actionUrl: `/admin/dashboard`
  });
}

export async function notifyCalculatorUsage(userId: string, premium: number) {
  await createNotification({
    type: 'info',
    title: 'Kalkulyator İstifadəsi',
    message: `Kalkulyator istifadə edildi. Hesablanmış məbləğ: ${premium} AZN`,
    targetUserId: userId,
    actionUrl: `/admin/dashboard`
  });
}
