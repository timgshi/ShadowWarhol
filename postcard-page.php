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
        <?php
        define('IMGUR_SCRIPT_VERSION', '0.1');
        define('IMGUR_API_BASE_URL', 'https://api.imgur.com');
        define('IMGUR_API_VERSION', 3);
        define('IMGUR_CURL_TIMEOUT', 3000);
         
        $api_key = "8b07422497f06d7";
         
         
        function imgur_build_url($action, array $params = null)
        {
           $url = sprintf('%s/%u/%s',
              IMGUR_API_BASE_URL,
              IMGUR_API_VERSION,
              $action);
         
           if (!empty($params))
           {
              $query = http_build_query($params);
              if (strlen($query)) $url .= '?' . $query;
           }
         
           return $url;
        }
         
        function imgur_shutdown($curlh)
        {
           if (is_resource($curlh) && get_resource_type($curlh) == 'curl')
              curl_close($curlh);
        }
         
        function imgur_curl_exec($curlh)
        {
           $response = curl_exec($curlh);
         
           $errno = curl_errno($curlh);
           if ($errno)
           {
              fprintf(STDERR, "cURL Error: %s\n", curl_error($curlh));
              exit($errno);
           }
         
           return $response;
        }
         
        function imgur_upload($filedata)
        {
            $curlh = curl_init();
         
           curl_setopt($curlh, CURLOPT_URL, imgur_build_url('image'));
           curl_setopt($curlh, CURLOPT_POST, 1);
           curl_setopt($curlh, CURLOPT_RETURNTRANSFER, 1);
           curl_setopt($curlh, CURLOPT_HTTPHEADER, array(
               'Authorization: Client-ID 8b07422497f06d7'
               ));
           curl_setopt(
              $curlh,
              CURLOPT_POSTFIELDS,
              array(
                 'name' => 'meh.jpeg',
                 'image' => $filedata
              ));
         
           if (IMGUR_CURL_TIMEOUT > 0)
              curl_setopt($curlh, CURLOPT_TIMEOUT, IMGUR_CURL_TIMEOUT);
         
           $response = imgur_curl_exec($curlh);
           if (strlen($response))
           {
              $info = json_decode($response);
              return $info;
           }
        }
        $return = imgur_upload(substr($_POST['image-data'], 23));
        ?>
        <img src="<?php echo $_POST["image-data"]; ?>" style="width:60%;"/>
        <form id="PC-form" action='email.php' method='post'>
            <label>From: </label>
            <input type="text" id="fromName" name="fromName" placeholder="Andy Warhol" required>

            <label>To: </label>
            <input type="email" id="toEmail" name="toEmail" placeholder="marilyn@monroe.com" required>

            <label>Message: </label>
            <textarea id="message" name="message" rows="5" cols="60" placeholder="Greetings from the Stanford D. School! Enjoy my Warhol Shadow" required></textarea>
            <!-- <input type="hidden" id="image-data" name="image-data" value="<?php echo $_POST["image-data"]; ?>" /> -->
            <input type="hidden" id="image-url" name="image-url" value="<?php echo $return->data->link; ?>" />
            <input type="submit" value="Send Postcard" /> 
        </form>
    </body>

</html>