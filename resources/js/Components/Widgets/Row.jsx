import React, { useState, useEffect } from 'react';
import { FaRegWindowMaximize, FaPaintBrush, FaCog, FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function Row({ widget, updateWidget, activeDevice }) {
   const [widgetId, setWidgetId] = useState(widget.id);
   console.log('widget', widget);
   useEffect(() => {
      setWidgetId(widget.id);
  }, [widget.id]);
  

   const [activeTab, setActiveTab] = useState('Layout');
   const [activeSections, setActiveSections] = useState({
         'tb-container': true,
   });
   const [layoutFieldsData, setLayoutFieldsData] = useState({
      [widgetId]: {
         content_Width: "full",  
         width: "",              
         height: "",   
         width_unit: "%",   
         height_unit: "px",   
         mobile_width: "",              
         mobile_height: "",
         tablet_width: "",             
         tablet_height: "",    
         mobile_width_unit: "%",   
         mobile_height_unit: "px",   
         tablet_width_unit: "%",   
         tablet_height_unit: "px",   
     },            
   });

   // Handle input change for layout fields
   const handleLayoutInputChange = (e) => {
      const { name, value } = e.target;

      setLayoutFieldsData(prevState => {
         const newLayoutFieldsData = {
            ...prevState,
            [widgetId]: {
               ...prevState[widgetId],
               [name]: value
            }
         };
         updateWidget({ ...widget, layout_fields: newLayoutFieldsData[widgetId] });

         return newLayoutFieldsData;
      });
   };

   // Handle select change for layout fields (like units)
   const handleLayoutSelectChange = (e) => {
      const { name, value } = e.target;

      setLayoutFieldsData(prevState => {
         const newLayoutFieldsData = {
            ...prevState,
            [widgetId]: {
               ...prevState[widgetId],
               [name]: value
            }
         };
         updateWidget({ ...widget, layout_fields: newLayoutFieldsData[widgetId] });

         return newLayoutFieldsData;
      });
   };

  // Toggle a specific section's state (open/close)
  const toggleItem = (index) => {
      setActiveSections(prevState => ({
         ...prevState,
         [index]: !prevState[index],
      }));
   };
   
   const renderTabContent = () => {
      switch (activeTab) {
        case 'Layout':
          return <div className="widgets-content">
               <div key="tb-container" className="accordion-item m-0">
                     <div className="accordion-header d-flex justify-content-start align-items-center" onClick={() => toggleItem("tb-container")}>
                        <h3>Container</h3>
                        {activeSections["tb-container"] ? (
                           <FaChevronUp className="ms-2" />
                        ) : (
                           <FaChevronDown className="ms-2" />
                        )}
                     </div>
                     <hr className="m-0" />
                     {activeSections["tb-container"] && (
                        <div className="accordion-content ">
                           <div className="mb-4 d-flex justify-content-between align-items-center">
                              <label className="col-form-label me-8">Content Width</label>
                              <select className="form-select" name="content_Width" value={layoutFieldsData[widgetId]?.content_Width || "full"} onChange={handleLayoutSelectChange}>
                                 <option value="box">Box</option>
                                 <option value="full">Full With</option>
                              </select>
                           </div>
                           <div className="mb-4 d-flex justify-content-between align-items-center">
                              <label className="col-form-label me-10">Width</label>
                              {activeDevice === 'Desktop' ? (
                                 <div className="d-flex justify-content-between align-items-center">
                                    <input className="form-control me-1" type="number" placeholder="100" min="1" max="100" step="1" name="width" value={layoutFieldsData[widgetId]?.width || ""} onChange={handleLayoutInputChange} />
                                    <select
                                       className="form-select unit-field"
                                       name="width_unit"
                                       value={layoutFieldsData[widgetId]?.width_unit || "%"}
                                       onChange={handleLayoutInputChange} 
                                    >
                                       <option value="%">%</option>
                                       <option value="px">px</option>
                                       <option value="em">em</option>
                                       <option value="rem">rem</option>
                                    </select>
                                 </div>
                              ) : activeDevice === 'Tablet' ? (
                                 <div className="d-flex justify-content-between align-items-center">
                                    <input className="form-control me-1" type="number" placeholder="100" min="1" max="100" step="1" name="tablet_width" value={layoutFieldsData[widgetId]?.tablet_width || ""} onChange={handleLayoutInputChange} />
                                    <select
                                       className="form-select unit-field"
                                       name="tablet_width_unit"
                                       value={layoutFieldsData[widgetId]?.tablet_width_unit || "%"}
                                       onChange={handleLayoutInputChange} 
                                    >
                                       <option value="%">%</option>
                                       <option value="px">px</option>
                                       <option value="em">em</option>
                                       <option value="rem">rem</option>
                                    </select>
                                 </div>
                              ) : 
                                 <div className="d-flex justify-content-between align-items-center">
                                    <input className="form-control me-1" type="number" placeholder="100" min="1" max="100" step="1" name="mobile_width" value={layoutFieldsData[widgetId].mobile_width || ""} onChange={handleLayoutInputChange} />
                                    <select
                                       className="form-select unit-field"
                                       name="mobile_width_unit"
                                       value={layoutFieldsData[widgetId]?.mobile_width_unit || "%"}
                                       onChange={handleLayoutInputChange} 
                                    >
                                       <option value="%">%</option>
                                       <option value="px">px</option>
                                       <option value="em">em</option>
                                       <option value="rem">rem</option>
                                    </select>
                                 </div>
                              }
                           </div>
                           <div className="mb-4 d-flex justify-content-between align-items-center">
                              <label className="col-form-label me-10">Hieght</label>
                              {activeDevice === 'Desktop' ? (
                                 <div className="d-flex justify-content-between align-items-center">
                                    <input className="form-control me-1" type="number" placeholder="100" min="1" max="100" step="1" name="height" value={layoutFieldsData[widgetId]?.height || ""} onChange={handleLayoutInputChange}/>
                                    <select
                                       className="form-select unit-field"
                                       name="height_unit"
                                       value={layoutFieldsData[widgetId]?.height_unit || "px"}
                                       onChange={handleLayoutInputChange}  
                                    >
                                       <option value="%">%</option>
                                       <option value="px">px</option>
                                       <option value="em">em</option>
                                       <option value="rem">rem</option>
                                    </select>
                                 </div>
                              ) : activeDevice === 'Tablet' ? (
                                 <div className="d-flex justify-content-between align-items-center">
                                    <input className="form-control me-1" type="number" placeholder="100" min="1" max="100" step="1" name="tablet_height" value={layoutFieldsData[widgetId]?.tablet_height || ""} onChange={handleLayoutInputChange}/>
                                    <select
                                       className="form-select unit-field"
                                       name="tablet_height_unit"
                                       value={layoutFieldsData[widgetId]?.tablet_height_unit || "px"}
                                       onChange={handleLayoutInputChange}  
                                    >
                                       <option value="%">%</option>
                                       <option value="px">px</option>
                                       <option value="em">em</option>
                                       <option value="rem">rem</option>
                                    </select>
                                 </div>
                              ) : 
                                 <div className="d-flex justify-content-between align-items-center">
                                    <input className="form-control me-1" type="number" placeholder="100" min="1" max="100" step="1" name="mobile_height" value={layoutFieldsData[widgetId]?.mobile_height || ""} onChange={handleLayoutInputChange}/>
                                    <select
                                       className="form-select unit-field"
                                       name="mobile_height_unit"
                                       value={layoutFieldsData[widgetId]?.mobile_height_unit || "px"}
                                       onChange={handleLayoutInputChange}  
                                    >
                                       <option value="%">%</option>
                                       <option value="px">px</option>
                                       <option value="em">em</option>
                                       <option value="rem">rem</option>
                                    </select>
                                 </div>
                              }
                              
                           </div>
                        </div>
                     )}
               </div>
          </div>;
        case 'Style':
          return <div className="widgets-content">Content for Style</div>;
        case 'Advanced':
          return <div className="widgets-content">Content for Advanced</div>;
        default:
          return <div className="widgets-content">Content for Layout</div>;
      }
   };

   return (
      <>
         <header className="editor-widgets-header">
               <h2>Edit Row</h2>
         </header>

         <div className="tab-container">
            
            <div className="tabs">
               <div
                  className={`tab ${activeTab === 'Layout' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Layout')}
               >
                  <FaRegWindowMaximize className="tab-icon" />
                  <span className="tab-text">Layout</span>
               </div>
               <div
                  className={`tab ${activeTab === 'Style' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Style')}
               >
                  <FaPaintBrush className="tab-icon" />
                  <span className="tab-text">Style</span>
               </div>
               <div
                  className={`tab ${activeTab === 'Advanced' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Advanced')}
               >
                  <FaCog className="tab-icon" />
                  <span className="tab-text">Advanced</span>
               </div>
               </div>
               <div className="tab-content">
               {renderTabContent()}
               </div>                                    
         </div>
      </>
   );
}
