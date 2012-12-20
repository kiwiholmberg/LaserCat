function isIpodSafari() {
    var ua = navigator.userAgent.match(/iP/);
    return (ua == null) ? false : true;
}

var SocketClient = function(){
    var self = this
    this.connectionString = "ws://10.10.10.212:8888/lasercontroller"
    this.socket = new WebSocket(this.connectionString)
    this.sendable = false
    this.socket.onmessage = function (evt) {
        if(evt.data == "ok") {
            self.sendable = true;
        } else {
            self.sendable = false;
        }
    }
    this.send = function(json){
        self.socket.send(JSON.stringify(json))
    }
}

var Painter = function(){
    var self = this
    this.canvas = document.getElementById("sketch_canvas")
    this.enabled = true
    this.currently_drawing = false
    this.isMobile = isIpodSafari()
    this.ctx = this.canvas.getContext('2d')
    this.pX = []
    this.pY = []
    this.sequence = ''
    this.isDrag = []
    this.record = []
    this.is_recording = false
    this.recording = []

    this.turnOnOff = function(){
        self.enabled = !self.enabled
        
        _socket_client.send({value: self.enabled ? 'on' : 'off' })
    }

    this.addPoint = function(x,y, dragging){
        self.pX.push(x)
        self.pY.push(y)
        self.isDrag.push(dragging)
        if (self.is_recording) {
            self.recording.push([x,y])
            console.log([x,y])
        }
    }

    this.render = function(){
        self.ctx.strokeStyle = "#ff0000";
        self.ctx.lineJoin = "round";
        self.ctx.lineWidth = 5;
        var ppX, ppY;
        for(var i = 0; i < self.pX.length; i++) {
            self.ctx.beginPath();
            if(self.isDrag[i] && i > 0) {
                ppX = self.pX[i-1];
                ppY = self.pY[i-1];
            } else {
                ppX = self.pX[i] - 1;
                ppY = self.pY[i];
            }
            self.ctx.moveTo(ppX, ppY);
            self.ctx.lineTo(self.pX[i], self.pY[i]);
            if(ppX >= 0 && ppX <= 540 && ppY >= 0 && ppY <= 540) {
                //Reversing axis and divide
                ppX = Math.round((540-ppX)/3)
                ppY = Math.round((540-ppY)/3)
                self.sequence += ppX + "w" + ppY + "s";
            }
            self.ctx.closePath();
            self.ctx.stroke();
        }
        if(_socket_client.sendable) {
            _socket_client.send({value:self.sequence + "."})
            self.sequence = "";
            _socket_client.sendable = false;
        }
        self.pX = []
        self.pY = []
    }
    
    this.handleMove = function(e){
        e.preventDefault()
        if (self.isMobile) e = e.targetTouches[0]
        if (self.currently_drawing) {
            self.addPoint(e.pageX, e.pageY, true)
            self.render()
        }
    }
    this.handleDown = function(e){
        e.preventDefault()
        if(self.isMobile) e = e.targetTouches[0]
        self.currently_drawing = true
        self.addPoint(e.pageX, e.pageY, false)
        self.render()
    }
    this.handleUp = function(e){
        self.currently_drawing = false
    }
    
    this.addListeners = function(){
        self.canvas.addEventListener("mousemove",  self.handleMove, false)
        self.canvas.addEventListener("touchmove",  self.handleMove, false)
        self.canvas.addEventListener("mouseup",    self.handleUp, false)
        self.canvas.addEventListener("touchend",   self.handleUp, false)
        self.canvas.addEventListener("mousedown",  self.handleDown, false)
        self.canvas.addEventListener("touchstart", self.handleDown, false)
    }
    
    this.startRecord = function(){
        self.is_recording = true
        self.recording = []
        self.clear()
    }
    
    this.stopRecord = function() {
        self.is_recording = false
    }
    
    this.saveRecording = function(){
        console.log("saving")
        console.log(self.recording)
        localStorage.recording = JSON.stringify(self.recording)
    }
    this.loadRecording = function(){
        self.stopRecord()
        self.clear()
        recording = eval(localStorage.recording)
        
        self.remaining = recording
        self.drawFromMemory()
    }
    
    
    this.drawFromMemory = function () {
        var first = self.remaining.shift()
        
        self.addPoint(first[0], first[1], false)
        if (self.remaining.length < 1) return false
        self.render()
        
        setTimeout(self.drawFromMemory, 1)
    } 
    
    
    this.clear = function(){
        self.ctx.save();
        self.ctx.setTransform(1, 0, 0, 1, 0, 0);
        self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
        self.ctx.restore();
    }
    
    
    this.init = function(){
        self.addListeners()
    }
    this.init()
}

var _socket_client = new SocketClient()
var _painter = new Painter()
var _gui = new dat.GUI()

window.onload = function() {
  _gui.add(_painter, 'turnOnOff')
  _gui.add(_painter, 'enabled').listen()
  _gui.add(_painter, 'startRecord')
  _gui.add(_painter, 'stopRecord')
  _gui.add(_painter, 'saveRecording')
  _gui.add(_painter, 'loadRecording')
  _gui.add(_painter, 'clear')
  
  
//  gui.add(text, 'speed', -5, 5);
//  gui.add(text, 'displayOutline');
//  gui.add(text, 'explode');
};




