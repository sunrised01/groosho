import React, { useState, useEffect } from "react";
import PreviewLayout from '@/Layouts/PreviewLayout';
import PreviewContent from '@/Components/Admin/PreviewContent';
import { Head, usePage } from '@inertiajs/react';
import { FaPlus} from "react-icons/fa";


export default function Preview() {
    const { post } = usePage().props;
    const [widgets, setWidgets] = useState([]);
    const [editWidget, setEditWidget] = useState(null);

    useEffect(() => {
        window.parent.postMessage(editWidget, '*');

        const handleMessage = (event) => {
            if (event.origin !== window.location.origin) return; 
    
            const newWidget = event.data;
    
            if (newWidget) {
                setWidgets((prevWidgets) => {
                    const oldWidgets = [...prevWidgets];
                    updateActionToFalse(oldWidgets);
                    return [...oldWidgets, newWidget];
                });
            }
        };
    
        window.addEventListener('message', handleMessage);
    
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    });
    


    const handleRowDrop = (updatedWidgets) => { 
        setWidgets(updatedWidgets);
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

    const handleEditAction = (widgetItem) => {
        setEditWidget(widgetItem);
     }
    
    const renderLayout = () => {
        return widgets.map((item) => {
            return <PreviewContent key={item.id} item={item} widgets={widgets} onDropRowHandler={handleRowDrop} onEditActionHandler={handleEditAction} />;
        });
        
    };
    
    return (
        <PreviewLayout>
            <Head title={post.title} />
            <div className="full-container">
                <div className="content">
                    {renderLayout()}
                </div>

                <section className="blockedidor-add-row-section">
                    <div className="plus-icon-container">
                        <FaPlus size={30} className="plus-icon" />
                    </div>
                    <div
                        className={`drop-zone`}
                    >
                        Drop here to add widget
                    </div>
                </section>
            </div>
        </PreviewLayout>
    );
}
