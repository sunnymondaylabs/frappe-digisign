// digisign/digisign/doctype/document/document.js

frappe.ui.form.on('Document', {
    refresh: function (frm) {
        // Only show signature positioning in Draft state
        if (frm.doc.status === 'Draft') {
            // Add button to enter signature positioning mode
            frm.add_custom_button(__('Position Signatures'), function () {
                setupSignaturePositioning(frm);
            });
        }
    },

    template: function (frm) {
        // When template is selected, copy content from template
        if (frm.doc.template) {
            frappe.call({
                method: 'digisign.digisign.doctype.document.document.get_template_content',
                args: {
                    template: frm.doc.template
                },
                callback: function (r) {
                    if (r.message) {
                        frm.set_value('content', r.message);
                    }
                }
            });
        }
    }
});

function setupSignaturePositioning(frm) {
    // Create overlay div for document content
    const contentWrapper = $('<div class="signature-positioning-overlay"></div>')
        .css({
            position: 'relative',
            border: '1px solid #ddd',
            minHeight: '500px',
            margin: '15px 0'
        });

    // Convert content to display format
    const contentDisplay = $('<div class="content-display"></div>')
        .html(frm.doc.content);

    contentWrapper.append(contentDisplay);

    // Add signature placeholders for each signer
    frm.doc.signers.forEach((signer, index) => {
        const signerName = signer.user;

        // Create draggable signature placeholder
        const signaturePlaceholder = $(`
            <div class="signature-placeholder" data-signer="${signerName}">
                <div class="signature-label">Signature: ${signerName}</div>
            </div>
        `).css({
            position: 'absolute',
            top: '50px',
            left: '50px',
            width: '200px',
            height: '100px',
            border: '2px dashed #4444ff',
            backgroundColor: 'rgba(68, 68, 255, 0.1)',
            cursor: 'move',
            zIndex: 100
        });

        // Make placeholder draggable
        signaturePlaceholder.draggable({
            containment: 'parent',
            stop: function (event, ui) {
                // Save position to the signers table
                const position = ui.position;
                frappe.model.set_value(
                    'Document Workflow',
                    signer.name,
                    {
                        'x_position': position.left,
                        'y_position': position.top
                    }
                );
            }
        });

        contentWrapper.append(signaturePlaceholder);
    });

    // Show in dialog
    const d = new frappe.ui.Dialog({
        title: __('Position Signatures'),
        fields: [{
            fieldtype: 'HTML',
            fieldname: 'positioning_area',
            options: contentWrapper
        }],
        primary_action_label: __('Save Positions'),
        primary_action: function () {
            frm.save();
            d.hide();
        }
    });

    d.show();
}

// Add required styles
frappe.dom.set_style(`
    .signature-positioning-overlay {
        background: white;
        padding: 20px;
    }
    .signature-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: #4444ff;
    }
    .signature-label {
        text-align: center;
    }
`);