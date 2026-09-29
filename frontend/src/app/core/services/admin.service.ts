import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { AdminAction, AuditRecord, ActionType, ADMIN_ACTION_CONFIGS } from '../models/admin.model';

interface BackendDecisionResponse {
  listingId: string;
  previousStatus: string;
  newStatus: string;
  action: string;
  reason: string;
  auditLogId: string;
  timestamp: string;
}

interface BackendAuditLog {
  id: string;
  listingId: string;
  reviewerId?: string;
  action: string;
  reason: string;
  previousStatus: string;
  newStatus: string;
  riskScoreSnapshot?: number;
  metadata?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = '/api/v1';
  private auditLog: AuditRecord[] = [];
  private recordCounter = 1;

  constructor(private http: HttpClient) {}

  private mapActionToBackend(type: ActionType): string {
    switch (type) {
      case 'approve': return 'APPROVE';
      case 'request_more_information': return 'REQUEST_INFORMATION';
      case 'hold_for_review': return 'HOLD';
      case 'escalate_authentication': return 'ESCALATE_AUTHENTICATION';
      case 'restrict_remove': return 'RESTRICT';
      default: return 'HOLD';
    }
  }

  private mapBackendToAction(actionStr: string): ActionType {
    switch (actionStr) {
      case 'APPROVE': return 'approve';
      case 'REQUEST_INFORMATION': return 'request_more_information';
      case 'HOLD': return 'hold_for_review';
      case 'ESCALATE_AUTHENTICATION': return 'escalate_authentication';
      case 'RESTRICT': return 'restrict_remove';
      default: return 'hold_for_review';
    }
  }

  /** Submit an admin action and append to the audit log */
  submitAction(action: AdminAction): Observable<AuditRecord> {
    const backendAction = this.mapActionToBackend(action.actionType);
    const body = {
      action: backendAction,
      reason: action.reason,
    };

    return this.http.post<BackendDecisionResponse>(`${this.apiUrl}/admin/reviews/${action.listingId}/decision`, body).pipe(
      map(res => {
        const config = ADMIN_ACTION_CONFIGS.find(c => c.type === action.actionType);
        const record: AuditRecord = {
          id: res.auditLogId,
          listingId: res.listingId,
          actionType: action.actionType,
          actionLabel: config?.label ?? action.actionType,
          reason: res.reason,
          reviewerName: action.reviewerName,
          timestamp: res.timestamp,
        };
        this.auditLog.unshift(record);
        return record;
      }),
      catchError(err => {
        console.warn('Backend decision endpoint failed or unavailable, falling back to client-side record:', err);
        const config = ADMIN_ACTION_CONFIGS.find(c => c.type === action.actionType);
        const record: AuditRecord = {
          id: `audit-${String(this.recordCounter++).padStart(4, '0')}`,
          listingId: action.listingId,
          actionType: action.actionType,
          actionLabel: config?.label ?? action.actionType,
          reason: action.reason,
          reviewerName: action.reviewerName,
          timestamp: new Date().toISOString(),
        };
        this.auditLog.unshift(record);
        return of(record);
      })
    );
  }

  /** Retrieve audit log for a listing */
  getAuditLog(listingId: string): Observable<AuditRecord[]> {
    return this.http.get<BackendAuditLog[]>(`${this.apiUrl}/listings/${listingId}/audit-log`).pipe(
      map(logs => {
        if (!logs || logs.length === 0) {
          return this.auditLog.filter(r => r.listingId === listingId);
        }
        return logs.map(l => {
          const actionType = this.mapBackendToAction(l.action);
          const config = ADMIN_ACTION_CONFIGS.find(c => c.type === actionType);
          return {
            id: l.id,
            listingId: l.listingId,
            actionType: actionType,
            actionLabel: config?.label ?? l.action,
            reason: l.reason,
            reviewerName: l.reviewerId ? 'Reviewer ' + l.reviewerId.slice(0, 8) : 'Admin Reviewer',
            timestamp: l.createdAt,
          };
        });
      }),
      catchError(err => {
        console.warn('Backend audit-log endpoint failed or unavailable, falling back to client-side records:', err);
        return of(this.auditLog.filter(r => r.listingId === listingId));
      })
    );
  }

  /** Get all audit records */
  getAllAuditRecords(): AuditRecord[] {
    return [...this.auditLog];
  }

  /** Map ActionType to a user-friendly label */
  getActionLabel(type: ActionType): string {
    return ADMIN_ACTION_CONFIGS.find(c => c.type === type)?.label ?? type;
  }
}

