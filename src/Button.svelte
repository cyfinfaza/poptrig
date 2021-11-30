<script>
	import {createEventDispatcher} from 'svelte'
	import Tex from './Tex.svelte'
	const dispatch = createEventDispatcher()
	let classlist = [];
	export let accent = false;
	accent && classlist.push('accent');
	// export let tex = null;
	// export let icon = null;
	export let style = null;
	export let pad = false;
	pad && classlist.push('pad');

</script>

<button class={classlist.join(" ")} on:click={_=>dispatch('click')} style={style}>
	<!-- <div> -->
		<slot />
	<!-- </div> -->
</button>

<style>
	button {
		--press: 3px;
		/* padding: 6px; */
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		background-color: var(--fg);
		border: none;
		color: var(--text);
		box-shadow: var(--press) var(--press) 0 0 var(--btn-shadow);
		transition: 60ms;
		/* aspect-ratio: 1; */
	}
	button.pad{
		padding: 12px;
	}
	button.accent {
		background-color: var(--accent);
		color: var(--accent-text);
	}
	button:active {
		box-shadow: 0 0 0 0 var(--btn-shadow);
		transform: translate(var(--press), var(--press));
	}
</style>