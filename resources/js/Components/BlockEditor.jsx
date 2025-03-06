import React, { useState } from 'react';

const BlockEditor = () => {
  const [blocks, setBlocks] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [draggingBlockId, setDraggingBlockId] = useState(null);
  const [draggingOffset, setDraggingOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Toggle the dropdown menu
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Add a new block to the editor based on the type
  const addBlock = (type) => {
    setBlocks([...blocks, { id: blocks.length + 1, content: '', type, position: { x: 0, y: 0 }, width: 300, height: 100 }]);
    setDropdownOpen(false); // Close dropdown after selection
  };

  // Update block content when the user types
  const updateBlockContent = (id, content) => {
    setBlocks(blocks.map(block => (block.id === id ? { ...block, content } : block)));
  };

  // Remove a block from the editor
  const removeBlock = (id) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };

  // Handle block dragging start
  const handleDragStart = (e, id) => {
    const block = blocks.find(block => block.id === id);
    setDraggingBlockId(id);
    setDraggingOffset({ x: e.clientX - block.position.x, y: e.clientY - block.position.y });
    setIsDragging(true);
  };

  // Handle block dragging during movement
  const handleDragMove = (e) => {
    if (!isDragging || draggingBlockId === null) return;

    const newBlocks = blocks.map(block => {
      if (block.id === draggingBlockId) {
        return {
          ...block,
          position: {
            x: e.clientX - draggingOffset.x,
            y: e.clientY - draggingOffset.y
          }
        };
      }
      return block;
    });

    setBlocks(newBlocks);
  };

  // Handle block dragging end
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggingBlockId(null);
  };

  // Handle resizing of blocks
  const handleResize = (id, e, direction) => {
    const block = blocks.find(block => block.id === id);

    let newWidth = block.width;
    let newHeight = block.height;

    if (direction === 'right') {
      newWidth = e.clientX - block.position.x;
    }

    if (direction === 'bottom') {
      newHeight = e.clientY - block.position.y;
    }

    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, width: newWidth, height: newHeight } : block
    ));
  };

  // Handle cancel drag operation
  const cancelDrag = () => {
    setIsDragging(false);
    setDraggingBlockId(null);
  };

  return (
    <div
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      style={{ position: 'relative', width: '100%', height: '100vh' }}
    >
      <h2>Block Editor</h2>

      {/* Dropdown Button */}
      <button onClick={toggleDropdown}>Add Block</button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-item" onClick={() => addBlock('heading')}>
            <img src="/icons/heading-icon.png" alt="Heading" />
            <span>Heading</span>
          </div>
          <div className="dropdown-item" onClick={() => addBlock('text')}>
            <img src="/icons/text-icon.png" alt="Text" />
            <span>Text Area</span>
          </div>
          <div className="dropdown-item" onClick={() => addBlock('image')}>
            <img src="/icons/image-icon.png" alt="Image" />
            <span>Add Image</span>
          </div>
          <div className="dropdown-item" onClick={() => addBlock('inline')}>
            <img src="/icons/inline-icon.png" alt="Inline" />
            <span>Inline Item</span>
          </div>
        </div>
      )}

      {/* Render Blocks */}
      <div className="blocks-container">
        {blocks.map(block => (
          <div
            key={block.id}
            className="block"
            style={{
              position: 'absolute',
              top: block.position.y,
              left: block.position.x,
              width: block.width,
              height: block.height,
              border: '1px solid #ccc',
              padding: '10px',
              backgroundColor: '#f9f9f9',
              cursor: 'move',
            }}
            onMouseDown={(e) => handleDragStart(e, block.id)}
          >
            <div className="block-header">
              <button onClick={() => removeBlock(block.id)}>Remove</button>
            </div>

            {block.type === 'heading' && (
              <h3
                contentEditable
                onInput={(e) => updateBlockContent(block.id, e.target.textContent)}
              >
                {block.content || 'Heading'}
              </h3>
            )}

            {block.type === 'text' && (
              <textarea
                value={block.content}
                onChange={(e) => updateBlockContent(block.id, e.target.value)}
                placeholder="Text Area"
              />
            )}

            {block.type === 'image' && (
              <div>
                <input
                  type="file"
                  onChange={(e) => updateBlockContent(block.id, e.target.files[0].name)}
                />
                {block.content && <img src={`path/to/images/${block.content}`} alt="uploaded" />}
              </div>
            )}

            {block.type === 'inline' && (
              <div
                contentEditable
                onInput={(e) => updateBlockContent(block.id, e.target.textContent)}
              >
                {block.content || 'Inline content here'}
              </div>
            )}

            {/* Resize Handle */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '10px',
                height: '10px',
                backgroundColor: '#000',
                cursor: 'se-resize',
              }}
              onMouseDown={(e) => e.stopPropagation()} // Prevent dragging to trigger resize
              onMouseMove={(e) => handleResize(block.id, e, 'right')}
              onMouseUp={(e) => e.stopPropagation()}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '10px',
                height: '10px',
                backgroundColor: '#000',
                cursor: 'sw-resize',
              }}
              onMouseDown={(e) => e.stopPropagation()} // Prevent dragging to trigger resize
              onMouseMove={(e) => handleResize(block.id, e, 'bottom')}
              onMouseUp={(e) => e.stopPropagation()}
            />
          </div>
        ))}
      </div>

      {/* Drag-and-Drop Cancel Button */}
      {isDragging && (
        <button onClick={cancelDrag} style={{ position: 'absolute', top: '10px', right: '10px' }}>
          Cancel Drag
        </button>
      )}
    </div>
  );
};

export default BlockEditor;
