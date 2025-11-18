import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { CKADITOR_UPLOAD_URL, USER_DETAILS } from './Constant';
import $ from 'jquery';
const Ckeditor = forwardRef((props, ref) => {
    const [editorid, seteditorid] = useState(props.ckid || 'editor');
    useImperativeHandle(ref, () => ({
        Resetckeditor,
        setckeditor
    }));
    const LOGIN_USER = USER_DETAILS();
    useEffect(() => {
        if (window.CKEDITOR) {
            window.CKEDITOR.replace(editorid, {
                allowedContent: true,
                extraPlugins: 'uploadimage',
                // removeButtons: 'exportPdf,Save,NewPage,Preview,Print,Templates,Cut,Copy,Paste,PasteFromWord,Scayt,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Strike,Subscript,Superscript,CopyFormatting,RemoveFormat,Outdent,Indent,CreateDiv,Blockquote,BidiLtr,BidiRtl,Language,Anchor,Flash,Smiley,SpecialChar,Iframe,Maximize,ShowBlocks,About',
                disallowedContent: '*{*color}; *{*align}',
                filebrowserBrowseUrl: 'https://ckeditor.com/apps/ckfinder/3.4.5/ckfinder.html',
                filebrowserImageBrowseUrl: 'https://ckeditor.com/apps/ckfinder/3.4.5/ckfinder.html?type=Images',
                filebrowserUploadUrl: `${CKADITOR_UPLOAD_URL}`,
                filebrowserImageUploadUrl: `${CKADITOR_UPLOAD_URL}`,
                uploadUrl: `${CKADITOR_UPLOAD_URL}`,
            });

            window.CKEDITOR.on("instanceReady", (evt) => {
                setTimeout(()=>{
                    let c = $(".cke_notifications_area");
                    c.remove();
                },400)
                const editor = evt.editor;
                if (editor.name === editorid) {
                    editor.on("change", (e) => {
                        const editorInstance = window.CKEDITOR.instances[editorid];
                        if (editorInstance) {
                            props.getcontent(editorInstance.getData());
                            return true;
                        } else {
                            console.error('Editor instance not found!');
                            return false;
                        }
                    });
                    editor.on('fileUploadRequest', function (evt) {
                        const xhr = evt.data.fileLoader.xhr;
                        if (LOGIN_USER !== false) {
                            if (!xhr._authHeaderSet) {
                                xhr.setRequestHeader(
                                    'Authorization',
                                    `Bearer ${LOGIN_USER.token}`
                                );
                                xhr._authHeaderSet = true; // mark as set
                            }
                        }
                    });
                }
            });
            
        } else {
            console.error('CKEditor not loaded');
        }

        return () => {
            if (window.CKEDITOR.instances[editorid]) {
                window.CKEDITOR.instances[editorid].destroy(true);
            }
        };
    }, []);

 

    const Resetckeditor = (id)=>{
    const editorInstance = window.CKEDITOR.instances[id];
    if (editorInstance) {
       editorInstance.setData("");
       return true;
    } else {
      return false;
    }
  }
  const setckeditor = (id,dara)=>{
    const editorInstance = window.CKEDITOR.instances[id];
    if (editorInstance) {
       editorInstance.setData(dara);
       return true;
    } else {
      return false;
    }
  }

    return (
        <div id={editorid}>

        </div>
    );
});
export default Ckeditor;
