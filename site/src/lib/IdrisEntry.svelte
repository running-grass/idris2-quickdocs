<script lang="ts">
	import type { SearchItem } from "$lib/search"
	export let selected = false
	export let entry: SearchItem
</script>

<div
	class="indexentry"
	class:selected="{selected}"
	on:click
>
	<div>
		<span class="name">{entry.name}</span>
		<span class="seperator">:</span>
		<span class="type">{entry.typ}</span>
	</div>
	<div>
		<span class="namespace dimmed">{entry.namespace}</span>
		<span class="package dimmed">[{entry.package}]</span>
	</div>
</div>

<style lang="scss">
	.indexentry {
		position: relative;

		> * {
			/* display: block; */
			padding: 4px;
			background-color: inherit;

			color: #000;
			text-decoration: none;
		}


		&:hover {
			background-color: #eee;
		}
	}

	.package {
		float: right;
		text-align: right;
		font-size: 85%;
	}

	.name {
		color: #000;
		font-family: "DejaVu Sans Mono", monospace;
		background-color: inherit;
	}

	.type {
		color: #777;
		font-stretch: condensed;
		line-height: 1;
		margin-top: -6px;
		padding-top: 0;
		padding-bottom: 0;
	}

	.dimmed {
		color: #999;
	}

	.selected,
	.selected:hover {
		background-color: rgb(101, 159, 219);
	}
	.selected .dimmed {
		color: rgb(50, 80, 109);
	}
</style>