<script>
	import Tex from './Tex.svelte'
	import Button from './Button.svelte'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()
	const keys = {
		"1": "1",
		"2": "2",
		"3": "3",
		"4": "4",
		"5": "5",
		"6": "6",
		"7": "7",
		"8": "8",
		"9": "9",
		"0": "0",
		"p": "\\pi",
		"q": "\\sqrt",
		"r": "\\sqrt",
		"-": "-",
		"/": "/",
	}
	window.onkeydown = (e) => {
		// console.log(e.key)
		if(e.key === "Backspace") {
			dispatch('backspace')
		} else if (e.key == "Enter") {
			dispatch('submit')
		} else if (keys[e.key]) {
			dispatch('input', {content: keys[e.key]})
		}
	}
</script>

<div class="keypad">
	{#each [7, 4, 1, 0, 8, 5, 2, "\\pi", 9, 6, 3] as inp}
		<Button on:click={_=>dispatch('input', {content: inp.toString()})}><Tex exp={inp.toString()} /></Button>
	{/each}
	<Button on:click={_=>dispatch('backspace')}><span class="material-icons-outlined">backspace</span></Button>
	<Button on:click={_=>dispatch('input', {content: "-"})}><Tex exp={`-`} /></Button>
	<Button on:click={_=>dispatch('input', {content: "\\sqrt"})}><Tex exp={`\\sqrt{}`} /></Button>
	<Button on:click={_=>dispatch('input', {content: "/"})}><Tex exp="/" /></Button>
	<Button accent={true} on:click={_=>dispatch('submit')}><span class="material-icons-outlined" style="font-size: 24px;">check</span></Button>
</div>

<style>
	.keypad {
		display: grid;
		grid-template-rows: repeat(4, 60px);
		/* grid-template-columns: repeat(4, 40px); */
		grid-auto-flow: column;
		gap: 10px;
		width: 100%;
		--katex-font-size: 2em;
	}
	.material-icons-outlined {
		font-size: 20px;
	}
</style>