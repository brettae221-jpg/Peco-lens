# Security Specification

## Data Invariants
1. A **User** must have an email and a valid role ('Admin' or 'Operator').
2. A **PM Item** must be logged with a timestamp, equipment type, part name, and descriptive issue.
3. A **PM Entry** must have a source, area, and description.
4. **Chat Messages** must have a sender email, text, and timestamp.
5. **News Posts** must identify the author and have a valid type.
6. **Telemetry (Machines)** must have a name and operational status.
7. **Audit Logs** are immutable once created and require semi-privileged access to read.
8. Only **Admins** can delete documents or modify system configurations.

## The Dirty Dozen (Test Payloads)

| Test ID | Collection | Action | Payload | Expected | Reason |
|---------|------------|--------|---------|----------|--------|
| T1 | pm_items | create | { "partName": "Missing Fields" } | Deny | Missing required fields (timestamp, status, etc) |
| T2 | pm_items | create | { "timestamp": "now", "partName": "A", "status": "Pending", "shadow": true } | Deny | Strict key check (Ghost field) |
| T3 | users | update | { "role": "Admin" } | Deny | Operator attempting to elevate their own role |
| T4 | messages | create | { "senderEmail": "attacker@evil.com", "text": "Spoof" } | Deny | Identity poisoning (Sender email doesn't match auth) |
| T5 | pmlist | update | { "status": "Fixed", "area": "Changed Area" } | Deny | State shortcutting (Updating immutable fields during status change) |
| T6 | newsfeed | create | { "textContent": "A" * 10000 } | Deny | Resource exhaustion (String too large) |
| T7 | machines | update | { "status": "Operational" } | Allow/Deny | Should only be allowed by authorized operators or system |
| T8 | users | update | { "email": "new@email.com" } | Deny | Attempting to change immutable identity field |
| T9 | audit_logs | delete | - | Deny | Even admins shouldn't delete audit logs (integrity) |
| T10 | pm_items | create | { "status": "Fixed" } | Deny | Cannot create a PM item already in 'Fixed' state |
| T11 | threads | create | { "participants": ["a@a.com", "b@b.com"] } | Deny | If user is not one of the participants |
| T12 | gallery_assets | create | { "url": "...", "userId": "someone_else" } | Deny | Identity spoofing |

## Firestore Test Plan
1. Authenticate as 'Operator' (User A).
2. Attempt T3, T8, T12. Expect Deny.
3. Authenticate as 'Admin' (User B).
4. Create a PM item. Expect Allow.
5. Attempt T9. Expect Deny.
