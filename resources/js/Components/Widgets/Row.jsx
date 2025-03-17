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
      const dragid = Number(e.dataTransfer.getData("id"));
      const action = e.dataTransfer.getData("action");
      const colNum = e.dataTransfer.getData("colNum");
      
      const newWidget = { type: widgetType, id: dragid, colNum: colNum, action: action };

      const updatedWidgets = [...widgets];
     
      const indexToRemove = updatedWidgets.findIndex(widget => widget.id === dragid);
      
      if (indexToRemove !== -1) {
         updatedWidgets.splice(indexToRemove, 1); 
      }
    
      const index = updatedWidgets.findIndex(widget => widget.id === itemid);
    
      if (index !== -1) {
         if (position === "before") {
            updatedWidgets.splice(index, 0, newWidget); 
         } else {
            updatedWidgets.splice(index + 1, 0, newWidget); 
         }
      }
      
     
      onDropRowHandler(updatedWidgets);
      setRowDragging(false);
      setIsTop(false); 
      setShowDropZone(false);
   };

   const handleInnerDrop = (e, itemid) => {
      e.preventDefault();
      
      const widgetType = e.dataTransfer.getData("widgetType");
      const id = Date.now();  
      const action = e.dataTransfer.getData("action");
      const colNum = e.dataTransfer.getData("colNum");
      
      const newWidget = { type: widgetType, id: id, colNum: colNum, action: action };
    
      let isAdded = false;
      
      const updatedWidgets = [...widgets];
      
      const addWidgetRecursive = (widgetList) => {
        widgetList.forEach((widget) => {
          if (widget.innerElements && widget.innerElements.length > 0) {
            const indexToUpdateInInner = widget.innerElements.findIndex(innerWidget => innerWidget.id === itemid);
            
            if (indexToUpdateInInner !== -1) {
              addWidgetRecursive(widget.innerElements);
    
            } else {
              addWidgetRecursive(widget.innerElements);
            }
          } else {
            if (widget.id === itemid) {
              widget.innerElements = widget.innerElements || [];  
              widget.innerElements.push(newWidget); 
              isAdded = true;
            }
          }
        });
      };
    
      addWidgetRecursive(updatedWidgets);
    
      if (isAdded) {
        onDropRowHandler(updatedWidgets);
        console.log('Updated Widgets:', updatedWidgets);
      }
   };
    
   const handleDragOver = (e) => {
      e.preventDefault();
   };

   const handleDragLeave = (e) => {
      e.preventDefault();
      setShowDropZone(false);
   };

   const handleRemoveRow = (itemId) => {
      const updatedWidgets = [...widgets];
     
      const indexToRemove = updatedWidgets.findIndex(widget => widget.id === itemId);
      
      if (indexToRemove !== -1) {
         updatedWidgets.splice(indexToRemove, 1); 
      }
      onDropRowHandler(updatedWidgets);

   }

   const handleAddRow = (itemId) => {
      const updatedWidgets = [...widgets];

      const index = updatedWidgets.findIndex(widget => widget.id === itemId);
      
      if (index !== -1) {
         const newWidget = { type: 'Row', id: Date.now(), colNum: 1, action: true  };
         if (index === 0) {
            updatedWidgets.splice(index, 0, newWidget); 
         }
         else{
            updatedWidgets.splice(index - 1, 0, newWidget); 
         }
         onDropRowHandler(updatedWidgets);
      }

   }

   const handleEditSection = (itemId) => {
      const updatedWidgets = [...widgets];  
      updatedWidgets.forEach(widget => {
        widget.action = false;
      });
    
      const indexToUpdate = updatedWidgets.findIndex(widget => widget.id === itemId);
    
      if (indexToUpdate !== -1) {
        updatedWidgets[indexToUpdate].action = true;
      }
    
      onDropRowHandler(updatedWidgets);
    };
    
    const renderInnerElements = (innerElements) => {
      return innerElements.map((innerItem) => {
         return (
            <div className={innerItem.action == true ? "blockeditor-col-elements active" : "blockeditor-col-elements"} >
               {innerItem.innerElements ?
                         renderInnerElements(innerItem.innerElements)
                     :
                  <div className="blockeditor-first-add" onDrop={(e) => handleInnerDrop(e, innerItem.id)}>
                     <div className="blockeditor-icon" >
                        <FaPlus size={12} color="#9da5ae" className="plus-icon" />
                     </div>
                  </div>
               }
                  
            </div>
         )
      });
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
            <div className={item.action == true ? "blockeditor-elements active" : "blockeditor-elements"} >
               <div className="blockeditor-overlay-elements">
                  <ul className="blockeditor-element-settings justify-aligen-center">
                     <li 
                        className="blockeditor-element-add" 
                        title="Add Row"
                        onClick={() => handleAddRow(item.id)}>
                           <FaPlus size={12} color="#444" aria-hidden="true" />
                     </li>
                     <li 
                     className="blockeditor-element-edit" 
                     title="Edit Row"
                     onClick={() => handleEditSection(item.id)}>
                        <FaGripHorizontal size={12} color="#444" aria-hidden="true" />
                     </li>
                     <li 
                     className="blockeditor-element-remove" 
                     title="Delete Row" 
                     onClick={() => handleRemoveRow(item.id)}>
                           <FaTimes size={12} color="#444" aria-hidden="true" />
                     </li>

                  </ul>
               </div>
               <div className="blockeditor-inner-elements">
                  <div className="blockeditor-empty-view">
                     {item.innerElements ?
                         renderInnerElements(item.innerElements)
                     :
                     <div className="blockeditor-first-add" onDrop={(e) => handleInnerDrop(e, item.id)}>
                        <div className="blockeditor-icon" >
                           <FaPlus size={12} color="#9da5ae" className="plus-icon" />
                        </div>
                     </div>
                    
                     }
                     
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
