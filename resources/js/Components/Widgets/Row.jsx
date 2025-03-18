import React, { useState } from "react";
import { FaPlus, FaGripHorizontal, FaTimes, FaSquare } from 'react-icons/fa';

export default function Row({ item, widgets, onDropRowHandler }) {
   const [dragging, setRowDragging] = useState(false);
   const [isTop, setIsTop] = useState(false);
   const [showDropZone, setShowDropZone] = useState(false);
   const [dragId, setDragId] = useState(null);
   const [activeDropZone, setActiveDropZone] = useState(null);

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

      const newWidget = { type: widgetType, id: dragid, action: action };

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
      const action = true;

      const newWidget = { type: widgetType, id: id, action: action };

      let isAdded = false;

      const updatedWidgets = [...widgets];

      updateActionToFalse(updatedWidgets);

      const addWidgetRecursive = (widgetList) => {
         widgetList.forEach((widget) => {
            if (widget.innerElements) {
               const indexToUpdateInInner = widget.innerElements.findIndex(innerWidget => innerWidget.id === itemid);

               if (indexToUpdateInInner !== -1) {
                  if (widget.innerElements[indexToUpdateInInner].type === "Row" || widget.innerElements[indexToUpdateInInner].type === "Column") {
                     addWidgetRecursive(widget.innerElements);
                  } else {
                     widget.innerElements.push(newWidget);
                  }
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
      }
      setActiveDropZone(null);
   };

   function updateActionToFalse(array) {
      array.forEach(item => {
         if (item.hasOwnProperty('action')) {
            item.action = false;
         }

         if (item.innerElements && Array.isArray(item.innerElements)) {
            updateActionToFalse(item.innerElements);
         }
      });
   }

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
   };

   const handleAddRow = (itemId) => {
      const updatedWidgets = [...widgets];

      const index = updatedWidgets.findIndex(widget => widget.id === itemId);

      if (index !== -1) {
         const newWidget = { type: 'Row', id: Date.now(), action: true };
         if (index === 0) {
            updatedWidgets.splice(index, 0, newWidget);
         } else {
            updatedWidgets.splice(index - 1, 0, newWidget);
         }
         onDropRowHandler(updatedWidgets);
      }
   };

   const handleEditItem = (item) => {
      const itemId = item.id;
      const updatedWidgets = [...widgets];
      updateActionToFalse(updatedWidgets);
      setActionToTrue(updatedWidgets, itemId);
      onDropRowHandler(updatedWidgets);

   };

   const setActionToTrue = (widgetList, itemId) => {
      widgetList.forEach((widget) => {
      if (widget.id === itemId) {
         widget.action = true; 
      }
   
      if (widget.innerElements && widget.innerElements.length > 0) {
         setActionToTrue(widget.innerElements, itemId); 
      }
      });
   };
   
   const handleInnerItemDragOver = (e, innerItem) => {
      e.preventDefault();
      setActiveDropZone(innerItem.id);
   };

   const renderInnerElements = (innerElements) => {
      return innerElements.map((innerItem) => {

         return (
            innerItem.type === "Row" ? (
               <div
                  key={innerItem.id}
                  className={innerItem.action === true ? "blockeditor-row-container active" : "blockeditor-row-container"}
               >
                  {innerItem.innerElements ?
                     renderInnerElements(innerItem.innerElements) :
                     <div className="blockeditor-inner-drop" onDrop={(e) => handleInnerDrop(e, innerItem.id)}>
                        <div className="blockeditor-icon">
                           <FaPlus size={12} color="#9da5ae" className="plus-icon" />
                        </div>
                     </div>
                  }
               </div>
            ) : innerItem.type === "Column" ? (
               <div
                  key={innerItem.id}
                  className={innerItem.action === true ? "blockeditor-col-elements active" : "blockeditor-col-elements"}
                  
               >
                  <div className="col-box-icon" onClick={() => handleEditItem(innerItem)}></div>
                  {innerItem.innerElements ?
                     renderInnerElements(innerItem.innerElements) :
                     <div className="blockeditor-inner-drop" onDrop={(e) => handleInnerDrop(e, innerItem.id)}>
                        <div className="blockeditor-icon">
                           <FaPlus size={12} color="#9da5ae" className="plus-icon" />
                        </div>
                     </div>
                  }
               </div>
            ) : innerItem.type === "Heading" ? (
               <div
                  key={innerItem.id}
                  className={innerItem.action === true ? "blockeditor-heading-element active" : "blockeditor-heading-element"}
                  onClick={() => handleEditItem(innerItem)}
                  onDragOver={(e) => handleInnerItemDragOver(e, innerItem)}
               >
                  <h1 className="inner-dragger" >This is a heading</h1>
                  {activeDropZone === innerItem.id && (
                     <div className="blockeditor-inner-dropper" onDrop={(e) => handleInnerDrop(e, innerItem.id)}></div>
                  )}
               </div>
            ) : innerItem.type === "TextEditor" ? (
               <div
                  key={innerItem.id}
                  className={innerItem.action === true ? "blockeditor-text-editor-element active" : "blockeditor-text-editor-element"}
                  onClick={() => handleEditItem(innerItem)}
                  onDragOver={(e) => handleInnerItemDragOver(e, innerItem)}
               >
                  <p>This is sample Paragraph</p>
                  {activeDropZone === innerItem.id && (
                     <div className="blockeditor-inner-dropper" onDrop={(e) => handleInnerDrop(e, innerItem.id)}></div>
                  )}
               </div>
            ) : innerItem.type === "Video" ? (
               <div
                  key={innerItem.id}
                  className={innerItem.action === true ? "blockeditor-video-element active" : "blockeditor-video-element"}
                  onClick={() => handleEditItem(innerItem)}
                  onDragOver={(e) => handleInnerItemDragOver(e, innerItem)}
               >
                  <video controls>
                     <source src={innerItem.type} type="video/mp4" />
                     Your browser does not support the video tag.
                  </video>
                  {activeDropZone === innerItem.id && (
                     <div className="blockeditor-inner-dropper" onDrop={(e) => handleInnerDrop(e, innerItem.id)}></div>
                  )}
               </div>
            ) : (
               <div key={innerItem.id} className="blockeditor-default-element">
                  <h1>Unknown type: {innerItem.type}</h1>
               </div>
            )
         );
      });
   };

   const isDraggable = widgets.length > 1;
   return (
      <>
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
            <div className={item.action === true ? "blockeditor-elements active" : "blockeditor-elements"} >
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
                        onClick={() => handleEditItem(item)}>
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
               <div className={`blockeditor-inner-elements ${item.type === "Grid" ? "grid-row" : ""}`}>

                  {item.innerElements ?
                     renderInnerElements(item.innerElements)
                     :
                     item.type === "Row" ? (
                        <div className="blockeditor-first-add" onDrop={(e) => handleInnerDrop(e, item.id)}>
                           <div className="blockeditor-icon" >
                              <FaPlus size={12} color="#9da5ae" className="plus-icon" />
                           </div>
                        </div>
                     ) : item.type === "Heading" ? (
                        <div
                           key={item.id}
                           className={item.action === true ? "blockeditor-heading-element active" : "blockeditor-heading-element"}
                           onClick={() => handleEditItem(item)}
                           onDragOver={(e) => handleInnerItemDragOver(e, item)}
                        >
                           <h1 className="inner-dragger"  >This is a heading</h1>
                           {activeDropZone === item.id && (
                              <div className="blockeditor-inner-dropper" onDrop={(e) => handleInnerDrop(e, item.id)}></div>
                           )}
                        </div>
                     ) : item.type === "TextEditor" ? (
                        <div
                           key={item.id}
                           className={item.action === true ? "blockeditor-text-editor-element active" : "blockeditor-text-editor-element"}
                           onClick={() => handleEditItem(item)}
                           onDragOver={(e) => handleInnerItemDragOver(e, item)}
                        >
                           <p className="inner-dragger">This is sample Paragraph</p>
                           {activeDropZone === item.id && (
                              <div className="blockeditor-inner-dropper" onDrop={(e) => handleInnerDrop(e, item.id)}></div>
                           )}
                        </div>
                     ) : (
                        <div className="blockeditor-first-add" onDrop={(e) => handleInnerDrop(e, item.id)}>
                           <div className="blockeditor-icon" >
                              <FaPlus size={12} color="#9da5ae" className="plus-icon" />
                           </div>
                        </div>
                     )

                  }
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
