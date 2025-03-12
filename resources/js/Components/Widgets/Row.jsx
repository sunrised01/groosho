import React, { useState } from "react";
import { FaPlus, FaGripHorizontal, FaTimes } from 'react-icons/fa';

export default function Row({ item, onDropRowHandler, onDragStartRowHandler }) {
  const [dragging, setRowDragging] = useState(false);
   

  const handleRowDragStart = (e, widgetType, id) => {
        e.dataTransfer.setData("widgetType", widgetType);
        e.dataTransfer.setData('id', id);
    };

  const handleRowDragOver = (e) => {
    e.preventDefault(); 
  };

  const handleRowDrop = (e) => {
    e.preventDefault();
    const widgetType = e.dataTransfer.getData("widgetType");
    const id = e.dataTransfer.getData("id");

    const newWidget = { type: widgetType, id: id };
    
    onDropRowHandler(newWidget, id);
    setRowDragging(false); 
  };
  
  return (
    <div
      id={`blockeditor-${item.id}`}
      className={`blockeditor-section-wrap ${dragging ? "dragging" : ""}`}
      draggable
      onDragStart={(e) => handleRowDragStart(e, 'Row', item.id)}
      onDragOver={handleRowDragOver}
      
    >
      <div 
          className="" 
          onDrop={handleRowDrop} 
          style={{
              background: 'red',
              color: '#fff',
              textAlign: 'center',
              padding: '11px 0',
              position: 'relative',
              zIndex: 99999
          }} 
      >
          Drag Here
      </div>

      <div className="blockeditor-elements">
        <div className="blockeditor-overlay-elements">
          <ul className="blockeditor-element-settings justify-aligen-center">
            <li className="blockeditor-element-add" title="Add Container">
              <FaPlus size={12} color="#444" aria-hidden="true" />
            </li>
            <li className="blockeditor-element-edit" title="Edit Container">
              <FaGripHorizontal size={12} color="#444" aria-hidden="true" />
            </li>
            <li className="blockeditor-element-remove" title="Delete Container">
              <FaTimes size={12} color="#444" aria-hidden="true" />
            </li>
          </ul>
        </div>
        <div className="blockeditor-inner-elements">
          <div className="blockeditor-empty-view">
            <div className="blockeditor-first-add">
              <div className="blockeditor-icon">
                <h1>Drag Item : {item.type} - {item.id}</h1>
                    <FaPlus size={15} color="#9da5ae" className="plus-icon" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
