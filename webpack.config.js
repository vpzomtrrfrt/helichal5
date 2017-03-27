var webpack = require('webpack');

module.exports = function(env) {
	var tr = {
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
	if(env === "production") {
		tr.plugins = [
			new webpack.LoaderOptionsPlugin({
				minimize: true,
				debug: false
			}),
			new webpack.DefinePlugin({
				'process.env': {
					NODE_ENV: '"production"'
				}
			}),
			new webpack.optimize.UglifyJsPlugin({
				mangle: {
					screw_ie8: true
				},
				compress: {
					screw_ie8: true
				},
				comments: false
			})
		];
	}
	return tr;
};
