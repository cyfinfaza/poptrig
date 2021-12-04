<script>
	import Tex from './Tex.svelte';
	import 'katex/dist/katex.min.css';
	import * as mathjs from 'mathjs';
	import Button from './Button.svelte';
	import Keypad from './Keypad.svelte';
	import evaluatex from "evaluatex/dist/evaluatex";
	import supabase from './supabaseClient'
	let tgMode;
	try {
		tgMode = JSON.parse(atob(new URLSearchParams(window.location.search).get('tg_play')))
	} catch (error) {
		tgMode = null;
	}
	window.tgMode = tgMode
	let tgShareScoreUrl = null;
	if (tgMode) tgShareScoreUrl = new URLSearchParams(window.location.hash.substring(1)).get("tgShareScoreUrl")
	let user = null;
	$: console.log(user)
	let dbHighScore = Infinity;
	if (!tgMode) {
		supabase.auth.onAuthStateChange(async (event, sess) => {
			user = sess?.user;
			if(user) {
				let hs = await supabase.from("highscores").select("score");
				if (hs.body[0]) {
					dbHighScore = hs.data[0].score;
					if(hs.body[0].score > highScore) highScore = hs.body[0].score;
				} else {
					dbHighScore = 0;
				}
				console.log("db highscore", hs)
			}
		});
	}
	window.evaluatex = evaluatex;
	let texInputs = [];
	let highScore = tgMode ? 0 : window.localStorage.getItem('highScore') || 0;
	if (tgMode) fetch(`/api/tg_play/highscore?u=${tgMode.u}&imref=${tgMode.imref}`).then(res => res.json()).then(res => {
		// if (res.score > highScore) highScore = res.score;
		console.log("tg highscore", res)
		dbHighScore = res.score;
		highScore = res.score;
	});
	let score = 0;
	$: if(score > highScore) highScore = score;
	$: (async (s) => {
		if (!tgMode) window.localStorage.setItem('highScore', s)
		if (s > dbHighScore) {
			console.log("new highscore ", s)
			if (tgMode) {
				const { u, imref } = tgMode;
				await fetch('/api/tg_play/report', { method: 'POST', body: JSON.stringify({ u, imref, s }), headers: { 'Content-Type': 'application/json' } });
			} else if(user) {
				console.log(await supabase.from("highscores").upsert({score: s}))
			}
		}
	})(highScore);
	let leaderboard = null;
	async function getLeaderboard(){
		leaderboard = await (await fetch("/api/leaderboard")).json()
	}
	if (tgMode) getLeaderboard();
	let question;
	let answer;
	let menuOpen = "";
	// $: menuOpen ? document.body.classList.add('menuOpen') : document.body.classList.remove('menuOpen');
	function evaluateTexString(texString) {
		let newTexString = texString.replaceAll("\\pi", "PI").replaceAll(/([0-9])\\/g, "$1*\\");
		return evaluatex(newTexString, {}, { latex: true })()
	}
	$: {
		try {
			console.log(answer, evaluateTexString(texInputs.join("")));
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
		const inverseTrigPossibleQuestions = {
			'sin': ["1/2", "\\sqrt2/2", "\\sqrt3/2", "-1/2", "-\\sqrt2/2", "-\\sqrt3/2", "0", "1", "-1"],
			'csc': ["2", "\\sqrt2", "2\\sqrt3/3", "-2", "-\\sqrt2", "-2\\sqrt3/3", "0", "1", "-1"],
			'cos': ["1/2", "\\sqrt2/2", "\\sqrt3/2", "-1/2", "-\\sqrt2/2", "-\\sqrt3/2", "0", "1", "-1"],
			'sec': ["2", "\\sqrt2", "2\\sqrt3/3", "-2", "-\\sqrt2", "-2\\sqrt3/3", "0", "1", "-1"],
			'tan': ["0", "\\sqrt3/3", "1", "\\sqrt3", "-\\sqrt3/3", "-1", "-\\sqrt3"],
			'cot': ["0", "\\sqrt3", "1", "\\sqrt3/3", "-\\sqrt3", "-1", "-\\sqrt3/3"]
		}
		if (Math.random() > 0.5) {
			let denominator = [1, 4, 6][Math.floor(Math.random() * 3)];
			let numerator = Math.floor(Math.random() * 6 * denominator) + 1;
			[numerator, denominator] = reduce(numerator, denominator);
			const operation = regularTrig[Math.floor(Math.random() * 6)];
			if(numerator == 1) numerator = "";
			let neg = Math.random() > 0.5 ? "-" : "";
			let q;
			if(denominator == 1){
				q = `\\${operation}(${neg}${numerator}\\pi)`
			} else {
				q = `\\${operation}(${neg}${numerator}\\pi/${denominator})`
			}
			let a = evaluateTexString(q);
			question = q;
			answer = a;
		} else {
			let operation = regularTrig[Math.floor(Math.random() * 6)];
			let eqation = inverseTrigPossibleQuestions[operation][Math.floor(Math.random() * inverseTrigPossibleQuestions[operation].length)];
			question = `\\${operation}^{-1}(${eqation})`;
			answer = mathjs["a"+operation](evaluateTexString(eqation));
		}
	}
	generateQuestion();
	function submitAnswer(){
		let q = answer
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
		generateQuestion();
		texInputs = [];
	}
</script>

<main class={menuOpen ? "menuOpen "+menuOpen : ""}>
	<div class="game">
		<div class="vertiPanel">
			<div class="horizSplit">
				<h1>PopTrig</h1>
				{#if tgMode}
					<div class="horizPanel">
						<img src="Telegram_logo.svg" alt style="width: 32px; height: 32px;">
						<span>{tgMode.username}</span>
					</div>
				{:else}
					<div class="horizPanel" style="align-items: stretch;">
						<Button pad on:click={_=>menuOpen="leaderboardMenu"}>Leaderboard</Button>
						{#if user}
							<Button pad on:click={_=>menuOpen="accountMenu"} style="display: flex; align-items: center;">
								<img src={user.user_metadata.avatar_url} alt="" style="width: 24px; height: 24px; border-radius: 50%;" />
								<span style="margin-left: 8px">Me</span>
							</Button>
						{:else}
							<Button pad on:click={_=>menuOpen="accountMenu"}>Sign In</Button>
						{/if}
					</div>
				{/if}
			</div>
			<div class="horizSplit">
				<!-- <div class="vertiPanel">
					<p style="margin: 0; text-align: left;">Evaluate. Blank = DNE</p>
					<p style="margin: 0; text-align: left;">Evaluate. Blank = DNE</p>
				</div> -->
				<span style="font-size: 1.3em;">High Score: <span style="font-weight: bold; font-size: 1.15em;">{highScore}</span></span>
				<span style="color: var(--accent); font-size: 3em; margin: 0; text-align: center; font-weight: bold;">{score}</span>
			</div>
		</div>
		<div class="problem" style="--katex-font-size: 40px"><Tex exp={question} /></div>
		<div class="solution" style="--katex-font-size: 40px"><Tex exp={texInputs.join("")+"{}"} /></div>
		<p style="margin: 0; text-align: center; font-size: 0.9em;">Evaluate the expression. Leave blank if undefined.</p>
		<Keypad 
		on:input={ ({detail:{content}}) => texInputs = [...texInputs, content] }
		on:backspace={ () => texInputs = texInputs.slice(0, -1) }
		on:submit={submitAnswer}
		/>
		<!-- <p style="font-size: 0.7em; margin: 0; text-align: center;">Built by <a href="https://cy2.me">Cy Westbrook</a>. This app is <a href="https://github.com/cyfinfaza/poptrig">open-source</a>.</p> -->
	</div>
	<div class="menu accountMenu vertiPanel" on:blur={_=>menuOpen=false}>
		<div class="horizSplit">
			{#if user}
				<h1>Account</h1>
			{:else}
				<h1>Sign In</h1>
			{/if}
			<Button pad on:click={_=>menuOpen=false}><span class="material-icons" style="font-size: 24px;">close</span></Button>
		</div>
		{#if user}
			<p>Hello, {user.user_metadata.full_name}. Thanks for signing in. Um, there's nothing really to do here, at least not yet. I guess you can sign out if you want...</p>
			<Button pad on:click={async _=>{await supabase.auth.signOut(); window.localStorage.removeItem('highScore'); highScore = 0; dbHighScore=Infinity; score=0;}}>Sign out</Button>
		{:else}
			<p>Sign in to save your high score and be on the leaderboard.</p>
			<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
				<Button pad on:click={_=>supabase.auth.signIn({provider:"google"})}>Sign in with Google</Button>
				<Button pad on:click={_=>supabase.auth.signIn({provider:"discord"})}>Sign in with Discord</Button>
			</div>
		{/if}
	</div>
	<div class="menu leaderboardMenu vertiPanel" on:blur={_=>menuOpen=false}>
		<div class="horizSplit">
			<h1 style="font-size: 1.9em;">Leaderboard</h1>
			<div class="horizPanel">
				<Button pad on:click={_=>{
					leaderboard = null;
					getLeaderboard();
				}}><span class="material-icons" style="font-size: 24px;">refresh</span></Button>
				<Button pad on:click={_=>menuOpen=false}><span class="material-icons" style="font-size: 24px;">close</span></Button>
			</div>
		</div>
		{#if leaderboard}
			{#each leaderboard as entry, i}
				<div class="horizSplit">
					<div class="horizPanel">
						<span>{i+1}.</span>
						<img src={entry.avatar} alt="" style="width: 24px; height: 24px; border-radius: 50%;" />
						<span>{entry.name}</span>
					</div>
					<span style="font-weight: bold;">{entry.score}</span>
				</div>
			{/each}
		{:else} 
			<p>Loading</p>
		{/if}
		<p style="margin: 0; margin-top: 4px; font-size: 0.8em"><b>To my friends who's first thought it is to hack this game:</b> It is very easy to hack this game. Being able to hack this game does not make you cool. Please do not hack this game.</p>
	</div>
</main>

<style>
	main {
		/* display: flex; */
		/* flex-direction: column; */
		/* align-items: center; */
		width: 600px;
		max-width: 100%;
		position: relative;
		--menu-transition: 360ms cubic-bezier(0.89, 0.24, 0, 0.99);
		/* justify-content: space-between; */
	}
	.game {
		display: grid;
		grid-template-rows: auto 1fr 1fr auto auto;
		grid-template-columns: 1fr;
		gap: 16px;
		width: 100%;
		height: 100%;
		transition: var(--menu-transition);
	}
	.menuOpen > .game {
		pointer-events: none;
		filter: blur(28px);
		transform: scale(0.84);
		opacity: 0.5;
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
	.horizSplit {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.horizSplit > * {
		margin: 0;
	}
	.horizPanel {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.vertiPanel {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		/* justify-content: center; */
		/* width: 100%;
		height: 100%; */
		gap: 12px;
	}
	.menu {
		position: absolute;
		top: 0;
		/* right: 12px;
		left: 12px; */
		/* height: 300px; */
		max-height: calc(100vh - 32px);
		width: 100%;
		box-sizing: border-box;
		background-color: var(--bg);
		box-shadow: 0 0 8px 0px #0008;
		border-radius: 12px;
		padding: 24px;
		transition: var(--menu-transition);
		overflow: auto;

		transform: translateY(calc(-100% - 32px));
	}
	/* .menu > *:first-child {
		position: sticky;
		top: 0;
		background-color: var(--bg);
		box-shadow: 0 0 8px 0px var(--bg);
	} */
	.menuOpen.leaderboardMenu > .leaderboardMenu {
		transform: translateY(0);
	}
	.menuOpen.accountMenu > .accountMenu {
		transform: translateY(0);
	}
</style>