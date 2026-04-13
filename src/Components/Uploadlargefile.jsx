import './../Css/Uploadlargefile.css';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { USER_DETAILS, API_URL } from './Constant.jsx';
import { Post_With_Htoken } from './../Services/Https';
import swal from 'sweetalert';
// import axios from 'axios';
export default function Uploadlargefile() {
    const LOGIN_USER = USER_DETAILS();
    const navigate = useNavigate();
    const firstCall = useRef(true);
    useEffect(() => {
        document.title = "MERN Technology || User - Upload Large File";
        if (LOGIN_USER === false) {
            navigate('/');
            return;
        }
        if (firstCall.current) {
            firstCall.current = false;
            return;
        }
    }, []);

    const [progress, setProgress] = useState(0);
    const fileRef = useRef(null);
    const isPaused = useRef(false);
    const showPaused = useRef(false);
    const showResume = useRef(false);
    const showStart = useRef(false);
    const total_chunk = useRef(0);
    const upload_chunk = useRef(0);
    const [currentChunk, setCurrentChunk] = useState(0);
    const [showcontroller, setShowController] = useState(false);

    const handleFileOnChange = (e) => {
        if(e.target.files.length === 0) {
            setShowController(false);
            setProgress(0);
            setCurrentChunk(0);
            showStart.current = false;
            showPaused.current = false;
            showResume.current = false;
            isPaused.current = false;
            return false;
        } 
        setShowController(true);
        setProgress(0);
        setCurrentChunk(0);
        showStart.current = true;
        showPaused.current = false;
        showResume.current = false;
        isPaused.current = false;
         return true;
    }

    const uploadFile = async () => {
        const file = fileRef.current.files[0];
        const chunkSize = 2 * 1024 * 1024; //2MB
        const totalChunks = Math.ceil(file.size / chunkSize);
        let can_resume_from_previous = true;
        total_chunk.current = totalChunks;
        
        // console.log("file size: ", file.size);
        // console.log("Total Chunks: ", totalChunks);
        for (let i = currentChunk; i < totalChunks; i++) {
            console.log("Uploading chunk: ", i);
            if (isPaused.current) {
                return false;
            }
            const start = i * chunkSize;
            const end = start + chunkSize;
            const chunk = file.slice(start, end);

            const formData = new FormData();
            formData.append('file', chunk);
            formData.append('fileName', file.name);
            formData.append('chunkIndex', i);
            formData.append('totalChunks', totalChunks);
            formData.append('userid', LOGIN_USER._id);
            let url = `${API_URL}/upload-large-file`;
            let headers = {
                // 'Content-Type': 'multipart/form-data',
                "fileName": file.name,
                "index": i,
                "totalChunks": totalChunks,
                'authorization': `Bearer ${LOGIN_USER.token}`,
            };
          
            let response = await fetch(url, {
                method: "POST",
                body: formData,
                headers: headers,
            });
            response = await response.json();
            if(response.status !== 200) {
                isPaused.current= true;
                showResume.current = true;
                showPaused.current = false;
                 swal({
                        title: (response.message) ? response.message : response.statusText || "Unknown error",
                        icon: "error",
                    })
                    return false;
            }
            let before_file_uploaded= response.before_file_uploaded;
         
            // console.log(response);
            // console.log(`Uploading chunk ${i}`);
            if(before_file_uploaded==true && can_resume_from_previous==true){// check if file is already uploaded and resume upload from last uploaded chunk
                can_resume_from_previous=false;
                i= response.previous_metadata.uploadedchunk;
                let currentchunk = i + 1;
                setCurrentChunk(currentchunk);
                upload_chunk.current = currentchunk;
                setProgress(Math.round(((currentchunk) / totalChunks) * 100));
            } else {
                let currentchunk = i + 1;
                setCurrentChunk(currentchunk);
                upload_chunk.current = currentchunk;
                setProgress(Math.round(((currentchunk) / totalChunks) * 100));
            }
        }
        swal({
            title: "File is uploaded successfully!",
            icon: "success",
        })
        isPaused.current= false;
        showResume.current = false;
        showPaused.current = false;
        showStart.current = true;
        setProgress(0);
        setShowController(false);
        fileRef.current.value = null;
    }
    const handleStart = () => {
        setProgress(0);
        isPaused.current= false;
        showResume.current = false;
        showPaused.current = true;
        showStart.current = false;
        uploadFile();
    };
    const handleResume = () => {
        isPaused.current= false;
        showPaused.current = true;
        showResume.current = false;
        showStart.current = false;
        uploadFile();
    };
    const handlePause = () => {
        isPaused.current=true;
        showPaused.current = false;
        showResume.current = true;
        showStart.current = false;
    };
    return (
        <>
            <h1>Upload Large File</h1>
            <div style={{ maxWidth: "400px", margin: "40px auto" }}>
                <h2>Large File Upload</h2>

                <input
                    type="file"
                    ref={fileRef}
                    style={{ marginBottom: "10px" }}
                    onChange={handleFileOnChange}
                />
                {
                    showcontroller ?
                    <>
                    <div style={{ marginBottom: "10px" }}>
                        {
                        showStart.current ?
                        <button className='btn btn-success m-1' title='Upload File' alt='Upload File' type='button' onClick={handleStart}><i className="bi bi-cloud-arrow-up-fill"></i></button>
                        :<></>
                        }
                        {
                        showResume.current ?
                        <button className='btn btn-primary m-1' type='button' title='Resume Upload' alt='Resume Upload' onClick={handleResume}><i className="bi bi-play-fill"></i></button>
                        :<></>
                        }
                        {
                        showPaused.current ?
                        <button className='btn btn-secondary' type='button' title='Pause Upload' alt='Pause Upload' onClick={handlePause}><i className="bi bi-pause-fill"></i></button>
                        :<></>
                        }
                        <div className="progress mt-1 mb-1" role="progressbar" aria-label={`${progress}% Uploaded`} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                            <div className={isPaused.current ? "progress-bar text-bg-secondary paused" : "progress-bar text-bg-success running"} style={{ width: `${progress}%` }}>
                                {progress}%
                            </div>
                        </div>

                        {/* <progress value={progress} max="100" 
                        style={{
                            background: `linear-gradient(to right, rgba(233, 18, 18, 0.85) ${progress}%, #e6e6e6 ${progress}%)`,
                            width: "100%" 
                            }}
                        /> */}
                        
                    </div>
                     </> 
                     : <p style={{ color: "red" }}>Please select a file to upload</p>  
                }
            </div>
        </>
    )
}