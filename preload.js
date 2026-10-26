
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('tetApi', {
    getNextTetTimestamp: () => ipcRenderer.invoke('tet:get-next-timestamp'),
    minimize: () => ipcRenderer.send('window:minimize'),
    close: () => ipcRenderer.send('window:close')
});
