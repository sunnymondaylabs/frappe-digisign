# import frappe

# def custom_search_filter(user):
#     if "Digisign User" in frappe.get_roles(user):
#         # Define the doctypes that should be searchable for Digisign User
#         allowed_doctypes = [
#             "Document",
#             "Document Template",
#             "Document Workflow",
#             "Document Signature Position",
#             "User",
#             "User Profile"  # Include any user-related doctypes needed
#         ]
#         return allowed_doctypes
#     return None  # Return None for other roles to use default search