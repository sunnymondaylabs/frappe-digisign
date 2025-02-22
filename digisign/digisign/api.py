import frappe
from frappe import _

@frappe.whitelist(allow_guest=False)
def get_pending_signatures():
    """Get documents pending signature for the current user"""
    user = frappe.session.user
    
    # Find documents where this user is in the signers table with pending status
    return frappe.db.sql("""
        SELECT d.name, d.title, d.status, d.creation
        FROM `tabDocument` d
        INNER JOIN `tabDocument Workflow` dw ON dw.parent = d.name AND dw.parenttype = 'Document'
        WHERE dw.user = %s 
        AND dw.status = 'Pending'
        AND d.status = 'Pending Signature'
        AND dw.parentfield = 'signers'
    """, (user), as_dict=1)

@frappe.whitelist(allow_guest=False)
def get_completed_documents():
    """Get completed documents involving the current user"""
    user = frappe.session.user
    
    return frappe.db.sql("""
        SELECT d.name, d.title, d.modified
        FROM `tabDocument` d
        INNER JOIN `tabDocument Workflow` dw ON dw.parent = d.name AND dw.parenttype = 'Document'
        WHERE dw.user = %s 
        AND d.status = 'Completed'
    """, (user), as_dict=1)

@frappe.whitelist(allow_guest=False)
def get_review_documents():
    """Get documents under review for the current user"""
    user = frappe.session.user
    
    return frappe.db.sql("""
        SELECT d.name, d.title, d.status
        FROM `tabDocument` d
        INNER JOIN `tabDocument Workflow` dw ON dw.parent = d.name AND dw.parenttype = 'Document'
        WHERE dw.user = %s 
        AND d.status IN ('Pending Review', 'Under Review')
        AND dw.parentfield = 'reviewers'
    """, (user), as_dict=1)