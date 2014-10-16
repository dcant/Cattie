<?php 
    function basicCurlHandler($url) {
        $ch = curl_init();
        $header = array(
            "User-Agent" => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.125 Safari/537.36"
        );
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        curl_setopt($ch, CURLINFO_HEADER_OUT, true); // enable tracking

        $cookieString = '';
        // echo "cookieStringBefore:"; var_dump($cookieString); 
        if (strlen($cookieString) != 0) {
            curl_setopt($ch, CURLOPT_COOKIE, CookieManager::cookieString());
        }
        return $ch;
    }

    function post($url, $data_str) {
        $ch = basicCurlHandler($url);

        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data_str);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        if (strlen($data_str) > 0) {
            $header = array(
                //"Origin" => "http://seeserver.iem.technion.ac.il",
                //"Referer" => "http://seeserver.iem.technion.ac.il/see-terminal/login.aspx",
                "User-Agent" => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.125 Safari/537.36"
            );
            $header['Content-Type'] = 'application/x-www-form-urlencoded';
            curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
        }

        $data = curl_exec($ch);
        //var_dump($data);
        //var_dump(curl_error($ch));
        $information = curl_getinfo($ch);
        
        if (!$data) {
            //echo 'curl error';
            //echo curl_error($ch);
        }
        curl_close($ch);

        return $data;
    }

    function get($url, $param) {
        $nurl = $url . '?' . $param;
        $ch = basicCurlHandler($nurl);
        $data = curl_exec($ch);
        curl_close($ch);
        return $data;
    }

    function arrayToPostString($postArray, $withUrlencoding = true) {
        $post_field_str = '';
        foreach ($postArray as $k => $v) {
            if ($withUrlencoding) {
                $post_field_str = $post_field_str . urlencode($k) . '=' . urlencode($v) . '&';
            } else {
                $post_field_str = $post_field_str . $k . '=' . $v . '&';
            }
        }
        $post_field_str = substr($post_field_str, 0, strlen($post_field_str) - 1);
        return $post_field_str;
    }

    $url = $_GET['url'];
    unset($_GET['url']);
    $content = get($url, arrayToPostString($_GET, false));
    preg_match('/!\[CDATA\[([^<]*?)\]\]><\/furl><ftype>mp4/', $content, $matches);
    if (count($matches) == 2) {
        echo $matches[1];
    } else {
        echo 'Parse Error.';
    }
 ?>