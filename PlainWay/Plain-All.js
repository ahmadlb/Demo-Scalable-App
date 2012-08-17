function loadModule(id, mod){
	return new mod(id);
}

//##############################################################################
//		Application Level Module
//
//##############################################################################


var myApp = myApp || {};


myApp.application = function(id){
	this.$ =  $("#" + id);		//Container of mudule
	this.id = id;			//Id of Container - This may be require to create Unique Ids
};

myApp.application.prototype = {
	start: function(){
		this.initHTML();
		this.loadModules();

	},
	end: function(){},

	initHTML: function(){
		this.$.append('\
			<div class="header" id="'+ this.id +'_header"></div>\
			<div class="navigator" id="'+ this.id +'_navigator"></div>\
			<div class="blogDisplayPanel" id="'+ this.id +'_blogDisplayContainer"></div>\
			<div class="footer" id="'+ this.id +'_footer"></div>\
			');
	},
	loadModules: function(){
		this.blogDisplayModule = loadModule(this.id + "_blogDisplayContainer", myApp.blogDisplayPanel);
	
		this.headerModule = loadModule(this.id + "_header", myApp.header);
	
		this.navigatorModule = loadModule(this.id + "_navigator", myApp.navigator);
	
		this.footerModule = loadModule(this.id + "_footer", myApp.footer);

	
		this.blogDisplayModule.start();
		this.headerModule.start();
		this.navigatorModule.start();
		this.footerModule.start();
	}
};

myApp.header = function(id){
	this.$ =  $("#" + id);		//Container of mudule
	this.id = id;			//Id of Container - This may be require to create Unique Ids
};
myApp.header.prototype = {
	start: function(){
		this.initHTML();

	},
	end: function(){},

	initHTML: function(){
		this.$.append("<p>THIS IS HEADER PANEL</p>");
	}
};

myApp.footer = function(id){
	this.$ =  $("#" + id);		//Container of mudule
	this.id = id;			//Id of Container - This may be require to create Unique Ids
};
myApp.footer.prototype = {
	start: function(){
		this.initHTML();

	},
	end: function(){},

	initHTML: function(){
		this.$.append("<p>THIS IS FOOTER PANEL</p>");
	}
};


myApp.navigator = function(id){
	this.$ =  $("#" + id);		//Container of mudule
	this.id = id;			//Id of Container - This may be require to create Unique Ids
};
myApp.navigator.prototype = {
	start: function(){
		this.initHTML();

	},
	end: function(){},

	initHTML: function(){
	
		this.callServer();
	},
	callServer: function(){
		var self = this;
		$.get("./server/links", function(data){
			self.parseResponse(data);
		
		},"json");

	},
	parseResponse: function(data){
		var self = this;
	
		var htmlstr = [];
		htmlstr.push('<ul>');
		$.each(data, function(i,link){
			htmlstr.push('<li><span class="spanLink '+ self.id +'_links" data-blogid="'+  link.id +'">'+ link.title +'<span></li>');	
		});
		htmlstr.push('</ul>');
		this.$.append(htmlstr.join(''));					
		this.attachClickHandlers();
	},

	attachClickHandlers: function(){
		var self = this;
		this.$.find("." + self.id + "_links").click(function(){
			//Transmit this Id to Other Module
			amplify.publish("onBlogLinkSelected", $(this).data("blogid"));
		});
	}

};


myApp.blogDisplayPanel = function(id){
	this.$ =  $("#" + id);		//Container of mudule
	this.id = id;			//Id of Container - This may be require to create Unique Ids
};
myApp.blogDisplayPanel.prototype = {
	start: function(){
		this.initHTML();

	},
	end: function(){
		this.sandbox.events.unsubscribe({event: 'onBlogLinkSelected'});
	},

	initHTML: function(){
		this.$.append("<p>THIS IS BLOG PANEL</p>");
		this.subscribeEvents();
		this.callServer();
	},
	subscribeEvents: function(){
		var self = this;
		amplify.subscribe(
			'onBlogLinkSelected',
			function(value){
				self.loadBlog(value);
			});
	},

	loadBlog: function(id){
		if(this.allBlogs == undefined){
			alert("Data Not Loaded From Server");
		}else{
			this.$.html('<p>' + this.allBlogs[id].text + '</p>');
		}
	
	},

	callServer: function(){
		var self = this;
		$.get("./server/blogs", function(data){
			self.allBlogs = data;
		},"json");

	},
};