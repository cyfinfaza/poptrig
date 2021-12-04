const app = require('express')();
const { Client } = require('pg');
const axios = require('axios').default;

// body parser
app.use(require('body-parser').json());

const connectionString = process.env.pg_cs
const client = new Client({ connectionString })
client.connect()

const tbotApiKey = process.env.tb_key

app.get('/api/leaderboard', async (req, res) => {
	let {rows} = await client.query('select highscores.score, auth.users.raw_user_meta_data from highscores inner join auth.users on highscores.owner=auth.users.id order by score DESC')
	let leaderboard = rows.map(row => ({
		name: row.raw_user_meta_data.full_name,
		score: row.score,
		avatar: row.raw_user_meta_data.avatar_url,
	}))
	// console.log(leaderboard)
	res.json(leaderboard)
	res.end()
});

app.post('/api/webhook/tb', async (req, res) => {
	console.log(req.body)
	try {
		if (req.body.inline_query) {
			const queryId = req.body.inline_query.id
			console.log(`${req.body.inline_query.from.username}: ${req.body.inline_query.query}`)
			let data = await axios.get(`https://api.telegram.org/bot${tbotApiKey}/answerInlineQuery`, { 
				params: { 
					inline_query_id: queryId,
					results: JSON.stringify([{
						type: 'game',
						id: 'lol',
						game_short_name: 'poptrig',
					}])
				}
			})
			// console.log(data)
		} else if (req.body.callback_query) {
			const queryId = req.body.callback_query.id
			console.log(`${req.body.callback_query.from.username}: requesting ${req.body.callback_query.game_short_name}`)
			let response = await axios.get(`https://api.telegram.org/bot${tbotApiKey}/answerCallbackQuery`, { 
				params: { 
					callback_query_id: queryId,
					url: "https://poptrig.cy2.me/?tg_play=" + Buffer.from(JSON.stringify({
						u: req.body.callback_query.from.id, 
						imref: req.body.callback_query.inline_message_id, 
						username: req.body.callback_query.from.username
					})).toString('base64')
				}
			})
			console.log(response.data)
		}
	} catch (error) {
		console.error(error.response)
	}
	res.end()
})

app.post('/api/tg_play/report', async (req, res) => {
	console.log(req.body)
	try {
		let { s, u, imref } = req.body
		let response = await axios.get(`https://api.telegram.org/bot${tbotApiKey}/setGameScore`, { 
			params: { 
				user_id: u,
				score: s,
				inline_message_id: imref,
			}
		})
		console.log(response.data)
	} catch (error) {
		console.error(error.response)
	}
	res.end()
})

app.get('/api/tg_play/highscore', async (req, res) => {
	let { u, imref } = req.query
	let response = await axios.get(`https://api.telegram.org/bot${tbotApiKey}/getGameHighScores`, { 
		params: { 
			user_id: u,
			inline_message_id: imref,
		}
	})
	console.log(response.data)
	res.json({score: response.data.result.filter(r => r.user.id == u)[0].score})
	res.end()
})

module.exports = app;