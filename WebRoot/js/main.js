function json2str(o) {
	var arr = [];
	var fmt = function(s) {
		if (typeof s == 'object' && s != null)
			return json2str(s);
		return /^(string|number)$/.test(typeof s) ? "'" + s + "'" : s;
	}
	for (var i in o)
		arr.push("'" + i + "':" + fmt(o[i]));
	return '{' + arr.join(',') + '}';
}
function JsonArrayToStringCfz(jsonArray) {
	var JsonArrayString = "[";
	for (var i = 0; i < jsonArray.length; i++) {
		JsonArrayString = JsonArrayString + json2str(jsonArray[i]) + ",";
	}
	JsonArrayString = JsonArrayString.substring(0, JsonArrayString.length - 1)
			+ "]";
	return JsonArrayString;
}
function stringToJson(stringValue) {
	eval("var theJsonValue = " + stringValue);
	return theJsonValue;
}

$(function() {
	map = new TMap("mapDiv");
	// 设置显示地图的中心点和级别
	map.centerAndZoom(new TLngLat(100.40969, 39.89945), 5);
	// 允许鼠标滚轮缩放地图
	map.enableHandleMouseScroll();
	var scale = new TScaleControl();
	map.addControl(scale);

	var config1 = {
		REQUEST : "GetMap", // 操作名称
		VERSION : "1.1.1", // 请求服务的版本
		SERVICE : "WMS", // 服务类型标识符
		LAYERS : "030100", // 用","分隔的多个图层列表
		TRANSPARENT : true, // 输出图像背景是否透明
		STYLES : "", // 每个请求图层的用","分隔的描述样式
		FORMAT : "image/png", // 输出图像的类型
		// SRS:"EPSG:4326", //地图投影类型
		SRS : map.getCode(), // 地图投影类型
		WIDTH : 256, // 输出地图图片的像素宽
		HEIGHT : 256
		// 输出地图图片的像素高
	};
	// 创建WMS图层对象
	wmsLayer = new TTileLayerWMS("030100",
			"http://gisserver.tianditu.com/TDTService/region/wms", config1);
	// 将WMS图层添加到地图上
	map.addLayer(wmsLayer);
	// 创建图片对象
	// /1北京、2甘肃、3贵州、4河南、5湖北、6湖南、7江苏、8辽宁、920西藏
	// http://gisserver.tianditu.com/TDTService/wfs?request=GetFeature&typename=TDTService:china_province_region&FEATUREID=china_province_region.1&outputFormat=json&FEATUREID=china_province_region.10
	// render();
	Highcharts.setOptions({
				global : {
					useUTC : false
				},

				colors : ['#90ed7d', '#f7a35c', '#8085e9', '#f15c80',
						'#e4d354', '#91e8e1', '#33a3dc', '#009966', '#FF6666',
						'#FFFF66', '#0099CC', '#ffbe56'],
				credits : {
					enabled : false,
					text : '中国地质调查局发展研究中心',
					href : 'http://www.drc.cgs.gov.cn/',
					style : {
						cursor : 'pointer',
						color : '#909090',
						fontSize : '14px'
					}
				},
				xAxis : {
					labels : {
						overflow : ' justify'
					}
				},// /x轴标签溢出取值
				exporting : {
					url : $("#localIp").val()
							+ "/ExportingServer_java_Struts2/export/index"
				},
				lang : {
					contextButtonTitle : "图表导出菜单",
					decimalPoint : ".",
					downloadJPEG : "下载 JPEG 图片",
					downloadPDF : "下载  PDF 文件",
					downloadPNG : "下载  PNG 文件",
					downloadSVG : "下载  SVG 文件",
					drillUpText : "返回 {series.name}",
					loading : "加载中",
					months : ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月",
							"九月", "十月", "十一月", "十二月"],
					noData : "没有数据",
					numericSymbols : ["千", "兆", "G", "T", "P", "E"],
					printChart : "打印图表",
					resetZoom : "恢复缩放",
					resetZoomTitle : "恢复图表",
					shortMonths : ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
							"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
					thousandsSep : ",",
					weekdays : ["星期一", "星期二", "星期三", "星期三", "星期四", "星期五",
							"星期六", "星期天"]
				},
				tooltip : {
					style : {
						color : '#333333',
						fontSize : '16px',
						padding : '8px'
					}
				}
			});
	var x1 = map.getBounds().getSouthWest().getLng();
	var y1 = map.getBounds().getNorthEast().getLat();

	var x2 = map.getBounds().getNorthEast().getLng();
	var y2 = map.getBounds().getSouthWest().getLat();
	var icon = new TIcon("http://api.tianditu.com/img/map/markerA.png",
			new TSize(1, 1), {
				anchor : new TPixel(1, 1)
			});
	// 向地图上添加自定义标注
	TMarker.prototype.onViewChange = function() {
		var w = this;
		setTimeout(Qq(w, function() {
							var w = this;
							w.reDraw(true)
						}), 100)
	}
	var marker = new TMarker(new TLngLat(x1, y1), {
				icon : icon
			});
	map.addOverLay(marker);
	// debugger;
	document.getElementById("info").value = map
			.fromLngLatToContainerPixel(new TLngLat(x1, y2)).x
			+ "," + map.fromLngLatToContainerPixel(new TLngLat(x1, y2)).y;

	// var m=new TMarker(new TLngLat(x1,y1),new Icon())
	var dd = marker.getObject();
	$(dd).hide();

	var polygons = [];
	var points = [];
	var idB = [];
	var idA = [];

	// render();
	/**
	 * 分层设色
	 * 
	 * @argument sColor起始颜色RGB，EColor起始颜色RGB，N分级数
	 * @return rgbLevel 数组共N级为字符RGB(，，)；
	 */
	function renderColor(sColor, eColor, N) {
		var sRGB = [], eRGB = [];
		var Srgb = sColor.split('(');
		for (var k = 0; k < 3; k++) {
			sRGB[k] = parseInt(Srgb[1].split(',')[k]);
			eRGB[k] = parseInt(eColor.split('(')[1].split(',')[k]);
		}
		var rgbLevel = [];
		// (M_R=T×S_R+(1-T)×E_R@M_G=T×S_G+(1-T)×E_G@M_B=T×S_B+(1-T)×E_B@T=(1-cos⁡(P×π))/2)
		for (var i = 0; i < N; i++) {
			var T = (1 - Math.cos((i / (N - 1)) * Math.PI)) / 2;
			var R = parseInt(T * sRGB[0] + (1 - T) * eRGB[0]);
			var G = parseInt(T * sRGB[1] + (1 - T) * eRGB[1]);
			var B = parseInt(T * sRGB[2] + (1 - T) * eRGB[2]);
			rgbLevel[i] = "Rgb(" + R + "," + G + "," + B + ")";
		}
		return rgbLevel;
	}

	function render(code,color) {

		// var fso = new ActiveXObject("Scripting.FileSystemObject");
		// var f = fso.GetFolder("E:\workspace\canvas\WebRoot\json");

		// var yuzhi = 5;
		// for (var yi = 1; yi < 8; yi++) {
		// idSS = (yi - 1) * yuzhi + 1;
		// idEE = yi * yuzhi;
		// if (idEE > 34) {
		// idEE = 34;
		// }
		// }
//		var sColor = "Rgb(39, 179, 58)";
//		var eColor = "Rgb(239, 41, 7)";
//		var N = 6;
//		var Level = renderColor(sColor, eColor, N);

//		var filesList = new Array(11, 12, 13, 14, 15, 21, 22, 23, 31, 32, 33,
//				34, 35, 36, 37, 41, 42, 43, 44, 45, 46, 50, 51, 52, 53, 54, 61,
//				62, 63, 64, 65, 71);
//		for (var id = 0; id < filesList.length; id++) {
//(function	(id) {
				// var url =
				// "http://gisserver.tianditu.com/TDTService/wfs?request=GetFeature&typename=TDTService:china_province_region&FEATUREID=china_province_region."
				// + id + "&outputFormat=json";
				var url = "/canvas/json/" + code
						+ ".json";
				$.getJSON(url, function(data) {
					var features = data.features;
					if (features.length != 0) {
						
						var geometrys = features[0].geometry;
						var coordinates = geometrys.coordinates;
						//var d = parseInt(filesList[id] / 10) - 1;
					//	var color = Level[d];
						for (var m = 0; m < coordinates.length; m++) {
							if (m > 0) {
								return;
							} else {
								var coor = coordinates[m];
								for (var n = 0; n < coor.length; n++) {
									var point = [];
									for (var o = 0; o < coor[n].length; o = o
											+ 1) {// 动态增删
										var lat = coor[n][o][0];// 纬度
										var lng = coor[n][o][1];
										var str = lat.toString();
										var d = str
												.substring(lat.toString().length
														- 1)
										if (d == "1" || d == "5" || d == "3"
												|| d == "4" || d == "8"
												|| d == "9") {

										} else {
											point.push(new TLngLat(lng, lat))
										}
									}
									var polygon = new TPolygon(point, {
												strokeColor : "rgba(255,1,1,0.8)",
												strokeWeight : 2,
												fillColor : color,
												strokeOpacity : 0.5
											});
									polygons.push(polygon);
									points.push(point);
									map.addOverLay(polygon);
				(function			() {
										var polygonclick = TEvent.addListener(
												polygon, "click", function(p) {
													polygon.setStrokeWeight(5);
												});
									})(polygon)

								}

							}
						}
						// }
					}
				})
				// }
		//	})(id)
			// },2000)
		//}
	}
	// }

	$("#change").click(function() {
		// var svgString = new XMLSerializer().serializeToString(document
		// .querySelector('svg'));
		// debugger;// .setLngLats(points[1]);
		map.addOverLay(marker11);
		var dsdfsdf = marker11.getObject();
			// debugger;
		})
	function TChart(point, size, pixel, id) {
		this._div = null;
		this.point = point;
		this.Type = 11;
		this._pixel = pixel;
		this._size = size;
		this._id = id;
		this._chart = null;
		this.map = null;
		// TOverlay.apply(this,arguments);
	}

	TChart.prototype = new TOverlay();
	// TChart.prototype.
	TChart.prototype.initialize = function(map) {
		this.map = map;
		var map = this.map;
		var dpoint = this.point;
		var dpixel = map.fromLngLatToDivPixel(this.point);
		var pixel = this._pixel;
		var size = this._size;
		var id = this._id;
		// 下面是通过自定义属性完成一些跟位置有关的交互，不用可取消
		// this._div.attr('data-top',pixel.y - 5);
		var $div = $('<div class="mapTemp" style="position: absolute; z-index: 490; border: 0px solid rgb(0, 0, 0); font-size: 12px; color: rgb(0, 0, 0); padding: 2px; white-space: nowrap; "><div style="position: relative; cursor: pointer; z-index: 500;"><div style="position: relative; left: 0px; top: 0px"></div></div></div>');
		this._div = $div[0];
		$div.css({
					left : dpixel.x - size.width / 2,
					top : dpixel.y - size.height*2 / 3
				});
		var $iddiv = $("<div id=" + id + "></div>");
		$div.children("div").children("div").append($iddiv[0]);
		$iddiv.css({
					width : size.width,
					height : size.height
				});
		// this.refresh(true);
		// 可以同时对div中的DOM绑定事件
		var z_index = $iddiv.css("z-index");
		$iddiv.mouseover(function() {
					$div.css({
								"z-index" : 10000
							});
				}).mouseout(function() {
					$div.css({
								"z-index" : z_index
							});

				});

		// this.map.prototype
		// var this.size
		var w = this;
//		markerclick = TEvent.addListener(this.map, "zoomend", function(p) {
//			w.reDraw(true);
//				// alert("标注当前坐标："+marker.getLngLat().getLng()+","+marker.getLngLat().getLat());
//			});
		// $div.click(function() {
		// });
		// 将div插入到地图中，注意如果是jquery的dom要转成js的dom
		// TChart.prototype.draw();
		$("#t_overlaysDiv").append($div[0]);
		// this._div = this._div[0];
		this._chart = new Highcharts.Chart({
					chart : {
						renderTo : id,
						type : "column",
						backgroundColor : "rgba(1,1,1,0)"
					},
					title : {
						text : null
					},
					subtitle : {
						text : null
					},
					xAxis : {
						categories : ['Jan'],
						labels:{enabled:false},lineWidth: 0,gridLineWidth:0,minorTickWidth:0, tickLength: 0
					},
					plotOptions : {
						/**
						 * 数列，对于所有的图表都可以适用的配置参数，属于共用性质。
						 */
						series : {
							// 鼠标样式
							cursor : 'pointer',
							events : {}
						},

						/**
						 * 线性图，与spline的区别在于点与点之间的连线是直线还是圆滑曲线。
						 */
						line : {
							// 允许线性图上的数据点进行点击
							allowPointSelect : true,

							// 是否在图注中显示。
							showInLegend : true,
							// 调整图像顺序关系
							zIndex : 3
						},

						/**
						 * 曲线图，与spline的区别在于点与点之间的连线是直线还是圆滑曲线。
						 */
						spline : {
							// 允许线性图上的数据点进行点击
							allowPointSelect : true,
							showInLegend : true,
							// 调整图像顺序关系
							zIndex : 3
						},

						/**
						 * 饼状图
						 */
						pie : {
							// 'center : ['50%', '50%'],
							// innerSize: 100,
							depth : 45,
							// 是否允许扇区点击
							allowPointSelect : true,
							// 点击后，滑开的距离
							slicedOffset : 5,
							// 饼图的中心坐标
							// center : [300, 80],
							// 饼图的大小
							// size : 100,
							// 数据标签
							dataLabels : {
								// 是否允许标签
								enabled : false,
								// 标签与图像元素之间的间距
								distance : 10
							},
							// 数据点的点击事件

							// 是否忽略隐藏的项
							ignoreHiddenPoint : true,
							// 当具体的数据点被点击时的事件响应函数。如果不需要事件响应，可以删除。

							// 是否在图注中显示。
							showInLegend : false,
							// 调整图像顺序关系
							zIndex : 0
							// ,
							// startAngle:45
						}
					},
					yAxis : {
						title : {
							text : ''
						},gridLineWidth:0,
						labels:{enabled:false},
						plotLines : [{
									value : 0,
									width : 0,
									color : '#808080'
								}]
					},
					tooltip : {
						valueSuffix : '°C',
						style:{
						fontSize: '12px',
						padding: '2px'
						},formatter : function() {
							var point=this.point;
						var s=this.series.name + ":<br>"
								+ point.name+""+Number(point.y)+"万元";
								return s;
						}
					},
					legend : {
						floating : true,
						enabled : false
					}
				});
		return this._div;
	}
	TChart.prototype.getType = function() {
		return this.Type;
	}
	TChart.prototype.getChart = function() {
		return this._chart;
	}
	TChart.prototype.reDraw = function(a) {
		var w = this;
		if (!w.map || !a || !w.point) {
			return
		};
		var size = this._size;
		$("#" + this._id).css({
					width : size.width,
					height : size.height
				});
		this._chart.setSize(size.width, size.height);
		// $("#" + this._id).highcharts().reflow(true);
		var dpixel = w.map.fromLngLatToDivPixel(w.point);
		$(this._div).css({
					left : dpixel.x - size.width / 2,
					top : dpixel.y - size.height *2/ 3
				});
	};
	TChart.prototype.refresh = function(a) {

		var w = this;
		w.reDraw(true);
	};
	TChart.prototype.setSize = function(a) {
		// alert("1");
		this._size = a;
		var w = this;
		w.reDraw(true);
	};
	TChart.prototype.getObject = function() {
		return this._div;
	}

	TChart.prototype.remove = function() {
		$("#t_overlaysDiv").remove(this._div);
	}
	// TChart.prototype.reDraw = function(a) {
	// this._chart.redraw(a);
	// }
	// var point = new TLngLat(x1, y1);
	// var size = new TSize(250, 250);
	// var pixelt = new TPixel(19, 27);
	// var marker11 = new TChart(point, size, pixelt, "d110000");
	// var mchart = marker11.getChart();
	//
	// // map.addOverLay(marker11);
	// mchart = marker11.getChart();
	// // marker11.getType();
	// var point2 = new TLngLat(x1, y2);
	// var size = new TSize(250, 250);
	// var pixelt = new TPixel(19, 27);
	// var marker12 = new TChart(point2, size, pixelt, "120000");
	// map.addOverLay(marker12);

	$("#piechart").click(function() {
		var allLatLong;
		var chartlist = [];
		$.getJSON("/surveyprj/tj_getCountry.action", function(result) {
					allLatLong = result.data.rows;
					for (var i = 0; i < allLatLong.length; i++) {
						var temp = allLatLong[i];
						var point = new TLngLat(temp.jing, temp.wei);
						var size = new TSize(150, 150);
						var pixelt = new TPixel(19, 27);
						var d = new TChart(point, size, pixelt, "d"
										+ temp.father);
						map.addOverLay(d);
						chartlist[temp.father] = d;
					}
					addData(chartlist,"1_3_T");
				})
	});
	$("#columnchart").click(function() {
		var allLatLong;
		var chartlist = [];
		$.getJSON("/surveyprj/tj_getCountry.action", function(result) {
					allLatLong = result.data.rows;
					for (var i = 0; i < allLatLong.length; i++) {
						var temp = allLatLong[i];
						var point = new TLngLat(temp.jing, temp.wei);
						var size = new TSize(150, 150);
						var pixelt = new TPixel(19, 27);
						var d = new TChart(point, size, pixelt, "d"
										+ temp.father);
						map.addOverLay(d);
						chartlist[temp.father] = d;
					}
					addData(chartlist,"2_1_1");
				})
	});
	function addData(chartlist,Type) {
		var feild = "*";
		//var Type = "1_3_T";
		// switch()
		var whereClause = " t.dept_code in ('000000') and group_level=0 and task_year='2013' order by task_year asc";
		$.getJSON("/surveyprj/tj_getAllTJ_service.action", {
					'deptCode' : '000000',
					'whereClause' : whereClause,
					'type' : Type,
					'feild' : feild
				}, function(result) {
					updateChart(result.data.rows, Type, chartlist);
				});
	}
	Array.prototype.max = function() { // 最大值
		return Math.max.apply({}, this)
	}
	Array.prototype.min = function() { // 最小值
		return Math.min.apply({}, this)
	}

	function countLevel(min, max, data, n) {
		var number = [];
		for (var i = 1; i < n + 1; i++) {
			var s = min + (max - min) * (i - 1) / n;
			var t = min + (max - min) * i / n;
			if (data >= s && data <= t) {
				return i - 1;
			}
		}
	}
	function sizeLevel(min, max, N, n) {
		return ((max - min) * n / (N - 1) + min) + 'px'
	}
	function updateChart(rows, Type, chartlist) {

		switch (Type) {
			case "1_3_T" :
				deakRow_project(rows, Type, chartlist, 'pie');
				break;
			case "2_1_1":deakRow_Buget(rows, Type, chartlist, 'column');break;
		}
	}
	
	function deakRow_project(rows, Type, chartlist, charttype) {
		var min, max;
		var allCount = [];
		for (var p = 0; p < rows.length; p++) {
			allCount.push(rows[p]["project_count"]);
		}
var pColor="rgb(122,237,8)"
		var eColor = "Rgb(235, 210, 22)";
		var sColor = "Rgb(78, 235, 22)";
		var N = 6;
		var colorLevel = renderColor(sColor, eColor, N);
		min = allCount.min();
		max = allCount.max();
		for (var p = 0; p < rows.length; p++) {
			// if (group1[p]["pro_year"] == select_year) {
			// $("#d"+)
			var piedata0 = [];
			var xz_code = rows[p].xz_arer_code;
			var chart = $("#d" + xz_code).highcharts();

			var name = rows[p]["name"];
			// xaix11.push(mineral)// =mineral;
			var amount1 = rows[p]["project_count"];
			var L = countLevel(min, max, amount1, N);
			render(xz_code,colorLevel[L]);
			// amou.push(amount1)// =amount1;
			var t1 = {
				y : amount1,
				name : name,
				color : colorLevel[L]
				// colorLevel[L]
			}
			piedata0.push(t1);
			var size = sizeLevel(80, 120, N, L);
			chartlist[xz_code].setSize(new TSize(size, size));

			// chart.reflow();
			// debugger;
			chart.addSeries({
						type : charttype,
						data : piedata0,
						name : name,
						size : '100%',
						innerSize : '10%',
						dataLabels : {

							formatter : function() {
								return this.point.name + ":"
										+ Number(this.percentage.toFixed(2))
										+ '%';
							}
						}
					});
		}

	}
	function deakRow_Buget(rows, Type, chartlist, charttype) {
		var min, max;
		var allCount = [];
		for (var p = 0; p < rows.length; p++) {
			allCount.push(rows[p]["sum_b04"]);
		}

		var eColor = "Rgb(239, 179, 58)";
		var sColor = "Rgb(239, 21, 7)";
		var N = 6;
		var colorLevel = renderColor(sColor, eColor, N);
		min = allCount.min();
		max = allCount.max();
		for (var p = 0; p < rows.length; p++) {
			var piedata0 = [],piedata1=[];
			var xz_code = rows[p].xz_arer_code;
			var chart = $("#d" + xz_code).highcharts();

			var name = rows[p]["name"];
			// xaix11.push(mineral)// =mineral;
			var amount1 = rows[p]["sum_b04"];
			var amount2= rows[p]["sum_b08"];
//			var L = countLevel(min, max, amount1, N);	"经费总额" : Ddata[t]["sum_b04"],
//							"经费完成" : Ddata[t]["sum_b08"],
			// amou.push(amount1)// =amount1;
			var L = countLevel(min, max, amount1, N);
			
			render(xz_code,colorLevel[L]);
			var t1 = {
				y : amount1,
				name : "经费总额",
				color : sColor
				// colorLevel[L]
			}
			var t2={y : amount2,
				name : "经费完成",
				color : eColor}
			piedata0.push(t1);
			piedata0.push(t2);
			
			// chart.reflow();
			// debugger;
			var xaix=[];
			xaix.push("经费总额");xaix.push("经费完成");
			chart.xAxis[0].update({
								categories : xaix
							});
			var l = chart.series.length;
					for (var i = 0; i < l; i++) {
						chart.series[0].remove();// 此处必须是删除第一个，因为删掉第一个后第二个变为第一个
					}
			chart.yAxis[0].update({
								labels : {
									formatter : function() {
										return this.value + "万元"
									}
								}
							})
			chart.addSeries({
						type : charttype,
						data : piedata0,
						name : '2013'
						
					});
			var size = sizeLevel(80, 180, N, L);
			chartlist[xz_code].setSize(new TSize(size, size));

		}
		//"name" : Ddata[t]["name"],
						
	
	}
})