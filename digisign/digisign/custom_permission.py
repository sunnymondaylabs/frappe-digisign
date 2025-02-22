# This file should be at: /home/bonski/sunny-desk/apps/digisign/digisign/digisign/custom_permission.py

import frappe
from frappe import _

def get_permission_query_conditions(user):
    if not user:
        user = frappe.session.user
    
    if user == "Administrator":
        return ""
    
    # Find documents where the user is either the owner, a reviewer, or a signer
    return """
        (`tabDocument`.`owner` = '{user}')
        OR
        EXISTS (
            SELECT 1 FROM `tabDocument Workflow` 
            WHERE `tabDocument Workflow`.`parent` = `tabDocument`.`name` 
            AND `tabDocument Workflow`.`user` = '{user}' 
            AND `tabDocument Workflow`.`parenttype` = 'Document'
        )
    """.format(user=user)

def has_permission(doc, user=None, permission_type=None):
    if not user:
        user = frappe.session.user
    
    if user == "Administrator":
        return True
    
    # Check if user is owner
    if doc.owner == user:
        return True
    
    # Check if user is a reviewer or signer
    workflow_users = frappe.get_all("Document Workflow", 
                                  filters={"parent": doc.name, "parenttype": "Document", "user": user},
                                  fields=["name"])
    
    if workflow_users:
        return True
    
    return False