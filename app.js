var app = require('app');
var Menu = require('menu');
var Tray = require('tray');
var BrowserWindow = require('browser-window');

var defaultTitle = '♫ Kyoku';

var appTray, contextMenu;
app.on('ready', function(){
  appTray = new Tray(null);
  contextMenu = Menu.buildFromTemplate([
    // { label: 'Album', visible: false, enabled: false },
    // { label: 'Artist', visible: false, enabled: false },
    // { label: 'Preferences…', click: showOptions },
    { label: 'Quit', click: app.quit }
  ]);
  appTray.setTitle(defaultTitle);
  appTray.setContextMenu(contextMenu);

  var optionsWindow = new BrowserWindow({
    width: 400,
    height: 300,
    show: false,
    center: true,
    resizable: false,
    fullscreen: false,
    'always-on-top': true,
    title: 'Preferences'
  });
  optionsWindow.loadUrl('file://' + __dirname + '/options.html');

  function showOptions(){
    optionsWindow.show();
  };
});

var itunes = require('playback');
itunes.on('playing', function(data){
  appTray.setTitle('▶ ' + data.name);

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
  appTray.setTitle(defaultTitle);
});

app.dock.hide();
