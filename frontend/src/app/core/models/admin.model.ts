/** Admin Review & Action Models */

export type ActionType =
  | 'approve'
  | 'request_more_information'
  | 'hold_for_review'
  | 'escalate_authentication'
  | 'restrict_remove';

export interface AdminAction {
  listingId: string;
  actionType: ActionType;
  reason: string;
  reviewerId: string;
  reviewerName: string;
  timestamp: string; // ISO timestamp
}

export interface AuditRecord {
  id: string;
  listingId: string;
  actionType: ActionType;
  actionLabel: string;
  reason: string;
  reviewerName: string;
  timestamp: string;
}

/** Config per action type: label, button style, reason required */
export interface ActionConfig {
  type: ActionType;
  label: string;
  description: string;
  btnClass: string;
  requiresReason: boolean;
  confirmText: string;
}

export const ADMIN_ACTION_CONFIGS: ActionConfig[] = [
  {
    type: 'approve',
    label: 'Approve & Publish',
    description: 'Listing meets all requirements and can be published.',
    btnClass: 'btn-success',
    requiresReason: false,
    confirmText: 'Approve listing and mark as published?',
  },
  {
    type: 'request_more_information',
    label: 'Request More Information',
    description: 'Ask seller to provide additional evidence or details.',
    btnClass: 'btn-warning',
    requiresReason: true,
    confirmText: 'Send information request to seller?',
  },
  {
    type: 'hold_for_review',
    label: 'Hold for Review',
    description: 'Pause the listing pending further investigation.',
    btnClass: 'btn-secondary',
    requiresReason: true,
    confirmText: 'Place listing on hold?',
  },
  {
    type: 'escalate_authentication',
    label: 'Escalate Authentication',
    description: 'Send item for professional authentication review.',
    btnClass: 'btn-primary',
    requiresReason: true,
    confirmText: 'Escalate listing for authentication?',
  },
  {
    type: 'restrict_remove',
    label: 'Restrict / Remove',
    description: 'Remove listing due to policy violation or strong fraud evidence.',
    btnClass: 'btn-danger',
    requiresReason: true,
    confirmText: 'Remove listing and restrict seller actions?',
  },
];
