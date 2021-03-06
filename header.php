<?php
/**

Sounds of Europe

%FILE%		header.php
%AUTHOR%	Pierre Marchand
%DATE%		2011-07-25

 */

session_start();

global $tnames;
global $postloc;
global $blogloc;
$postloc = NULL;
$blogloc = NULL;

if(/*is_single($post) &&*/ in_array($post->post_type, $tnames))
{
	$custom = get_post_custom($post->ID);
	if(isset($custom['location'][0]))
	{
		$postloc = GetLocation($custom['location'][0]);
	}
}
else
{
	$postloc = $blogloc = GetLocation( get_option('soe_location') );
	
}


$template_dir = get_stylesheet_directory_uri();
$SOE_styles = array(
	"style",
	"menu_top",
	"map",
	"menu_map",
	"menu_nomap",
	"content",
	"writings");
	
if(false)
    echo '<?xml version="1.0"?>'."\n";

?><!DOCTYPE html> 
<html> 
<head> 
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title><?php
	bloginfo( 'name' );
	if( is_home() || is_front_page() )
		echo ' *';
?></title>
<?php wp_head(); ?>

<style media="screen" type="text/css">
<?php
foreach($SOE_styles as $style)
{
	echo '@import url("'.$template_dir.'/'.$style.'.css");';
	echo "\n";
}


?>
</style>

<script type="text/javascript">
var rootUrl = "<?php echo get_bloginfo('url') . '/'; ?>";
var templateUrl = "<?php echo $template_dir . '/'; ?>";
var jplayerswf = " <?php echo get_bloginfo('template_directory') . '/js/jQuery.jPlayer.2.0.0/' ;?>";
var theCity = "<?php  echo $postloc !== NULL ? $postloc->geonameid : "XXXX" ?>";
var doMap = <?php echo $post->post_type != 'soe_writing' ? 'true' : 'false'; ?>;

<?php
if(isset($_SESSION['tt']))
{
	echo 'var trackTrack = '.$_SESSION['tt'].';';
}
else
{
	echo 'var trackTrack = 0;';
}
if(isset($_SESSION['tp']))
{
	echo 'var trackPaused = '.$_SESSION['tp'].';';
}
else
{
	echo 'var trackPaused = 1;';
}


// city IDs in use
global $wpdb;
$locs = $wpdb->get_results("
SELECT * 
FROM ". $wpdb->postmeta ." AS p 
INNER JOIN cities15 AS c 
ON (p.meta_key = 'location' AND p.meta_value = c.geonameid)
LEFT JOIN ".$wpdb->posts." AS pp ON (p.post_id = pp.ID)
WHERE (pp.post_type != 'soe_city' AND pp.post_status = 'publish');" , OBJECT);
$wpcities = $wpdb->get_results("
SELECT * FROM wp_posts AS p 
INNER JOIN wp_postmeta AS m 
ON p.ID = m.post_id 
WHERE (p.post_type = 'soe_city' AND m.meta_key = 'location') ;
", OBJECT);
$citiesurl = array();
foreach($wpcities as $c)
{
	$citiesurl[$c->meta_value] = get_permalink($c->ID);
}
// 			print_r($locs);
$countrySVG = array();
$locids = array();
$minLat = 9999999;
$minLon = 9999999;
if($locs != NULL)
{
	echo 'var locations = new Array();';
	foreach($locs as $loc)
	{
		if(in_array($loc->meta_value, $locids) === FALSE)
		{
// 			if(array_key_exists($loc->country_code, $countrySVG) === FALSE)
// 			{
// 				$squery = "SELECT * FROM countries WHERE ccode = '".$loc->country_code ."';";
// 				$csvg = $wpdb->get_results($squery, OBJECT);
// 				$countrySVG[$loc->country_code] = $csvg[0]->svg;
// 			}
// 			$minLat = min($minLat, floatval($loc->latitude));
// 			$minLon = min($minLon, floatval($loc->latitude));
// 			echo "\n";
			echo '{var cObj = new Object();';
			echo 'cObj.id = '.$loc->meta_value.';';
			echo 'cObj.url = "'.$citiesurl[$loc->meta_value].'";';
			echo 'cObj.name = "'.str_replace (array('-', ' '),array('&#8209;', '&nbsp;'),$loc->name).'";';
			echo 'cObj.lat = -1 * '.$loc->latitude.';';
			echo 'cObj.lon = '.$loc->longitude.';';
			echo 'cObj.country = "'.$loc->country_code.'";';
			echo 'locations.push(cObj);}';
			$locids[] = $loc->meta_value;
		}
	}
// 	echo 'var countries = new Object();';
// 	foreach($countrySVG as $ck=>$cv)
// 	{
// 		echo 'countries[\''.$ck.'\']="'.$cv.'";';
// 	}
		
}
?>
</script>

</head> 

<body>

<!-- MAP -->
<div id="texture" class="map" style="z-index:0;"></div>
<div id="carte" class="map" style="z-index:1;"></div>
<div id="labels" class="map" style="z-index:2;"></div>
<!-- MAP -->

<!-- MENU -->
<?php get_template_part('menu'); 


?>
<!-- END OF MENU -->
