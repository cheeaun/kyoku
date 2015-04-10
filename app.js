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

var appTray, contextMenu;
app.on('ready', function(){
  appTray = new Tray(null);
  contextMenu = Menu.buildFromTemplate([
    // { label: 'Album', visible: false, enabled: false },
    // { label: 'Artist', visible: false, enabled: false },
    { label: 'Preferences…', click: showOptions },
    { label: 'Quit', click: app.quit }
  ]);
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
  if (!charsLimit || charsLimit <= 10) return name;
  if (name.length <= charsLimit) return name;
  return name.slice(0, charsLimit) + '…';
};

var currentName = '', currentState = 'paused';
itunes.on('playing', function(data){
  currentState = 'playing';
  currentName = data.name;
  appTray.setTitle('▶ ' + truncateName(currentName) + '  ');

  // TODO: Update Album and Artist menu items (Atom shell doesn't support this yet)
  // var menuItems = contextMenu.items;
  // var albumMenu = menuItems[0];
  // var artistMenu = menuItems[1];
  // if (data.album){
  //   albumMenu.label = 'Album: ' + data.album;
  //   albumMenu.visible = true;
  // } else {
  //   albumMenu.visible = false;
  // }
  // if (data.artist){
  //   artistMenu.label = 'Artist: ' + data.artist;
  //   artistMenu.visible = true;
  // } else {
  //   artistMenu.visible = false;
  // }
});
itunes.on('paused', function(data){
  currentState = 'paused';
  appTray.setTitle(defaultTitle);
});

store.on('change', function(key, value){
  if (key == 'charsLimit' && currentState == 'playing'){
    appTray.setTitle('▶ ' + truncateName(currentName, value) + '  ');
  }
});

app.dock.hide();