import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { USER_DETAILS, API_URL } from './Constant.jsx';
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
    const [currentChunk, setCurrentChunk] = useState(0);
    const [showcontroller, setShowController] = useState(false);

    const handleFileOnChange = (e) => {
        if(e.target.files.length === 0) {
            setShowController(false);
            setProgress(0);
            setCurrentChunk(0);
            isPaused.current = false;
            return false;
        } 
        setShowController(true);
        setProgress(0);
        setCurrentChunk(0);
        isPaused.current = false;
         return true;
    }

    const uploadFile = async () => {
        const file = fileRef.current.files[0];
        const chunkSize = 2 * 1024 * 1024; //2MB
        const totalChunks = Math.ceil(file.size / chunkSize);
        console.log("file size: ", file.size);
        console.log("Total Chunks: ", totalChunks);
        for (let i = currentChunk; i <= totalChunks; i++) {
            console.log(isPaused.current);
            if (isPaused.current) {
                return;
            }
            const start = i * chunkSize;
            const end = start + chunkSize;
            const chunk = file.slice(start, end);
            console.log(`Uploading chunk ${i}`, chunk);

            const formData = new FormData();
            formData.append('file', chunk);
            formData.append('fileName', file.name);
            formData.append('chunkIndex', i);
            formData.append('totalChunks', totalChunks);
            await fetch(`${API_URL}/upload-large-file`, {
                method: "POST",
                body: formData,
                headers: {
                    "fileName": file.name,
                    "index": i,
                    "totalChunks": totalChunks
                },
            });
            setCurrentChunk(i + 1);
            setProgress(Math.round(((i + 1) / totalChunks) * 100));
        }
        alert('File is uploaded successfully!');
    }
    const handleStart = () => {
        isPaused.current= false;
        showPaused.current = true;
        uploadFile();
    };
    const handlePause = () => {
        isPaused.current=true;
        showPaused.current = false;
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
                        <button className='btn btn-primary m-1' type='button' onClick={handleStart}>{isPaused.current ? "Resume" : "Start"}</button>
                        {
                        showPaused.current ?
                        <button className='btn btn-secondary' type='button' onClick={handlePause}>Pause</button>
                        :<></>
                        }
                        <progress value={progress} max="100" style={{ width: "100%" }} />
                    </div>
                     </> 
                     : <p style={{ color: "red" }}>Please select a file to upload</p>  
                }
                

                
               
            </div>
        </>
    )
}