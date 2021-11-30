<script>
	import Tex from './Tex.svelte';
	import 'katex/dist/katex.min.css';
	import Button from './Button.svelte';
	import Keypad from './Keypad.svelte';
	import evaluatex from "evaluatex/dist/evaluatex";
	window.evaluatex = evaluatex;
	let texInputs = [];
	let score = 0;
	function evaluateTexString(texString) {
		let newTexString = texString.replaceAll("\\pi", "PI");
		return evaluatex(newTexString, {}, { latex: true })()
	}
	$: {
		try {
			console.log(evaluateTexString(question), evaluateTexString(texInputs.join("")));
		} catch (error) {
			console.log(error);
		}
	}
	function reduce(numerator,denominator){
		// console.log(numerator, denominator);
		for(let i = 6; i > 0; i--){
			if(numerator % i == 0 && denominator % i == 0){
				numerator /= i;
				denominator /= i;
			}
		}
		return [numerator,denominator];
	}
	function generateQuestion(){
		const regularTrig = ['sin', 'cos', 'tan', 'sec', 'csc', 'cot']
		// const inverseTrig = ['asin', 'acos', 'atan', 'asec', 'acsc', 'acot']
		if (Math.random() > 0) {
			let denominator = [1, 4, 6][Math.floor(Math.random() * 3)];
			let numerator = Math.floor(Math.random() * 6 * denominator) + 1;
			[numerator, denominator] = reduce(numerator, denominator);
			const operation = regularTrig[Math.floor(Math.random() * 6)];
			if(numerator == 1) numerator = "";
			let neg = Math.random() > 0.5 ? "-" : "";
			if(denominator == 1){
				return `${operation}(${neg}${numerator}\\pi)`
			} else {
				return `${operation}(${neg}${numerator}\\pi/${denominator})`
			}
		} // else do the inverse trig
	}
	let question = generateQuestion();
	function submitAnswer(){
		let q = evaluateTexString(question)
		if(Math.abs(q) > 1000000 && texInputs.length == 0){
			score++;
		} else {
			try {
				let a = evaluateTexString(texInputs.join(""))
				console.log(q, a);
				if (Math.abs(q - a) < 0.01){
					score++;
				} else {
					score = 0;
				}
			} catch (error) {
				score = 0;
			}
		}
		question = generateQuestion();
		texInputs = [];
	}
</script>

<main>
	<!-- <Button><Tex exp="\sqrt x" /></Button> -->
	<div class="topBar">
		<h1>PopTrig</h1>
		<h1 style="color: var(--accent);">{score}</h1>
		<!-- <p>12 correct &bull; 0:24</p> -->
	</div>
	<p style="margin: 0; text-align: left;">Evaluate. Blank = DNE</p>
	<div class="problem" style="--katex-font-size: 40px"><Tex exp={question} /></div>
	<div class="solution" style="--katex-font-size: 40px"><Tex exp={texInputs.join("")+"{}"} /></div>
	<Keypad 
		on:input={ ({detail:{content}}) => texInputs = [...texInputs, content] }
		on:backspace={ () => texInputs = texInputs.slice(0, -1) }
		on:submit={submitAnswer}
	/>
</main>

<style>
	main {
		/* display: flex; */
		/* flex-direction: column; */
		/* align-items: center; */
		display: grid;
		grid-template-rows: auto auto 1fr 1fr auto;
		grid-template-columns: 1fr;
		gap: 16px;
		width: 600px;
		max-width: 100%;
		/* justify-content: space-between; */
	}
	.solution {
		background-color: var(--accent);
		color: var(--accent-text);
		width: 100%;
		height: auto;
		border-radius: 12px;
	}
	.problem, .solution{
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
	.topBar {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.topBar > * {
		margin: 0;
	}
</style>