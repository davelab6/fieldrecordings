<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /> 
<title>SOE - PROJECT</title>
<style media="screen" type="text/css">
@import url("style.css");
@import url("map.css");
@import url("menu_map.css");
@import url("menu_nomap.css");
@import url("content.css");
</style>

<script type='text/javascript' src='JSON-js/json_parse.js'></script>
<script type='text/javascript' src='js/jquery.js'></script>
<script type='text/javascript' src='js/raphael.js'></script>
<script type='text/javascript' src='js/soe.js'></script>

<script type='text/javascript'>
var theCity = "<?php echo $_GET["city"] ?>";
</script>

</head>
<body>

<div id="carte">
<!-- 	<img src="img/carte.png" /> -->
</div>

<div id="menu_carte">
	<div class="menu_item">
	</div>
	<div class="menu_item">
	</div>
	<div class="menu_item">
	</div>
	<div class="menu_item">
	</div>
	<div class="menu_item">
	</div>
	<div class="menu_item">
	</div>
</div>

<div id="menu_nocarte">
	<div class="menu_item">
	</div>
	<div class="menu_item">
	</div>
</div>


<div id="content_outer">
	<div id="content">
		<div class="content_category">ARTISTS</div>
		<div class="title">Jan Vandam</div>
		<div class="location">Brussels - Belgium</div>
		<div class="picture"></div>
		<div class="section">
			<div class="section_title">Biography</div>
			<div class="section_par">
			Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.
			</div>
			<div class="section_title">Use of fieldrecordings</div>
			<div class="section_par">
			Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.</div>
		
		<div class="general_url"><a href="#">www.janvandam.com</a></div>
		<div class="tags_box">
			<div class="tags"><a href="#">tag 1</a>, <a href="#">tag 2</a>, <a href="#">tag 3</a></div>
		
		<div class="artist_track">Listen to <img src="img/arrow_sound.png"/> Title of Sound</div>
	</div> <!-- content -->
</div> <!-- content_outer  -->



</body>
</html>