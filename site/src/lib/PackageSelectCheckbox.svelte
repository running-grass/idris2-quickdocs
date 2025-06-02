<script lang="ts">
export let group: string[]
export let value: string
export let text: string
export let loaded: boolean
export let ignored: boolean

let checked: boolean
$: checked = group.indexOf(value) != -1


$: dom_name = "pkg_chk_" + value

function onchecked(evt: Event) {
  checked = (evt.target as HTMLInputElement).checked
  if (checked) {
    group = [...group, value]
  } else {
    group = group.filter((v) => v != value)
  }
}
</script>

<div class="package-choice" class:loaded="{loaded}">
	<label for="{dom_name}" class:selected="{checked}" class:ignored={ignored}>{text}</label>
	<input
		type="checkbox"
		id="{dom_name}"
		checked="{checked}"
		on:change="{onchecked}"
		value="{value}"
	/>
</div>

<style lang="scss">
@import 'PackageSelect.css';
label {
  padding: 2px;
}
input[type="checkbox"] {
  display: none;
}
.package-choice {
  white-space: nowrap;
	margin: 2px;
}
</style>
