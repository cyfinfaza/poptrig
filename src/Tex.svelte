<script>
	import katex from 'katex';
	import { onMount } from 'svelte';
	export let exp;
	let elem;
	$: elem && katex.render(exp, elem, {throwOnError: false});
</script>

<div bind:this={elem}></div>
