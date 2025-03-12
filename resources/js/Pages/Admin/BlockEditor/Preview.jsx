import React, { useState, useEffect } from "react";
import PreviewLayout from '@/Layouts/PreviewLayout';
import Row from '@/Components/Widgets/Row';
import Grid from '@/Components/Widgets/Grid';
import TextEditor from '@/Components/Widgets/TextEditor';
import Heading from '@/Components/Widgets/Heading';
import Image from '@/Components/Widgets/Image';
import Video from '@/Components/Widgets/Video';
import { Head, usePage } from '@inertiajs/react';
import { FaPlus} from "react-icons/fa";


export default function Preview() {
    const { post } = usePage().props;
    const [widgets, setWidgets] = useState([]);

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.origin !== window.location.origin) return; 
            const newWidget = event.data;

            if (newWidget) {
                setWidgets((prevWidgets) => [...prevWidgets, newWidget]);
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);


    const handleRowDrop = (draggedItem, droppedItemId) => {
        console.log('draggedItem', draggedItem);
        
        setWidgets((prevWidgets) => {
            const updatedWidgets = prevWidgets.filter(widget => widget.id !== droppedItemId);
    
            updatedWidgets.push(draggedItem);
    
            return updatedWidgets;
        });
    };
    

    const renderLayout = () => {
        return widgets.map((item) => {
            switch (item.type) {
                case 'Row':
                    return <Row key={item.id} item={item} onDropRowHandler={handleRowDrop} />;
                case 'Grid':
                    return <Grid key={item.id} id={item.id} />;
                case 'TextEditor':
                    return <TextEditor key={item.id} id={item.id} />;
                case 'Heading':
                    return <Heading key={item.id} id={item.id} />;
                case 'Image':
                    return <Image key={item.id} id={item.id} />;
                case 'Video':
                    return <Video key={item.id} id={item.id} />;
                default:
                    return null;
            }
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
                    <div className="blockedidor-title text-center">
                        <p>Drag widget here</p>
                    </div>
                </section>
            </div>
        </PreviewLayout>
    );
}
