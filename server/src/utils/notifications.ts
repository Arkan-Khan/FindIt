import admin from '../config/firebase';
import { PrismaClient } from '@prisma/client';
import { BatchResponse } from 'firebase-admin/messaging';

const prisma = new PrismaClient();

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export const sendNotificationToGroup = async (
  groupId: string, 
  payload: NotificationPayload,
  excludeUserId?: string
) => {
  try {
    // Get all users in the group
    const members = await prisma.groupMember.findMany({
      where: {
        groupId,
        // Exclude the user who created the post if provided
        ...(excludeUserId && { userId: { not: excludeUserId } })
      },
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

    // Make sure data fields are strings as required by FCM
    const formattedData: Record<string, string> = {};
    if (payload.data) {
      Object.entries(payload.data).forEach(([key, value]) => {
        formattedData[key] = String(value);
      });
    }

    // Send notification to all tokens
    const message = {
      notification: {
        title: payload.title,
        body: payload.body
      },
      data: formattedData,
      tokens: tokens
    };

    // Use sendEachForMulticast instead of sendMulticast
    const response = await admin.messaging().sendEachForMulticast(message) as BatchResponse;
    console.log(`Successfully sent ${response.successCount}/${tokens.length} notifications`);
    
    // If there are failures, log them for debugging
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`Failed to send notification to token ${tokens[idx]}: ${resp.error}`);
          
          // If token is invalid or not registered, remove it from database
          if (resp.error?.code === 'messaging/invalid-registration-token' ||
              resp.error?.code === 'messaging/registration-token-not-registered') {
            prisma.fcmToken.deleteMany({
              where: { token: tokens[idx] }
            }).catch(err => console.error('Error deleting invalid token:', err));
          }
        }
      });
    }
    
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};