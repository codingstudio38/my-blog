import React, { useEffect, useRef } from 'react';
import './../Css/chat-box.css';
import { API_URL, WEBSITE_PUBLIC, API_STORAGE_URL } from './Constant';
export default function Messagefilefilter(props) {
    var file = props.row.file_dtl.filename;
    var file_view_path = props.row.file_dtl.file_view_path;
    var ext = file.substring(file.lastIndexOf('.') + 1).toLowerCase();
    var noimage = `${WEBSITE_PUBLIC}/images/no-img.jpg`;
    const firstCall = useRef(true);
    useEffect(() => {
        if (firstCall.current) {
            firstCall.current = false;
            return;
        }
    })
    if (file === "") {
        return (
            <>

            </>
        );
    }
    if (ext === "gif" || ext === "png" || ext === "PNG" || ext === "jpeg" || ext === "jpg" || ext === "jfif" || ext === "webp") {
        return (
            <>
                {file_view_path == "" ?
                    <a target="_blank" href="#">
                        <img src={noimage} className="images" />
                    </a>
                    :
                    <a target="_blank" href={file_view_path}>
                        <img src={file_view_path} className="images" />
                    </a>
                }

            </>
        );
    } else if (ext === "xlsx" || ext === "xls") {
        return (
            <>
                {file_view_path == "" ?
                    <a target="_blank" href="#">
                        <img src={noimage} className="images" />
                    </a>
                    :
                    <a target="_blank" href={file_view_path} download={file_view_path}>
                        <img src={`${WEBSITE_PUBLIC}/images/excel.png`} className="images" />
                    </a>
                }
            </>
        )
    } else if (ext === "pdf") {
        return (
            <>
                {file_view_path == "" ?
                    <a target="_blank" href="#">
                        <img src={noimage} className="images" />
                    </a>
                    :
                    <a target="_blank" href={file_view_path} download={file_view_path}>
                        <img src={`${WEBSITE_PUBLIC}/images/pdf.png`} className="images" />
                    </a>
                }
            </>
        )
    } else if (ext === "docx" || ext === "doc") {
        return (
            <>
                {file_view_path == "" ?
                    <a target="_blank" href="#">
                        <img src={noimage} className="images" />
                    </a>
                    :
                    <a target="_blank" href={file_view_path} download={file_view_path}>
                        <img src={`${WEBSITE_PUBLIC}/images/doc.png`} className="images" />
                    </a>
                }
            </>
        )
    } else {
        return (
            <>
                {file_view_path == "" ?
                    <a target="_blank" href="#">
                        <img src={noimage} className="images" />
                    </a>
                    :
                    <a target="_blank" href={file_view_path} download={file_view_path}>
                        <img src={`${WEBSITE_PUBLIC}/images/Icon-doc.png`} className="images" />
                    </a>
                }
            </>
        )
    }
}