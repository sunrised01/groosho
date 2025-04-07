// resources/js/redux/actions.jsx
export const setWidgets = (widgets) => ({
    type: 'SET_WIDGETS',
    payload: widgets,
});

export const setActiveDevice = (device) => ({
    type: 'SET_ACTIVE_DEVICE',
    payload: device,
});

export const setEditWidgetData = (data) => ({
    type: 'SET_EDIT_WIDGET_DATA',
    payload: data,
});

export const setSelectedGridLayout = (layout) => ({
    type: 'SET_SELECTED_GRID_LAYOUT',
    payload: layout,
});
