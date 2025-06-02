<script lang="ts">
  import { onkeypress, store_queryinput_is_focused, event_queryinput_focus } from "./events";

  /** search - input element */
	export let value: string = ""
  export let primary: boolean = false
  export let placeholder = "Type name of the term here"

  let elInput: HTMLInputElement

  $: {
    if (primary && $event_queryinput_focus !== undefined) {
      elInput.focus()
    }
  }

  function maybe_onkeypress(evt: KeyboardEvent) {
    if (primary) onkeypress(evt)
  }
</script>

<svelte:body on:keypress="{maybe_onkeypress}"/>
<div class="container">
  <input
    type="text"
    placeholder={placeholder}
    bind:this="{elInput}"
    on:focus="{() => $store_queryinput_is_focused = true}"
    on:blur="{() => $store_queryinput_is_focused = false}"
    bind:value="{value}"
  />
  {#if primary}
  <kbd class="key-shortcut">/</kbd>
  {/if}
</div>

<style lang="scss">
.container {
  width: 100%;
  height: 31px;
  flex-shrink: 0;
  background-color: rgb(37, 37, 37);
  /*border-bottom: 3px solid rgb(101, 159, 219);*/
  display: flex;
  flex-direction: row;
  position: relative;

	&:hover .key-shortcut {
		opacity: 0;
	}
}

input {
  width: 100%;
	&:focus + .key-shortcut {
		opacity: 0;
	}
}

.key-shortcut {
  opacity: 1;
  color: rgb(101, 159, 219);
  position: absolute;
  right: 6px;
  top: 6px;
  border: 1px solid rgb(101, 159, 219);
  border-radius: 5px;
  padding: 1px 4px;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.2);
  transition: ease-out;
  transition-duration: 0.1s;
  font-size: 12px;
  background-color: white;
  pointer-events: none;
}
</style>
