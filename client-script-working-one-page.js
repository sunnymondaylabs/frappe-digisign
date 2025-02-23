frappe.ui.form.on('Document', {
    refresh: function (frm) {
        // For Draft status
        if (frm.doc.status === 'Draft') {
            if (frm.doc.reviewers && frm.doc.reviewers.length > 0) {
                frm.add_custom_button(__('Submit for Review'), function () {
                    frm.set_value('status', 'Pending Review');
                    frm.save();
                }).addClass('btn-primary');
            } else {
                frm.add_custom_button(__('Submit for Signing'), function () {
                    frm.set_value('status', 'Pending Signature');
                    frm.save();
                }).addClass('btn-primary');
            }
        }

        // For Reviewers
        if (frm.doc.status === 'Pending Review') {
            let isReviewer = frm.doc.reviewers.some(r =>
                r.user === frappe.session.user && r.status === 'Pending'
            );

            if (isReviewer) {
                frm.add_custom_button(__('Approve'), function () {
                    let reviewer = frm.doc.reviewers.find(r =>
                        r.user === frappe.session.user
                    );
                    frappe.model.set_value(
                        reviewer.doctype,
                        reviewer.name,
                        'status',
                        'Approved'
                    );
                    frm.set_value('status', 'Pending Signature');
                    frm.save();
                }).addClass('btn-primary');

                frm.add_custom_button(__('Reject'), function () {
                    let reviewer = frm.doc.reviewers.find(r =>
                        r.user === frappe.session.user
                    );
                    frappe.model.set_value(
                        reviewer.doctype,
                        reviewer.name,
                        'status',
                        'Rejected'
                    );
                    frm.set_value('status', 'Rejected');
                    frm.save();
                }).addClass('btn-danger');
            }
        }

        // For Signers
        if (frm.doc.status === 'Pending Signature') {
            let isSigner = frm.doc.signers.some(s =>
                s.user === frappe.session.user && s.status === 'Pending'
            );

            if (isSigner) {
                frm.add_custom_button(__('Sign'), function () {
                    frappe.db.get_value('User', frappe.session.user, 'digital_signature')
                        .then(r => {
                            if (r.message.digital_signature) {
                                let signer = frm.doc.signers.find(s =>
                                    s.user === frappe.session.user
                                );

                                // Add signature to content
                                // let signatureHtml = `
                                //     <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;">
                                //         <img src="${r.message.digital_signature}" 
                                //             style="max-height: 60px; margin-bottom: 5px;"><br>
                                //         <strong>${frappe.session.user}</strong><br>
                                //         Signed on: ${frappe.datetime.now_datetime()}
                                //     </div>
                                // `;
                                let signatureHtml = '';

                                let content = frm.doc.content || '';
                                frm.set_value('content', content + signatureHtml);

                                // Update signer status
                                frappe.model.set_value(
                                    signer.doctype,
                                    signer.name,
                                    'status',
                                    'Approved'
                                );

                                // Check if all signed
                                let allSigned = frm.doc.signers.every(s => s.status === 'Approved');
                                if (allSigned) {
                                    frm.set_value('status', 'Completed');
                                }
                                frm.save();
                            } else {
                                frappe.msgprint(__('Please add your signature in your profile first'));
                            }
                        });
                }).addClass('btn-primary');

                frm.add_custom_button(__('Reject'), function () {
                    let signer = frm.doc.signers.find(s =>
                        s.user === frappe.session.user
                    );
                    frappe.model.set_value(
                        signer.doctype,
                        signer.name,
                        'status',
                        'Rejected'
                    );
                    frm.set_value('status', 'Rejected');
                    frm.save();
                }).addClass('btn-danger');
            }
        }
    },

    // Copy template content when template is selected
    template: function (frm) {
        if (frm.doc.template) {
            frappe.db.get_value('Document Template', frm.doc.template, 'content')
                .then(r => {
                    if (r.message && r.message.content) {
                        frm.set_value('content', r.message.content);
                    }
                });
        }
    }
});