# digisign/digisign/doctype/document/document.py

import frappe
from frappe.model.document import Document

class Document(Document):
    def validate(self):
        self.validate_signers()
    
    def validate_signers(self):
        # Ensure signers have signatures in their profiles
        for signer in self.signers:
            user_signature = frappe.get_value('User', signer.user, 'digital_signature')
            if not user_signature:
                frappe.throw(f'User {signer.user} does not have a signature in their profile')

@frappe.whitelist()
def get_template_content(template):
    return frappe.get_value('Document Template', template, 'content')