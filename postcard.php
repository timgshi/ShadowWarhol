<!DOCTYPE HTML>
<html>
	<head>
		<link href='http://fonts.googleapis.com/css?family=Over+the+Rainbow' rel='stylesheet' type='text/css'>
		<style type="text/css">
			#border {
				font-family: 'Over the Rainbow', cursive;
				width: 95%;
				border: 3px;
				solid: white;
				-moz-box-shadow: 10px 10px 5px #888;
				-webkit-box-shadow: 10px 10px 5px #888;
				box-shadow: 10px 10px 5px #888;
			}
			#image {
				width: 100%;
			}
			#image-div {
			}
			#right-div {

				text-align: center;
				vertical-align: center;
			}
			#message {
				vertical-align: center;
			}
			#name {
				padding: 5px;
			}
		</style>
	</head>

	<body>
		<link href='http://fonts.googleapis.com/css?family=Over+the+Rainbow' rel='stylesheet' type='text/css'>
		<div id="border" style="font-family: 'Over the Rainbow', cursive;width: 50%;">
			<div id="image-div">
				<img id="image" src="<?php echo $_POST['image-url']; ?>" style="width: 100%;"></img>
			</div>			
			<div id="msg-div" style="text-align: center;vertical-align: center;">
				<div id="message" style="vertical-align: center;"><?php echo $_POST['message']; ?></div>
				<div id="name" style="padding: 5px;"><?php echo $_POST['fromName']; ?></div>
			</div>
		</div>
	</body>
</html>