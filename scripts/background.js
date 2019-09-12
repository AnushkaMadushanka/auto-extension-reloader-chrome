import io from 'socket.io-client'

const SOCKET_IO_PORT = '8890';

export default class Background {
  constructor() {
    chrome.browserAction.setIcon({
      path : chrome.extension.getURL("public/images/default_icon/6.ico")
    });
    chrome.storage.local.get(['port'], (result)=>{
      if(!result.port)
        chrome.storage.local.set({ port: SOCKET_IO_PORT } )
      this.initiateSocket(result.port ? result.port : SOCKET_IO_PORT)
      console.log("SocketWorks")
    })
    console.log(chrome.runtime)
    this.loadingTimer = 1
    this.loadingTimerChange = this.loadingTimerChange.bind(this)
  }

  initiateSocket(port){
    this.socket = io('http://localhost:' + port);


    this.socket.on('build.start', (extensionId) => {
      console.log('Start: '+extensionId)
      chrome.management.get(extensionId, (info) => {
        this.createBasicNotification(info.name, "Build Started", 
        info.icons ? info.icons.sort((a,b)=>b.size - a.size)[0].url : chrome.extension.getURL("public/images/default_icon/6.ico"))
      })
      this.loadingTimerInterval = setInterval(this.loadingTimerChange, 500)
    });


    this.socket.on('build.end', (extensionId) => {
      console.log('End: '+extensionId)
      chrome.management.get(extensionId, (info) => {
        this.createBasicNotification(info.name, "Build Finished", 
        info.icons ? info.icons.sort((a,b)=>b.size - a.size)[0].url : chrome.extension.getURL("public/images/default_icon/6.ico"))
      })
      chrome.storage.local.get(['reloadAllDevExtensionsOnBuild', 'reloadAllTabsOnBuild'], (result)=>{
        if(result.reloadAllDevExtensionsOnBuild)
          this.reloadAllDevExtensions()
        else
          this.reloadExtensionUsingId(extensionId)
            .then(() => { }).catch((ex) => { console.log(ex) })

        if(result.reloadAllTabsOnBuild){
          this.reloadAllOpenTabs()
        }
      })
      clearInterval(this.loadingTimerInterval)
      chrome.browserAction.setIcon({
        path : chrome.extension.getURL("public/images/default_icon/6.ico")
      });
    });
  }

  loadingTimerChange() {
    this.loadingTimer += 1
    if(this.loadingTimer > 8)
      this.loadingTimer = 1
    chrome.browserAction.setIcon({
      path : chrome.extension.getURL(`public/images/rotation/loading_${this.loadingTimer}.png`)
    });
  }

  getAllExtensions(){
    return new Promise((resolve, reject) => {
      try {
        chrome.management.getAll(extensions => { resolve(extensions.filter(ext => !ext.isApp)) })
      } catch (ex) {
        reject(ex)
      }
    })
  }

  reloadAllOpenTabs() {
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs.reload(tab.id)
      }
    })
  }

  async reloadAllDevExtensions() {
    var extensions = await this.getAllExtensions()
    for (var i = 0; i < extensions.length; i++) {
      const extension = extensions[i];
      if (!extension.enabled
        || extension.id == chrome.runtime.id)
        continue;
      this.reloadExtensionUsingId(extension.id)
      console.log(extension.id)
    }
  }

  async reloadExtensionUsingId(extensionId) {
    await this.setExtensionState(extensionId, false)
    await this.setExtensionState(extensionId, true)
  }

  async setExtensionState(extensionId, isActive) {
    await new Promise((resolve, reject) => {
      try {
        chrome.management.setEnabled(extensionId, isActive, () => { resolve() })
      } catch (ex) {
        reject(ex)
      }
    })
  }

  createBasicNotification(message, title, icon) {
    const options = {
      type: 'basic',
      title,
      message,
      priority: 0,
      iconUrl: icon
    }

    chrome.notifications.create(new Date().getTime().toString(), options, () => { })
  }
}

if (!window.backgroundPage && !window.document.title) {
  const background = new Background()
  window.backgroundPage = background
}


