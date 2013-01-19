<!DOCTYPE HTML>
<html>
    <head>
        <script type='text/javascript' src='http://code.jquery.com/jquery-latest.min.js'></script>
        <script type='text/javascript' src='js/stackblur.js'></script>   
		<script type="text/javascript" src="js/kinect.js"></script>
        <script type="text/javascript" src="js/shadowboxing.js"></script>
		<script type="text/javascript" src="js/demo-stanford.js"></script>
        <link rel="stylesheet" type="text/css" href="css/postcard-page.css"/>
    </head>

    <body>
        <img src="<?php echo $_POST["image-data"]; ?>" style="width:60%;"/>
        
        <form id="PC-form" onfocus="">
            <label>From: </label>
            <input type="text" id="fromName" name="fromName" placeholder="John Doe" required>

            <label>To: </label>
            <input type="email" id="toEmail" name="toEmail" placeholder="janedoe@email.com" required>

            <label>Message: </label>
            <textarea id="message" name="message" rows="5" cols="60" placeholder="Greetings from the Stanford D. School! Enjoy my Warhol Shadow" required></textarea>

            <input type="submit" value="Send Postcard" /> 
        </form>
    </body>
</html>