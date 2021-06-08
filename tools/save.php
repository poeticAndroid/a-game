<?php
  $file = "./scenes/wip.html";
  file_put_contents($file, $_POST["body"]);
?>
<h1>File saved!</h1>
<pre><?php echo($file); ?></pre>
<script>
  setTimeout(() => {
    history.back()
  }, 4096)
</script>