<?php
 
	require("postmark.php");
	
	$postmark = new Postmark("8e1b879a-1100-45aa-9fd6-36463856455f","timshi@stanford.edu","shadowwarhol@gmail.com");
	
	$result = $postmark->to("timgshi@gmail.com")
		->subject("Test!")
		->html_message("<b>Test</b>")
		->send();
	
	if($result === true)
		echo "Message sent";
?>
