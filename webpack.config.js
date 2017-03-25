module.exports = {
	entry: './src/index.js',
	output: {
		path: __dirname + '/dist',
		filename: 'index.js'
	},
	devServer: {
		inline: true,
		port: 8080
	},
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				query: {
					presets: ['es2015', 'react']
				}
			},
			{
				test: /\.scss$/,
				exclude: /node_modules/,
				use: [
					{loader: "style-loader"},
					{loader: "css-loader"},
					{loader: "sass-loader"}
				]
			}
		]
	}
};
