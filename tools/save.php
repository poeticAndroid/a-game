<?php
  $file = "./scenes/wip.html";
  file_put_contents($file, $_POST["body"]);
?>
<h1>File saved!</h1>
<pre><strong><?php echo($file); ?></strong></pre>
<pre><?php echo(htmlspecialchars($_POST["body"])); ?></pre>
<script>
  setTimeout(() => {
    history.back()
  }, 4096)
</script>