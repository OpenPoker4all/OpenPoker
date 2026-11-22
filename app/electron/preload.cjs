const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ggDesktop', {
  openFunGame: (url) => ipcRenderer.invoke('gamingo:open',url),
  closeFunGame: () => ipcRenderer.invoke('gamingo:close'),
  close: () => ipcRenderer.invoke('win:close'),
  minimize: () => ipcRenderer.invoke('win:minimize'),
  maximize: () => ipcRenderer.invoke('win:maximize'),
  isMaximized: () => ipcRenderer.invoke('win:isMaximized'),
  updateStatus: () => ipcRenderer.invoke('update:status'),
  applyUpdate: () => ipcRenderer.invoke('update:apply'),
  platform: (typeof process !== 'undefined' && process.platform) || 'darwin',
});
