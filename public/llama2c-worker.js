self.addEventListener('message', async function(e){
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(function() {
        console.log('Service Worker 注册成功');
    });
    }
  var pageDirectory = self.location.href.substr(0, self.location.href.lastIndexOf('/'));
  var wasiModule = await import('./vendor/wasi.js');
  var WASIJS = wasiModule.WASI;
  var WASIContext = wasiModule.WASIContext;

  var context;
  var result;
function fetchFile(url) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = function() {
            if (xhr.status === 200) {
                resolve(xhr.response);
            } else {
                reject(new Error('Failed to fetch ' + url + ': ' + xhr.status));
            }
        };

        xhr.onerror = function() {
            reject(new Error('Network error occurred while fetching ' + url));
        };

        xhr.send();
    });
}
  // Initialize WASM memory.
  var wasmMemory = new WebAssembly.Memory({initial:32, maximum: 10000});
  var wasmImports = {
    JS: {},
    env: {memory: wasmMemory, table: new WebAssembly.Table({initial: 2, element: 'anyfunc'})},
  };
  var fileRequest = await fetchFile('tokenizer.bin');
  //var fileRequest = await fetch("https://github.com/xqy2006/chatxu-story/releases/download/0.0.1/tokenizer.bin");
  var fileContent = fileRequest;

  var modelURL =  'model.bin';


  var modelFileRequest = await fetchFile(modelURL);


  var contentLength = String(Number(339009820));

  var responseSize = 0;
  let chunksAll = modelFileRequest;


  var output = '';

  context = new WASIContext({
    args: ['run', 'model.bin', '-i', '标题：'+e.data, '-t',0.8,'-n',0],
    stdout: function (out) { 
              console.log(out)
              output += out;
              self.postMessage({
                eventType: "STDOUT",
                eventData: out
              });
            },
    stderr: function (err) {
      self.postMessage({
        eventType: "STDERR",
        eventData: err
      }); 
      console.error('stderr', err); 
    },
    stdin: () => prompt('stdin:'),
    fs: {
      '/model.bin': {
        path: modelFileRequest.name,
        timestamps: {
          change: new Date(2024,6,24),
          access: new Date(2024,6,24),
          modification: new Date(2024,6,24),
        },
        mode: 'binary',
        content: new Uint8Array(chunksAll),
      },
      '/tokenizer.bin': {
        path: 'tokenizer.bin',
        timestamps: {
          change: new Date(2024,6,24),
          access: new Date(2024,6,24),
          modification: new Date(2024,6,24),
        },
        mode: 'binary',
        content: new Uint8Array(fileContent),
      }
    }
  });

  function isLocalhost() {
    var url = self.location.origin;  
    return url.indexOf('127.0.0.1') !== -1 || url.indexOf('localhost') !== -1;
  }
var wasmfile = await fetchFile('llama2c.wasm')
  result = await WASIJS.start(wasmfile, context, wasmImports);
})
