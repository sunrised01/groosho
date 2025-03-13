import React, { useState } from "react";
import { FaPlus, FaGripHorizontal, FaTimes } from 'react-icons/fa';

export default function Row({ item, widgets, onDropRowHandler }) {

   const [dragging, setRowDragging] = useState(false);
   const [isTop, setIsTop] = useState(false); 
   const [showDropZone, setShowDropZone] = useState(false);
   const [dragId, setDragId] = useState(null);

   const handleRowDragStart = (e, widgetType, id) => {
      e.dataTransfer.setData("widgetType", widgetType);
      e.dataTransfer.setData('id', id);
      setRowDragging(true);
   };

   const handleRowDragOver = (e) => {
      e.preventDefault();
      setShowDropZone(true);
      const drag_id = e.dataTransfer.getData("id");
      setDragId(drag_id);

      const rect = e.target.getBoundingClientRect();
      const offset = e.clientY - rect.top;

      if (offset < rect.height / 2) {
         setIsTop(true);
      } else {
         setIsTop(false);
      }
   };

   const handleRowDrop = (e, position, itemid) => {
      e.preventDefault();
      const widgetType = e.dataTransfer.getData("widgetType");
      const id = e.dataTransfer.getData("id");
      const newWidget = { type: widgetType, id: id };

      const updatedWidgets = [...widgets];
      // Remove the existing record with the same id if it exists
      const indexToRemove = updatedWidgets.findIndex(widget => widget.id === id);
      if (indexToRemove !== -1) {
         updatedWidgets.splice(indexToRemove, 1); // Remove the widget
      }
         // Now, find the index of the item where the new widget should be placed
      const index = updatedWidgets.findIndex(widget => widget.id === itemid);
      console.log('Item to be inserted at index:', index);


      if (index !== -1) {
         if (position === "before") {
            updatedWidgets.splice(index, 0, newWidget); 
         } else {
            updatedWidgets.splice(index + 1, 0, newWidget); 
         }
      }
      
      console.log(updatedWidgets);
      // Update the state with the new widgets array
      onDropRowHandler(updatedWidgets);
      setRowDragging(false);
      setIsTop(false); 
      setShowDropZone(false);
   };

   const handleDragOver = (e) => {
      e.preventDefault();
   };

   const handleDragLeave = (e) => {
      e.preventDefault();
      setShowDropZone(false);
   };

   const isDraggable = widgets.length > 1;

   return (
      <>
         {/* Conditionally render drop zones based on the drag position */}
         {showDropZone && dragId && dragId !== item.id && isTop && (
            <div 
               className="row-drop-zone"
               onDrop={(e) => handleRowDrop(e, "before", item.id)}
               onDragLeave={handleDragLeave}
               onDragOver={handleRowDragOver}

            />
         )}

         <div
            id={`blockeditor-${item.id}`}
            className={`blockeditor-section-wrap ${dragging ? "dragging" : ""}`}
            draggable={isDraggable} 
            onDragStart={(e) => handleRowDragStart(e, 'Row', item.id)}
            onDragOver={handleRowDragOver}
         >
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

         {showDropZone && dragId && dragId !== item.id && !isTop && (
            <div 
               className="row-drop-zone"
               onDrop={(e) => handleRowDrop(e, "after", item.id)}
               onDragLeave={handleDragLeave}
               onDragOver={handleDragOver}

            />
         )}
      </>
   );
}
