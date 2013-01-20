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
		<div id="border">
			<table id="image-div">
				<tr>
					<td style="width:60%"><img id="image" src="<?php echo $_POST['image-url']; ?>"></img></td>
					<td style="width:40%">
						<div id="right-div">
							<div id="message"><?php echo $_POST['message']; ?></div>
							<div id="name"><?php echo $_POST['fromName']; ?></div>
						</div>
					</td>
				</tr>
			</table>
		</div>
	</body>
</html>