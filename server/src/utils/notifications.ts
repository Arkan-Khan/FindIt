import admin from '../config/firebase';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export const sendNotificationToGroup = async (
  groupId: string, 
  payload: NotificationPayload
) => {
  try {
    // Get all users in the group
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    // Get FCM tokens for all members
    const tokenPromises = members.map(async (member) => {
      const fcmToken = await prisma.fcmToken.findFirst({
        where: { userId: member.userId }
      });
      return fcmToken?.token;
    });
    
    const tokens = (await Promise.all(tokenPromises)).filter(token => !!token) as string[];
    
    if (tokens.length === 0) {
      console.log('No valid FCM tokens found for group members');
      return;
    }

    // Send notification to all tokens
    const message = {
      notification: {
        title: payload.title,
        body: payload.body
      },
      data: payload.data || {},
      tokens: tokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`Successfully sent ${response.successCount} notifications`);
    
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};