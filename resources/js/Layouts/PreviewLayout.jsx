import React from "react"; 
import '../../assets/front-end/css/block-editor-preview.css';


export default function PreviewLayout({ children }) {
    return (
        <div className="page-wrapper">
            {children}
        </div>
    );
}
