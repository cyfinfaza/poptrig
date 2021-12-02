const app = require('express')();
const { Client } = require('pg');
const connectionString = process.env.pg_cs

const client = new Client({ connectionString })
client.connect()

app.get('/api/leaderboard', async (req, res) => {
	let {rows} = await client.query('select highscores.score, auth.users.raw_user_meta_data from highscores inner join auth.users on highscores.owner=auth.users.id order by score DESC')
	let leaderboard = rows.map(row => ({
		name: row.raw_user_meta_data.full_name,
		score: row.score,
		avatar: row.raw_user_meta_data.avatar_url,
	}))
	console.log(leaderboard)
	res.json(leaderboard)
	res.end()
});

module.exports = app;