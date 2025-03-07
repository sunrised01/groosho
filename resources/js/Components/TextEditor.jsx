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
  FaPalette,
} from 'react-icons/fa';

const TextEditor = () => {
  const editorRef = useRef(null);
  const [heading, setHeading] = useState('h1');
  const [textColor, setTextColor] = useState('#000000');
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editorMode, setEditorMode] = useState('visual'); // 'visual' or 'text'

  // Function to apply formatting to selected text
  const applyFormatting = (command, value = null) => {
    document.execCommand(command, false, value);
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

  // Toggle the color picker visibility
  const toggleColorPicker = () => {
    setShowColorPicker((prevState) => !prevState);
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

  // Automatically wrap text in a <p> tag when typing in the editor
  const handleTextInput = () => {
    let content = editorRef.current.innerHTML.trim();
    
    // If the content is empty, wrap it in a <p> tag
    if (!content) {
      editorRef.current.innerHTML = '<p></p>';
    } 
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
        console.log(file);
    
        // Ensure the file has a valid preview URL
        if (!file) {
            return;  // Exit the function if there's no preview URL
        }
    
        const editor = editorRef.current;
        const img = document.createElement('img');
        
        // Load the image to get its natural dimensions
        const image = new Image();
        image.onload = () => {
            // Once the image is loaded, get its width and height
            img.src = file.preview_url;  // Use the preview_url for the image source
            img.width = image.naturalWidth;  // Set the natural width
            img.height = image.naturalHeight;  // Set the natural height
    
            // Add title, if available
            if (file.title) {
                img.title = file.title;  // Add title attribute
            }
    
            img.style.maxWidth = '100%';  // Ensure it fits within the editor
            img.style.height = 'auto';  // Allow the height to auto scale with the width
    
            // Create an anchor tag and wrap the image in it
            const anchor = document.createElement('a');
            anchor.href = file.url;  // Link to the original image URL
            anchor.target = '_blank';  // Open the image in a new tab when clicked
            anchor.appendChild(img);  // Append the image to the anchor tag
    
            // Create a container for the icons (Edit & Delete)
            const iconContainer = document.createElement('div');
            iconContainer.classList.add('image-icons-container');
            
            // Create the Edit icon (can be an 'edit' icon or text)
            const editIcon = document.createElement('span');
            editIcon.classList.add('edit-icon');
            editIcon.textContent = '✏️';  // You can replace this with an actual icon (e.g., FontAwesome)
    
            // Create the Delete icon (can be a 'delete' icon or text)
            const deleteIcon = document.createElement('span');
            deleteIcon.classList.add('delete-icon');
            deleteIcon.textContent = '❌';  // You can replace this with an actual icon (e.g., FontAwesome)
    
            // Append the icons to the container
            iconContainer.appendChild(editIcon);
            iconContainer.appendChild(deleteIcon);
    
            // Append the icon container to the anchor tag (image container)
            anchor.appendChild(iconContainer);
    
            // Optionally add a caption under the image
            if (file.caption) {
                const caption = document.createElement('figcaption');
                caption.textContent = file.caption;
    
                // Add a class to the caption for styling
                caption.classList.add('image-caption');
                anchor.appendChild(caption);  // Append caption under the image
            }
    
            // Get the current selection (cursor position)
            const selection = window.getSelection();
    
            // Check if there is a valid selection (if not, create a new range)
            if (!selection.rangeCount) {
                // No selection exists, so create a new range and insert the anchor with the image
                const range = document.createRange();
                range.selectNodeContents(editor); // Focus on the content of the editor
                range.collapse(false);  // Collapse the range to the end (cursor position)
    
                // Insert the anchor tag at the cursor position (outside any <p> tag)
                range.insertNode(anchor);
    
                // Set the cursor after the inserted anchor tag
                range.setStartAfter(anchor);
                range.setEndAfter(anchor);
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                // If there is a selection, proceed with inserting the anchor tag at the selection
                const range = selection.getRangeAt(0);
                range.deleteContents();  // Delete any selected text
                range.insertNode(anchor);   // Insert the anchor tag with the image
    
                // Move the cursor after the inserted anchor tag
                range.setStartAfter(anchor);
                range.setEndAfter(anchor);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        };
        
        // Set the image source to trigger the loading process
        image.src = file.preview_url;
    };
    
    
    
    
    
    


  // Effect to handle the visual/text toggle
  useEffect(() => {
    if (editorMode === 'visual') {
      // Automatically wrap content in a <p> tag if it's empty
      handleTextInput();
    }
  }, [editorMode]);

  return (
    <div>
        <AttachmentSelector onImageSelect={insertMediaIntoTextarea} icon="FaCamera" buttonname="Add Media" filetype="image" classname="btn btn-outline-primary btn-small" />
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
          whiteSpace: 'pre-wrap', // Keeps line breaks when typing in the visual editor
        }}
      />
    </div>
  );
};

export default TextEditor;
