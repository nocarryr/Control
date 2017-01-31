Control.Slider = function(ctx, props) {
    this.make(ctx, props);
	this.ctx = ctx;
	
	if(typeof props.isVertical != "undefined")
        this.isVertical = props.isVertical;
    else
        this.isVertical = (this.width < this.height);
    
    this.form.isVertical = "vertical slider";
    
	this.requiresTouchDown = (typeof props.requiresTouchDown != "undefined") ? props.requiresTouchDown : true;
	
	this.isXFader = (typeof props.isXFader != "undefined") ? props.isXFader : false;
	
	this.shouldUseCanvas = (typeof props.shouldUseCanvas != "undefined") ? props.shouldUseCanvas : false;

	this.fillDiv = null;
    this.container = null;
    
    this.prevValue = this.value;
	
	this.pixelWidth  = 1 / Control.deviceWidth;
	this.pixelHeight = 1 / Control.deviceHeight;

	if(!this.shouldUseCanvas) {
        this.container = document.createElement("div");
        $(this.container).css({
                            "position": "absolute", 
                            "width": this.width - 2 +  "px",
                            "height": this.height - 2 + "px", 
                            "left": this.x + "px", 
                            "top": this.y + "px",
                            "background-color": this.backgroundColor,
                            "border": "1px solid " + this.strokeColor, 
                            "z-index": 1,
                            });
        $(this.container).addClass('widget slider_stroke');

		this.fillDiv   = document.createElement("div");

		$(this.fillDiv).css({
			"position": "relative", 
			"width": "100%",    // this.width - 2 + "px",
			"height": "100%",   // + "px", 
            "background-color": this.fillColor,
			"z-index": 10,

		});
        $(this.fillDiv).addClass('widget slider_fill'); 

        if(this.isVertical) {
            this.fillDiv.style.webkitTransformOriginY = "100%";
        }else if(!this.isXFader) {
            this.fillDiv.style.webkitTransformOriginX = "0";
        }
        
		$(this.container).append(this.fillDiv);
        
	}else{
		this.canvas = document.createElement('canvas');
		$(this.canvas).addClass('widget Control.Slider');

		this.canvas.width = this.width;						// DO NOT USE STYLES TO RESIZE CANVAS OBJECT
		this.canvas.height = this.height;					// DO NOT USE STYLES TO RESIZE CANVAS OBJECT
		this.ctx.appendChild(this.canvas);

		$(this.canvas).css({
			"border" : "1px solid #fff",
			"top" 	 : this.y + "px",
			"left" 	 : this.x + "px",
			"position" : "absolute",
		});

		this.canvasCtx = this.canvas.getContext('2d');   
	}

    $(this.ctx).append(this.container);
    this.container.widget = this;
    this.fillDiv.widget = this;

	this.displayValue = props.displayValue;
	
	if(typeof props.label != "undefined" || props.displayValue == true) {
	    this.text = props.label || this.value;
	    this.labelSize = props.labelSize || 12;
//
//	    {   //remove for canvas
//			var _width, _height, _x, _y;
//			if(this.isVertical) {
//				_width = props.width - (8 / Control.deviceWidth);
//				_height =  (this.labelSize + 4) / Control.deviceHeight;
//				_x = props.x;
//				_y = props.y + props.height - _height;
//			}else{
//				_width = (props.width / 3) - (8 / Control.deviceWidth);
//				_height = (this.labelSize + 4) / Control.deviceHeight;
//				_x = props.x + (props.width / 2) - ((props.width / 3) / 2);
//				_y = props.y + props.height - _height;
//			}
//			
//	        this.label = {
//				"name":   this.name + "Label",
//				"type":   "Label",
//				"bounds": [_x, _y, _width, _height],
//				"color":  this.strokeColor, 
//				"backgroundColor": "rgba(127, 127, 127, .75)",
//				"value": this.text,
//				"size":  props.labelSize || 12, 
//			 };
//                        
//	        var _w = Control.makeWidget(this.label);
//	        if(!Control.isAddingConstants)
//	            Control.addWidget(_w, Control.addingPage);
//	        else
//	            Control.addConstantWidget(_w);
//            
//	        this.label = _w;
//			$(this.label.label).css("padding", "0px 4px 0px 4px");
//		}
	}

	if(this.isXFader) {
		this.xFaderWidth = 50;
		if(!this.shouldUseCanvas) {
			this.fillDiv.style.width = this.xFaderWidth + "px";
			this.fillDiv.style.left = (this.value * this.width) + 1 + "px";
		}
	}
    
    this.events = { 
        "touchstart": Control.Slider.prototype.touchstart, 
        "touchmove" : Control.Slider.prototype.touchmove, 
        "touchend"  : Control.Slider.prototype.touchend,
    };
	
    return this;
}

Control.Slider.prototype = new Widget();

Control.Slider.prototype.touchstart = function(touch) {
    if(this.hitTest(touch.pageX, touch.pageY)) {
        this.activeTouches.push(touch.identifier);
        if(this.isVertical) {
            this.changeValue(touch.pageY); 
        }else{
            this.changeValue(touch.pageX); 
        }
		
        if(this.ontouchstart != null) {
            if(typeof this.ontouchstart === "string") {
                eval(this.ontouchstart);
            }else{
                this.ontouchstart(touch);
            }
        }
        
		return true;
    }
	return false;
};

Control.Slider.prototype.touchmove = function(touch) {       
    var shouldChange = false;
 	var touchNumber = -1;
	
    for(var i = 0; i < this.activeTouches.length; i++) {
        if(touch.identifier == this.activeTouches[i]){
			touchNumber = i;
            shouldChange = true;
            break;
        }
    }
    
    if(!this.requiresTouchDown) {
        shouldChange = true;
    }
    
    var isHit = this.hitTest(touch.pageX, touch.pageY);
    if(shouldChange) {
		if(isHit) {
			if(this.isVertical) {
				this.changeValue(touch.pageY); 
	        }else{
	        	this.changeValue(touch.pageX); 
	        }
						
            if(this.ontouchmove != null) {
                if(typeof this.ontouchmove === "string") {
                    eval(this.ontouchmove);
                }else{
                    this.ontouchmove(touch);
                }
            }

			if(this.displayValue) { this.label.setValue(this.value); }

	        return true;
		}else{
			if(touchNumber != -1) { this.activeTouches.splice(touchNumber, 1); }	
		}
    }
	return false;
};

Control.Slider.prototype.touchend = function(touch) {
    if(this.activeTouches.length > 0) {
        for(var i = 0; i < this.activeTouches.length; i++) {
            if(touch.identifier == this.activeTouches[i]) {
                this.activeTouches.splice(i,1);	// remove touch ID from array
                if(this.ontouchend != null) {
                    if(typeof this.ontouchend === "string") {
                        eval(this.ontouchend);
                    }else{
                        this.ontouchend(touch);
                    }
                }
                
				return true;
            }
        }
    }
	return false;
};

Control.Slider.prototype.events = { 
    "touchstart": Control.Slider.prototype.touchstart, 
    "touchmove" : Control.Slider.prototype.touchmove, 
    "touchend"  : Control.Slider.prototype.touchend,
};
    
Control.Slider.prototype.event = function(event) {
    for (var j = 0; j < event.changedTouches.length; j++){
        var touch = event.changedTouches.item(j);
		this.processingTouch = touch;
		var breakCheck = this.events[event.type].call(this, touch);
		
        if(breakCheck) break;
    }
};

Control.Slider.prototype.changeValue = function(val) { 
    this.prevValue = this.value;
    if(!this.isVertical) {
        this.value = 1 - ((this.x + this.width) - val) / (this.width);
    }else{
        this.value = (((this.y + (this.height - 1)) - val) / (this.height - 1)); 
    }

    this.setValue( this.min + ( this.value * ( this.max - this.min ) ) );
}

Control.Slider.prototype.multiOutput = function() {
    var pressure;
    if(this.sendPressure) {
        var pressureID = this.processingTouch.pageX + ":" + this.processingTouch.pageY;
        pressure = Control.pressures[pressureID];
        pressure = (pressure - this.pressureMin) / this.pressureRange;
        if(pressure > 1) {
            pressure = 1;
        }else if(pressure < 0) {
            pressure = 0;
        }
    }
    
    if (!this.isLocal && Control.protocol == "OSC") {
        var valueString = "|" + this.address;
        valueString += ":" + this.childID + "," + this.value;
        
        if(this.sendPressure) {
            valueString += "," + pressure;
        }
        
        Control.valuesString += valueString;
    } else if (!this.isLocal && Control.protocol == "MIDI") {
        var valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + this.midiNumber + "," + Math.round(this.value);
        Control.valuesString += valueString;
    }
}

Control.Slider.prototype.draw = function() {
    var range = this.max - this.min;
    var percent = (this.value + (0 - this.min)) / range;
    var prevPercent = (this.prevValue + (0 - this.min)) / range;
    if(percent > 1) percent = 1;
    if(!this.shouldUseCanvas) {
        if(!this.isVertical) {
            if(!this.isXFader) {
                //this.fillDiv.style["WebkitTransform"] = "scale3d(" + percent + ", 1, 1)";
                //this.fillDiv.style.width = ((this.width - 1) * percent) + "px";

                this.fillDiv.style.webkitTransform = "scale3d(" + percent + ", 1, 1 )"; 
            }else{
                this.fillDiv.style.webkitTransform = "translate3d("+ (percent * (this.width - this.xFaderWidth)) + "px, 0, 0)";
                //this.fillDiv.style.left = (this.x  + (percent * (this.width - this.xFaderWidth))) + "px";
            }
        }else{
            this.fillDiv.style.webkitTransform = "scale3d(1, " + percent  + ", 1)"; 
            //this.fillDiv.style.height = Math.ceil(((this.height - 2) * percent )) + "px";
            //this.fillDiv.style.top = this.y + ((this.height - 1) - (percent * (this.height - 2))) + "px";
        }
    }else{
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);    
        
        this.ctx.fillStyle = this.fillColor;
        
        if(this.isVertical) {
//                if(this.prevValue > this.value) { // figure out difference and clear, not needed if value is greater as prev area stays filled (should we just fill new area instead of all?)
//                    this.ctx.clearRect(this.x, (this.y + this.height) - (prevPercent * this.height) - 1, this.width,(prevPercent * this.height) - (percent * this.height) + 1);
//                }
            this.ctx.fillRect(this.x, (this.y + this.height) - (percent * this.height), this.width, percent * this.height);
        }else{
            if(this.isXFader) {
                this.ctx.fillRect(this.x  + (percent * (this.width - this.xFaderWidth)), this.y, this.xFaderWidth, this.height);
            }else{
                this.ctx.fillRect(this.x,this.y, this.width * percent, this.height);
            }
        }
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.strokeRect(this.x,this.y, this.width, this.height);
    }
}

Control.Slider.prototype.setColors = function(newColors) {
    this.backgroundColor = newColors[0];
    this.fillColor = newColors[1];
    this.strokeColor = newColors[2];
    
    this.fillDiv.style.backgroundColor = this.fillColor;
    this.container.style.border = "1px solid" + this.strokeColor;
    this.container.style.backgroundColor = this.backgroundColor;
}
    
Control.Slider.prototype.setBounds = function(newBounds) {    
    this.x      = newBounds[0] <= 1 ? Math.round(newBounds[0] * $("#selectedInterface").width())  : newBounds[0];
    this.y      = newBounds[1] <= 1 ? Math.round(newBounds[1] * $("#selectedInterface").height()) : newBounds[1];    
    this.width  = newBounds[2] <= 1 ? Math.round(newBounds[2] * $("#selectedInterface").width())  : newBounds[2];
    this.height = newBounds[3] <= 1 ? Math.round(newBounds[3] * $("#selectedInterface").height()) : newBounds[3];
    
	$(this.container).css({
	    "width"  : this.width - 2 + "px",
	    "height" : this.height - 2 + "px",
	    "left"   : this.x  + "px",
	    "top"  	 : this.y + "px",
	});
    
    if(this.isXFader) {
        this.xFaderWidth = 50;
        if(!this.shouldUseCanvas) {
            this.fillDiv.style.width = this.xFaderWidth + "px";
            this.fillDiv.style.left = (this.x + (this.value * this.width)) + 1 + "px";
        }
    }
    this.fillDiv.style.webkitTransformOriginY = "100%";
    
    this.draw();
	
	if(typeof this.label != "undefined") {
		var _width, _height, _x, _y;
		if(this.isVertical) {
			_width = newBounds[2] - (8 / Control.deviceWidth);
			_height =  (this.labelSize + 4) / Control.deviceHeight;
			_x = newBounds[0];
			_y = newBounds[1] + newBounds[3] - _height;
		}else{
			_width = (newBounds[2] / 3) - (8 / Control.deviceWidth);
			_height = (this.labelSize + 4) / Control.deviceHeight;
			_x = newBounds[0] + (newBounds[2] / 2) - ((newBounds[2] / 3) / 2);
			_y = newBounds[1] + newBounds[3] - _height;
		}
		this.label.setBounds([_x,_y,_width,_height]);
	}
}

Control.Slider.prototype.show = function() {
    if(!this.shouldUseCanvas) {
        $(this.container).css("display", "block");
    }else{
        $(this.container).css("display", "block");
    }

    this.draw();
}

Control.Slider.prototype.hide = function() {
    //this.ctx.clearRect(this.x,this.y,this.width,this.height);
    if(!this.shouldUseCanvas) {
        $(this.container).css("display", "none");
    }else{
        $(this.container).css("display", "none");
    }
}

Control.Slider.prototype.unload = function() {
//  this.ctx.clearRect(this.x,this.y,this.width,this.height);
    if(typeof this.label !== 'undefined') {
        Control.removeWidgetWithName(this.name + "Label");
    }
    this.ctx.removeChild(this.container);
}

