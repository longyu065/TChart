<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <base href="<%=basePath%>">
    
    <title>My JSP 'index.jsp' starting page</title>
	<meta http-equiv="pragma" content="no-cache">
	<meta http-equiv="cache-control" content="no-cache">
	<meta http-equiv="expires" content="0">    
	<meta http-equiv="keywords" content="keyword1,keyword2,keyword3">
	<meta http-equiv="description" content="This is my page">
	<!--
	<link rel="stylesheet" type="text/css" href="styles.css">
	-->


<meta name="keywords" content="天地图"/> 
<title>天地图－地图API－范例－鼠标在地图上的滑动事件</title> 
<script type="text/javascript" src="js/jquery.js"></script> 
<script type="text/javascript" src="js/highcharts.js"></script> 

<script type="text/javascript" src="http://api.tianditu.com/js/maps.js"></script> 
<script type="text/javascript" src="<%=basePath%>js/main.js"></script> 
<script src="js/html2canvas.js"></script>

<script language="javascript"> 

	var map,zoom=4,mapmousemove; var ttt;var con=0;
	function onLoad()
	{ 
		//初始化地图对象 
	   
	} 
	 
	function addMapMousemove() 
	{ 
		//移除掉以前的注册事件 
		TEvent.removeListener(mapmousemove); 
		//注册鼠标在地图上的滑动事件 
		mapmousemove = TEvent.addListener(map,"mousemove",function(p){ 
			//将像素坐标转换成经纬度坐标 
			var lnglat = map.fromContainerPixelToLngLat(p); 
			document.getElementById("info").value = lnglat.getLng()+","+lnglat.getLat(); 
		}); 
	} 
	 
	function removeMapMousemove() 
	{ 
		//移除鼠标在地图上的滑动事件 
		TEvent.removeListener(mapmousemove); 
	} 
	
</script> 
</head> 
<body > 
	<div id="mapDiv" style="position:absolute;width:1400px; height:1030px"></div> 
	<div style="position:absolute;left:1420px;"> 
		鼠标在地图上的滑动事件： 
		<input id="dddddddd" type="button" value="注册"/> 
		<input type="button" value="移除" onClick="removeMapMousemove();"/><br/><br/> 
		鼠标所在位置坐标：<input type="text" id="info" value=""/> 
		<input type="button" value="变换" id="change">
		
		<input type="button" value="ddddd" id="piechart">
		<input type="button" value="colu" id="columnchart">
		<input type="text" id="tPixel" value=""/> 
		<ul> 
			<li>本示例演示如何给地图注册鼠标在地图上的滑动事件。</li> 
			<p><a href="http://api.tianditu.com/api-new/examples.html">返回所有范例列表</a></p> 
		</ul> 
		<div id="container"></div>
	</div> 
</body> 
</html>

