<script lang="ts">
import { onkeypress } from "./events"

export let src: string

function onload(evt: Event) {
	// @ts-ignore
	(evt.target as HTMLIFrameElement).contentWindow.addEventListener("keypress", onkeypress)
}
// todo: replace iframe with something not as flaky
</script>

<iframe
  src="{src}"
  title="documentation viewer"
  style="width: 100%; height: 100%;"
	on:load="{onload}">Idris documentation page loading...</iframe
>

<style>
iframe {
  border: 0;
}
</style>