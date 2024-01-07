<script>
  import * as PIXI from "pixi.js"

  

  let loader

  onMount(() => {
    loader = new PIXI.Loader()

    app.stage.name = "Stage"
  })

</script>
