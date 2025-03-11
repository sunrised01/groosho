import React, { useState, useRef, useEffect } from 'react';
import AttachmentSelector from '@/Components/Admin/AttachmentSelector';
import {
    FaBold,
    FaItalic,
    FaAlignLeft,
    FaAlignCenter,
    FaAlignRight,
    FaListOl,
    FaLink,
    FaQuoteRight,
    FaHeading,
} from 'react-icons/fa';
import { Link } from '@inertiajs/react';


const TextEditor = ({ onContentChange, editorContent, post_id=null }) => {
    const editorRef = useRef(null);
    const [heading, setHeading] = useState('h1');
    const [textColor, setTextColor] = useState('#000000');
    const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [editorMode, setEditorMode] = useState('visual'); 

    // Function to apply formatting to selected text
    const applyFormatting = (command, value = null) => {
        document.execCommand(command, false, value);
        handleTextInput(); // Update content after formatting
    };

    // Function to change the text color
    const changeTextColor = (color) => {
        applyFormatting('foreColor', color);
        setShowColorPicker(false); // Close the color picker after selection
    };

    // Function to handle insertion of a link
    const insertLink = () => {
        const url = prompt('Enter the URL:');
        if (url) {
            applyFormatting('createLink', url);
        }
    };

    // Function to set Heading (h1 to h6)
    const setTextHeading = (heading) => {
        setHeading(heading);
        applyFormatting('formatBlock', heading);
        setShowHeadingDropdown(false); // Hide dropdown after selecting
    };

    // Toggle the dropdown visibility for headings
    const toggleHeadingDropdown = () => {
        setShowHeadingDropdown((prevState) => !prevState);
    };

    // Function to insert blockquote around the selected text
    const insertBlockquote = () => {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);

        // Get the selected HTML content
        const selectedHTML = range.cloneContents();

        if (selectedHTML.textContent.trim()) {
            // Create the blockquote element
            const blockquote = document.createElement('blockquote');
            blockquote.appendChild(selectedHTML);  // Add the selected HTML to the blockquote

            // Replace the selected text with the blockquote
            range.deleteContents();
            range.insertNode(blockquote);
            handleTextInput(); // Update content after inserting blockquote
        } else {
            alert('Please select some text to quote.');
        }
    };

    // Function to handle editor mode switch
    const toggleEditorMode = (mode) => {
        setEditorMode(mode);
        if (mode === 'text') {
            // When switching to 'text', update editor content to raw HTML
            editorRef.current.innerText = editorRef.current.innerHTML;
        } else {
            // When switching to 'visual', keep the current HTML view
            editorRef.current.innerHTML = editorRef.current.innerText;
        }
    };

    const handleTextInput = () => {
        let content = editorRef.current.innerHTML.trim();
       
        if (!content) {
            if(editorContent === ''){
               editorRef.current.innerHTML = '<p></p>';
            }
            else{
               editorRef.current.innerHTML = editorContent;

            }
        }
        else{
            if ( content === '<br>' || content === '<div><br></div>') {
               editorRef.current.innerHTML = '<p></p>';
            }
        }

        onContentChange(editorRef.current.innerHTML.trim());
        
    };

    // Handle "Enter" key press to insert a new <p> tag instead of a <br>
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default "Enter" behavior (creating <br>)

            // Insert a new <p> tag after the current content
            const newP = document.createElement('p');
            editorRef.current.appendChild(newP); // Add a new paragraph

            // Move the cursor to the new <p> tag
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(newP);
            selection.removeAllRanges();
            selection.addRange(range);

            // Optionally, insert a placeholder if the new <p> tag is empty
            newP.innerHTML = '&nbsp;'; // Makes it look like a blank line.
            handleTextInput(); // Update content after inserting new <p>
        }
    };

    // Ensure the cursor is inside a <p> tag on focus
    const handleFocus = () => {
        const editor = editorRef.current;
        if (!editor.innerHTML.trim()) {
            editor.innerHTML = '<p></p>';
        }

        // Focus inside the <p> tag
        const selection = window.getSelection();
        const range = document.createRange();
        const firstParagraph = editor.querySelector('p');
        range.selectNodeContents(firstParagraph);
        selection.removeAllRanges();
        selection.addRange(range);
    };

    // Function to insert media (image) into the editor
    const insertMediaIntoTextarea = (file) => {
        if (!file) {
            return;
        }

        const file_url = file.attachments.featured_url
            ? file.attachments.featured_url
            : file.attachments.featured_url
            ? file.attachments.thumbnail_url
            : file.attachments.original_url

        const editor = editorRef.current;
        const img = document.createElement('img');

        const image = new Image();
        image.onload = () => {
            img.src = file_url;
            img.width = image.naturalWidth;
            img.height = image.naturalHeight;

            if (file.title) {
                img.alt = file.title;
            }

            img.style.maxWidth = '100%';
            img.style.height = 'auto';

            const anchor = document.createElement('a');
            anchor.href = file.attachments.original_url;
            anchor.target = '_blank';
            anchor.appendChild(img);

            const iconContainer = document.createElement('div');
            iconContainer.classList.add('image-icons-container');

            const editIcon = document.createElement('span');
            editIcon.classList.add('edit-icon');
            editIcon.textContent = '✏️';

            const deleteIcon = document.createElement('span');
            deleteIcon.classList.add('delete-icon');
            deleteIcon.textContent = '❌';

            iconContainer.appendChild(editIcon);
            iconContainer.appendChild(deleteIcon);

            anchor.appendChild(iconContainer);

            if (file.caption) {
                const caption = document.createElement('figcaption');
                caption.textContent = file.caption;

                caption.classList.add('image-caption');
                anchor.appendChild(caption);
            }

            const selection = window.getSelection();

            if (!selection.rangeCount) {
                const range = document.createRange();
                range.selectNodeContents(editor);
                range.collapse(false);
                range.insertNode(anchor);

                range.setStartAfter(anchor);
                range.setEndAfter(anchor);
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(anchor);
                range.setStartAfter(anchor);
                range.setEndAfter(anchor);
                selection.removeAllRanges();
                selection.addRange(range);
            }
            handleTextInput(); // Update content after inserting media
        };
        image.src = file_url;
    };

    useEffect(() => {
        if (editorMode === 'visual') {
            handleTextInput();
        }
    }, [editorMode]);

    return (
        <div>
           
            <div className="d-flex justify-align-left mb-5">
               <AttachmentSelector onImageSelect={insertMediaIntoTextarea} icon="FaCamera" buttonname="Add Media" filetype="image" classname="btn btn-outline-primary btn-small" />
                <Link as="button" href={route('blockeditor',post_id)} className="btn btn-outline-primary ms-2" >
                  Edit With Block Editor
                </Link>
            </div>
            
            <div className="toolbar">
                <div className="heading-buttons">
                    <button onClick={toggleHeadingDropdown} title="Select Heading">
                        <FaHeading />
                        <span>Headings</span>
                    </button>
                    {showHeadingDropdown && (
                        <div className="heading-dropdown">
                            <button onClick={() => setTextHeading('h1')}>H1</button>
                            <button onClick={() => setTextHeading('h2')}>H2</button>
                            <button onClick={() => setTextHeading('h3')}>H3</button>
                            <button onClick={() => setTextHeading('h4')}>H4</button>
                            <button onClick={() => setTextHeading('h5')}>H5</button>
                            <button onClick={() => setTextHeading('h6')}>H6</button>
                        </div>
                    )}
                </div>
                <button onClick={() => applyFormatting('bold')} title="Bold">
                    <FaBold />
                </button>
                <button onClick={() => applyFormatting('italic')} title="Italic">
                    <FaItalic />
                </button>
                <button onClick={() => applyFormatting('justifyLeft')} title="Align Left">
                    <FaAlignLeft />
                </button>
                <button onClick={() => applyFormatting('justifyCenter')} title="Align Center">
                    <FaAlignCenter />
                </button>
                <button onClick={() => applyFormatting('justifyRight')} title="Align Right">
                    <FaAlignRight />
                </button>
                <button onClick={() => applyFormatting('insertOrderedList')} title="Ordered List">
                    <FaListOl />
                </button>
                <button onClick={insertLink} title="Insert Link">
                    <FaLink />
                </button>
                <input
                    title="Text Color"
                    type="color"
                    value={textColor}
                    onChange={(e) => changeTextColor(e.target.value)}
                    style={{
                        padding: '5px',
                        width: '35px',
                        marginTop: '13px',
                    }}
                />
                <button onClick={insertBlockquote} title="Quote">
                    <FaQuoteRight />
                </button>

            </div>
            {/* Tab layout for the editor mode */}
            <div className="editor-tabs">
                <button
                    onClick={() => toggleEditorMode('visual')}
                    className={editorMode === 'visual' ? 'active' : ''}
                >
                    Visual
                </button>
                <button
                    onClick={() => toggleEditorMode('text')}
                    className={editorMode === 'text' ? 'active' : ''}
                >
                    Text
                </button>
            </div>
            <div
                ref={editorRef}
                contentEditable="true"
                onInput={handleTextInput}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                style={{
                    border: '1px solid #ccc',
                    minHeight: '200px',
                    padding: '10px',
                    marginTop: '0px',
                    whiteSpace: 'pre-wrap', 
                    maxHeight: '350px',
                     overflowX: 'scroll',
                }}
            />
            
        </div>
    );
};

export default TextEditor;
