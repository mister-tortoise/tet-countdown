
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { Solar } = require('lunar-javascript');

function getTetTimestamp(year) {
    const start = new Date(year, 0, 20);
    const end = new Date(year, 1, 26);

    for (
        let date = new Date(start);
        date <= end;
        date.setDate(date.getDate() + 1)
    ) {
        const lunar = Solar.fromYmd(
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
        ).getLunar();

        if (lunar.getMonth() === 1 && lunar.getDay() === 1) {
            return new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
            ).getTime();
        }
    }

    throw new Error(`Cannot find Lunar New Year for ${year}`);
}

function getNextTetTimestamp() {
    const now = new Date();

    for (
        let year = now.getFullYear();
        year <= now.getFullYear() + 2;
        year++
    ) {
        const timestamp = getTetTimestamp(year);

        if (timestamp > now.getTime()) {
            return timestamp;
        }
    }

    throw new Error('Cannot find the next Lunar New Year');
}

function createWindow() {
    const win = new BrowserWindow({
        width: 370,
        height: 530,
        minWidth: 340,
        minHeight: 500,
        resizable: true,
        frame: false,
        transparent: false,
        alwaysOnTop: true,
        autoHideMenuBar: true,
        backgroundColor: '#6f1018',
        show: false,
        icon: path.join(__dirname,'build', 'icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadFile('index.html');

    win.once('ready-to-show', () => {
        win.show();
        win.setAlwaysOnTop(true, 'floating');
    });

    // Chỉ đăng ký tự khởi động khi ứng dụng đã được cài đặt.
    if (app.isPackaged) {
        app.setLoginItemSettings({
            openAtLogin: true
        });
    }
}

ipcMain.on('window:minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize();
});

ipcMain.on('window:close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close();
});

ipcMain.handle('tet:get-next-timestamp', getNextTetTimestamp);

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    app.quit();
});
