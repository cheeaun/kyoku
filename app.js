var app = global.app = require('app');
var Menu = require('menu');
var Tray = require('tray');
var BrowserWindow = require('browser-window');

var userHome = require('user-home');
var TinyStore = require(__dirname + '/tinystore');
var store = global.store = new TinyStore(userHome + '/.kyoku');

var itunes = require('playback');

// Don't quit app when closing any spawned windows
app.on('window-all-closed', function(e){
  e.preventDefault();
});

var defaultTitle = '♫ Kyoku';

var menuTemplate = [
  { label: 'Album', visible: false, enabled: false },
  { label: 'Artist', visible: false, enabled: false },
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
  optionsWindow.loadUrl('file://' + __dirname + '/preferences.html');
  optionsWindow.webContents.on('did-finish-load', function(){
    optionsWindow.show();
  });
};

function truncateName(name, charsLimit){
  if (!charsLimit) charsLimit = store.get('charsLimit');
  if (!charsLimit || charsLimit < 10) return name;
  if (name.length <= charsLimit) return name;
  return name.slice(0, charsLimit) + '…';
};

var currentName = '', currentState = 'paused';

itunes.on('playing', function(data){
  currentState = 'playing';
  currentName = data.name;
  appTray.setTitle('▶ ' + truncateName(currentName) + '  ');

  menuTemplate[0].label = (data.album)  ? 'Album: '  + data.album  : '';
  menuTemplate[1].label = (data.artist)  ? 'Artist: '  + data.artist  : '';

  menuTemplate[0].visible = data.album.length > 0;
  menuTemplate[1].visible = data.artist.length > 0;

  contextMenu = Menu.buildFromTemplate(menuTemplate);

  appTray.setContextMenu(contextMenu);
});

itunes.on('paused', function(data){
  currentState = 'paused';

  menuTemplate[0].visible = menuTemplate[1].visible = false;

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
