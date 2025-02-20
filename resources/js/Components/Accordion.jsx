import React, { useState } from 'react';

const Accordion = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleItem = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const items = [
    { title: 'Item 1', content: 'This is the content for item 1' },
    { title: 'Item 2', content: 'This is the content for item 2' },
    { title: 'Item 3', content: 'This is the content for item 3' },
  ];

  return (
    <div className="accordion">
      {items.map((item, index) => (
        <div className="card mb-4">
            <div className="card-body">
                <div key={index} className="accordion-item">
                <div className="accordion-header" onClick={() => toggleItem(index)}>
                    <h3>{item.title}</h3>
                </div>
                {activeIndex === index && (
                    <div className="accordion-content">
                    <p>{item.content}</p>
                    </div>
                )}
                </div>
            </div>
        </div>
      ))}
    </div>
  );
};

export default Accordion;
