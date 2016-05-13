const electron = require('electron');
const app = global.app = electron.app;
const Menu = electron.Menu;
const Tray = electron.Tray;
const BrowserWindow = electron.BrowserWindow;

const userHome = require('user-home');
const TinyStore = require(__dirname + '/tinystore');
const store = global.store = new TinyStore(userHome + '/.kyoku');

const itunes = require(__dirname + '/itunes');

// Don't quit app when closing any spawned windows
app.on('window-all-closed', function(e){
  e.preventDefault();
});

var defaultTitle = '♫ Kyoku';

var menuTemplate = [
  { label: 'Name', visible: false, enabled: false },
  { label: 'Artist', visible: false, enabled: false },
  { label: 'Album', visible: false, enabled: false },
  { label: 'Preferences…', click: showOptions },
  { label: 'Quit', click: app.quit }
];

var appTray, contextMenu;
app.on('ready', function(){
  appTray = new Tray(null);
  contextMenu = Menu.buildFromTemplate(menuTemplate);
  appTray.setTitle(defaultTitle);
  appTray.setContextMenu(contextMenu);
});

function showOptions(){
  var optionsWindow = new BrowserWindow({
    width: 400,
    height: 200,
    show: false,
    center: true,
    resizable: false,
    fullscreen: false,
    'always-on-top': true,
    title: 'Preferences'
  });
  optionsWindow.loadURL('file://' + __dirname + '/preferences.html');
  optionsWindow.webContents.on('did-finish-load', function(){
    optionsWindow.show();
  });
};

function truncateName(name, charsLimit){
  if (!charsLimit) charsLimit = store.get('charsLimit') || 10;
  if (!charsLimit || charsLimit < 5) return name;
  if (name.length <= charsLimit) return name;
  return name.slice(0, charsLimit) + '…';
};

var currentName = '', currentState = 'paused';

itunes.on('playing', function(data){
  currentState = 'playing';
  currentName = data.name;
  appTray.setTitle('▶ ' + truncateName(currentName) + '  ');

  menuTemplate[0].label = 'Name: ' + data.name;
  menuTemplate[1].label = (data.artist) ? 'Artist: ' + data.artist : '';
  menuTemplate[2].label = (data.album) ? 'Album: ' + data.album : '';

  menuTemplate[0].visible = true;
  menuTemplate[1].visible = data.artist.length > 0;
  menuTemplate[2].visible = data.album.length > 0;

  contextMenu = Menu.buildFromTemplate(menuTemplate);

  appTray.setContextMenu(contextMenu);
});

itunes.on('paused', function(data){
  currentState = 'paused';

  menuTemplate[0].visible = menuTemplate[1].visible = menuTemplate[2].visible = false;

  contextMenu = Menu.buildFromTemplate(menuTemplate);

  appTray.setTitle(defaultTitle);
  appTray.setContextMenu(contextMenu);
});

store.on('change', function(key, value){
  if (key == 'charsLimit' && currentState == 'playing'){
    appTray.setTitle('▶ ' + truncateName(currentName, value) + '  ');
  }
});

app.dock.hide();
