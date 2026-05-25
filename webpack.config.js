const path = require("path");

module.exports = (env, argv) => {
	return {
		mode: argv.mode || "development",
		entry: {
			admin: path.resolve(__dirname, "spa/admin/App.jsx"),
			block: path.resolve(__dirname, "blocks/App.jsx"),
			public: path.resolve(__dirname, "spa/public/src/App.jsx"),
			tailwind: path.resolve(__dirname, "assets/css/tailwind.css"),
		},
		output: {
			filename: "[name].build.js",
			path: path.resolve(__dirname, "build"),
		},
		module: {
			rules: [
				{
					test: /\.jsx?$/,
					use: {
						loader: "babel-loader",
						options: {
							presets: [
								[
									"@babel/preset-react",
									{
										runtime: "automatic",
									},
								],
							],
						},
					},
					exclude: /node_modules/,
				},
				{
					test: /\.css$/,
					use: [
						"style-loader",
						"css-loader",
						{
							loader: "postcss-loader",
							options: {
								postcssOptions: {
									ident: "postcss",
									plugins: [
										require("tailwindcss"),
										require("autoprefixer"),
									],
								},
							},
						},
					],
				},
			],
		},
		resolve: {
			extensions: [".js", ".jsx", ".json"],
		},
		devServer: {
			static: {
				directory: path.join(__dirname, "build"),
			},
			compress: true,
			port: 9000,
		},
		devtool: "source-map",
		externals: {
			"@wordpress/blocks": ["wp", "blocks"],
			"@wordpress/block-editor": ["wp", "blockEditor"],
			"@wordpress/element": ["wp", "element"],
			react: "React",
			"react-dom": "ReactDOM",
		},
	};
};
