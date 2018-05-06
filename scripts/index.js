function $(s){
	return document.querySelectorAll(s);
}

var size = 128;//定义的音频数组长度

var box = $('.right')[0];
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
var line;//渐变色变量
box.appendChild(canvas);
var height,width;
var Dots = [];//用于存放点对象数组,点的坐标和颜色信息
var list = $("#list li");

var mv = new Musicvisualizer({
	size:size,
	draw:draw
});

// 歌曲点击切换
// for(var i=0;i<list.length;i++){
// 	list[i].onclick = function(){
// 		for(var j=0;j<list.length;j++){
// 			list[j].className = "";
// 		}
// 		this.className = "selected";
// 		mv.play("/media/"+this.title);
// 		// load("/media/"+this.title);
// 	};
// }

// 切换可视化效果类型
var typeli = $(".type li");
for(var i=0;i<typeli.length;i++){
	typeli[i].onclick = function(){
		for(var j=0;j<typeli.length;j++){
			typeli[j].className = "";
		}
		this.className = "selectedType";
		draw.type = this.getAttribute("data-type");
	}
}



function getRandom(m,n){
	return Math.round(Math.random()*(n-m)+m);
}
function getDots(){
	Dots = [];
	for(var i=0;i<size;i++){
		var DotX = getRandom(0,width);
		var DotY = getRandom(0,height);
		// rgba 增加透明度  最边缘透明度为0
		var DotColor = "rgba("+getRandom(0,255)+","+getRandom(0,255)+","+getRandom(0,255)+",0)";
		Dots.push({
			x:DotX,
			y:DotY,
			color:DotColor,
			cap:0,//柱状上面小方块高度参数
			dx:getRandom(1,2)
		});
	}
}

/**
 * [resize 根据窗口大小改变canvas画布大小]
 * @return {[type]} [description]
 */
function resize(){
	height = box.clientHeight;
	width = box.clientWidth;
	canvas.width = width;
	canvas.height = height;

	// 设置渐变色
	line = ctx.createLinearGradient(0,0,0,height);//线性渐变
	line.addColorStop(0,"red");
	line.addColorStop(0.5,"orange");
	line.addColorStop(1,"green");
	getDots();
}
resize();
window.onresize = resize;


var vol = $("#volume")[0];
vol.onchange = function(){
	mv.changeVolumn(this.value/this.max);
}
mv.changeVolumn(0.6);//初始化音频大小

function draw(arr){
	ctx.clearRect(0,0,width,height);//每次绘制时，清空上次画布内容
	ctx.fillStyle = line;
	var rectWidth = width/size;
	var cw = rectWidth*0.6;
	var capHeight = cw > 10?10:cw;//防止上面矩形过高
	for(var i=0;i<size;i++){
		var o = Dots[i];
		if(draw.type == "column"){
			var rectHeight = arr[i]/256*height;//音频数据最大值256
			// 绘制矩形条（x,y,width,height）; rectWidth*0.6使矩形之间有间隙
			ctx.fillRect(rectWidth*i,height-rectHeight,cw,rectHeight);
			ctx.fillRect(rectWidth*i,height-(o.cap+capHeight),cw,capHeight);
			o.cap--;
			if(o.cap<0){
				o.cap =0;
			}
			if(rectHeight>0 && o.cap<rectHeight+40){
				o.cap = rectHeight+40 > height-capHeight ? height-capHeight:rectHeight+40;
			}
		}else if(draw.type == "dot"){
			ctx.beginPath();//声明，防止各个圆之间连线起来
			var r = 5+arr[i]/256*(height>width?height:width)/12;//圆的半径 最小10px,并且半径大小会依赖屏幕的宽度大小
			ctx.arc(o.x,o.y,r,0,Math.PI*2,true);//x,y,半径，起始角度，绘制角度，是否逆时针
			var round = ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,r);//从圆心到圆最外围
			round.addColorStop(0,"#fff");
			round.addColorStop(1,o.color);
			ctx.fillStyle = round;
			ctx.fill();
			// ctx.strokeStyle = round;
			// ctx.stroke();
			o.x += o.dx;
			o.x = o.x > width ? 0 : o.x;
		}

	}
}
draw.type = "column";//默认显示效果类型

$("#add")[0].onclick = function(){
	$("#loadfile")[0].click();
}

$("#loadfile")[0].onchange = function(){
	var file = this.files[0];
	var fr = new FileReader();

	fr.onload = function(e){
		// 重写play方法  这边e.target.result已经是arraybuffer对象类型，不再是ajax路径读入
		mv.play(e.target.result);
	}
	fr.readAsArrayBuffer(file);
	// $("#loadfile")[0].value = '';
}
