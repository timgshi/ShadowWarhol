<?php
 
	require("postmark.php");
	
	$postmark = new Postmark("8e1b879a-1100-45aa-9fd6-36463856455f","timshi@stanford.edu","shadowwarhol@gmail.com");
	$message = "<html><p>";
	$message .= $_POST['message'];
	$message .= "</p>";
	$message .= "<img src=\"";
	$message .= $_POST['image-url'];
	$message .= "\" width=\"640\" height=\"480\"/>";
	$message .= "</html>";
	$result = $postmark->to($_POST['toEmail'])
		->subject("Test!")
		->html_message($message)
		->send();
	
	if($result === true)
		echo "Message sent";
?>
