// lib/utils/notifications.ts
import { sendNotification } from "@/actions/notifications";
import { NotificationType } from "@/lib/generated/prisma/enums";

/**
 * Helper functions to send notifications for common events
 */

export const NotificationHelpers = {
  // Rent & Payment Notifications
  async rentDue(userId: string, amount: number, dueDate: string, leaseId: string) {
    return sendNotification({
      userId,
      type: "RENT_DUE" as NotificationType,
      title: "Rent Payment Due",
      message: `Your rent payment of $${amount.toLocaleString()} is due on ${dueDate}`,
      actionUrl: `/dashboard/payments`,
      sendEmail: true,
      metadata: { amount, dueDate, leaseId },
    });
  },

  async rentOverdue(userId: string, amount: number, daysLate: number, leaseId: string) {
    return sendNotification({
      userId,
      type: "RENT_OVERDUE" as NotificationType,
      title: "Overdue Rent Payment",
      message: `Your rent payment of $${amount.toLocaleString()} is ${daysLate} day${daysLate > 1 ? 's' : ''} overdue`,
      actionUrl: `/dashboard/payments`,
      sendEmail: true,
      sendSMS: true,
      metadata: { amount, daysLate, leaseId },
    });
  },

  async paymentReceived(userId: string, amount: number, paymentId: string) {
    return sendNotification({
      userId,
      type: "PAYMENT_RECEIVED" as NotificationType,
      title: "Payment Received",
      message: `We've received your payment of $${amount.toLocaleString()}. Thank you!`,
      actionUrl: `/dashboard/payments/${paymentId}`,
      sendEmail: true,
      metadata: { amount, paymentId },
    });
  },

  async paymentFailed(userId: string, amount: number, reason: string) {
    return sendNotification({
      userId,
      type: "PAYMENT_FAILED" as NotificationType,
      title: "Payment Failed",
      message: `Your payment of $${amount.toLocaleString()} failed: ${reason}`,
      actionUrl: `/dashboard/payments`,
      sendEmail: true,
      sendSMS: true,
      metadata: { amount, reason },
    });
  },

  // Lease Notifications
  async leaseCreated(userId: string, unitNumber: string, leaseId: string) {
    return sendNotification({
      userId,
      type: "LEASE_CREATED" as NotificationType,
      title: "New Lease Created",
      message: `A new lease has been created for Unit ${unitNumber}`,
      actionUrl: `/dashboard/leases/${leaseId}`,
      sendEmail: true,
      metadata: { unitNumber, leaseId },
    });
  },

  async leaseSigned(userId: string, unitNumber: string, leaseId: string) {
    return sendNotification({
      userId,
      type: "LEASE_SIGNED" as NotificationType,
      title: "Lease Signed",
      message: `The lease for Unit ${unitNumber} has been signed`,
      actionUrl: `/dashboard/leases/${leaseId}`,
      sendEmail: true,
      metadata: { unitNumber, leaseId },
    });
  },

  async leaseExpiring(userId: string, unitNumber: string, expiryDate: string, leaseId: string) {
    return sendNotification({
      userId,
      type: "LEASE_EXPIRING" as NotificationType,
      title: "Lease Expiring Soon",
      message: `Your lease for Unit ${unitNumber} expires on ${expiryDate}`,
      actionUrl: `/dashboard/leases/${leaseId}`,
      sendEmail: true,
      metadata: { unitNumber, expiryDate, leaseId },
    });
  },

  async leaseRenewalOffer(userId: string, unitNumber: string, offerId: string) {
    return sendNotification({
      userId,
      type: "LEASE_RENEWAL_OFFER" as NotificationType,
      title: "Lease Renewal Offer",
      message: `You have a new lease renewal offer for Unit ${unitNumber}`,
      actionUrl: `/dashboard/leases`,
      sendEmail: true,
      metadata: { unitNumber, offerId },
    });
  },

  // Maintenance Notifications
  async maintenanceRequest(userId: string, title: string, ticketId: string) {
    return sendNotification({
      userId,
      type: "MAINTENANCE_REQUEST" as NotificationType,
      title: "New Maintenance Request",
      message: `New maintenance request: ${title}`,
      actionUrl: `/dashboard/maintenance/${ticketId}`,
      sendEmail: true,
      metadata: { title, ticketId },
    });
  },

  async maintenanceScheduled(userId: string, title: string, scheduledDate: string, ticketId: string) {
    return sendNotification({
      userId,
      type: "MAINTENANCE_SCHEDULED" as NotificationType,
      title: "Maintenance Scheduled",
      message: `Maintenance "${title}" scheduled for ${scheduledDate}`,
      actionUrl: `/dashboard/maintenance/${ticketId}`,
      sendEmail: true,
      sendSMS: true,
      metadata: { title, scheduledDate, ticketId },
    });
  },

  async maintenanceCompleted(userId: string, title: string, ticketId: string) {
    return sendNotification({
      userId,
      type: "MAINTENANCE_COMPLETED" as NotificationType,
      title: "Maintenance Completed",
      message: `Maintenance work "${title}" has been completed`,
      actionUrl: `/dashboard/maintenance/${ticketId}`,
      sendEmail: true,
      metadata: { title, ticketId },
    });
  },

  // Application Notifications
  async applicationReceived(userId: string, applicantName: string, unitNumber: string, applicationId: string) {
    return sendNotification({
      userId,
      type: "APPLICATION_RECEIVED" as NotificationType,
      title: "New Rental Application",
      message: `New application from ${applicantName} for Unit ${unitNumber}`,
      actionUrl: `/dashboard/applications/${applicationId}`,
      sendEmail: true,
      metadata: { applicantName, unitNumber, applicationId },
    });
  },

  async applicationApproved(userId: string, unitNumber: string, applicationId: string) {
    return sendNotification({
      userId,
      type: "APPLICATION_APPROVED" as NotificationType,
      title: "Application Approved",
      message: `Your application for Unit ${unitNumber} has been approved!`,
      actionUrl: `/dashboard/applications/${applicationId}`,
      sendEmail: true,
      metadata: { unitNumber, applicationId },
    });
  },

  async applicationDenied(userId: string, unitNumber: string, applicationId: string) {
    return sendNotification({
      userId,
      type: "APPLICATION_DENIED" as NotificationType,
      title: "Application Status Update",
      message: `Your application for Unit ${unitNumber} status has been updated`,
      actionUrl: `/dashboard/applications/${applicationId}`,
      sendEmail: true,
      metadata: { unitNumber, applicationId },
    });
  },

  // Document Notifications
  async documentUploaded(userId: string, documentName: string, documentId: string) {
    return sendNotification({
      userId,
      type: "DOCUMENT_UPLOADED" as NotificationType,
      title: "New Document Uploaded",
      message: `A new document "${documentName}" has been uploaded`,
      actionUrl: `/dashboard/documents`,
      sendEmail: false,
      metadata: { documentName, documentId },
    });
  },

  // Inspection Notifications
  async inspectionScheduled(userId: string, propertyName: string, scheduledDate: string, inspectionId: string) {
    return sendNotification({
      userId,
      type: "INSPECTION_SCHEDULED" as NotificationType,
      title: "Inspection Scheduled",
      message: `Property inspection for ${propertyName} scheduled on ${scheduledDate}`,
      actionUrl: `/dashboard/properties`,
      sendEmail: true,
      sendSMS: true,
      metadata: { propertyName, scheduledDate, inspectionId },
    });
  },

  // Message Notifications
  async newMessage(userId: string, senderName: string, conversationId: string) {
    return sendNotification({
      userId,
      type: "MESSAGE" as NotificationType,
      title: "New Message",
      message: `You have a new message from ${senderName}`,
      actionUrl: `/dashboard/messages/${conversationId}`,
      sendEmail: false,
      metadata: { senderName, conversationId },
    });
  },

  // System Notifications
  async systemNotification(userId: string, title: string, message: string, actionUrl?: string) {
    return sendNotification({
      userId,
      type: "SYSTEM" as NotificationType,
      title,
      message,
      actionUrl,
      sendEmail: false,
      metadata: {},
    });
  },
};