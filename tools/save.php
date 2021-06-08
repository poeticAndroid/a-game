<?php
  file_put_contents("./scenes/wip.html", $_POST["body"]);
?>
<h1>File saved!</h1>
<pre>./scenes/wip.html</pre>
<script>
  setTimeout(() => {
    history.back()
  }, 4096)
</script>