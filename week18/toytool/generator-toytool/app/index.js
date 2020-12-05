const Generators = require('yeoman-generator')

module.exports = class extends Generators {
  constructor(args, opts) {
    super(args, opts)
  }

  async initPackage() {
    const answer = await this.prompt([
      {
        type: "input",
        name: "name",
        message: "Your project name",
        default: this.appname // Default to current folder name
      }
    ])

    const pkgJson = {
      "name": answer.name,
      "version": "1.0.0",
      "description": "",
      "main": "generators/app/index.js",
      "scripts": {
        "test": "mocha --require @babel/register",
        "build": "webpack",
        "coverage": "nyc mocha --require @babel/register"
      },
      "author": "tianlongzhu",
      "license": "ISC",
      "devDependencies": {
      },
      "dependencies": {
      }
    };

    this.fs.extendJSON(this.destinationPath('package.json'), pkgJson)
    this.npmInstall(["vue"], {'save-dev': false})
    this.npmInstall(
      [
        "webpack@4.44.1",
        "webpack-cli",
        "vue-loader@15.9.3",
        "vue-style-loader@4.1.2",
        "css-loader@4.2.2",
        "vue-template-compiler@2.6.12",
        "copy-webpack-plugin@6.0.3",
        "mocha",
        "nyc",
        "@istanbuljs/nyc-config-babel",
        "babel-plugin-istanbul",
        "@babel/core",
        "@babel/preset-env",
        "@babel/register",
        "babel-loader"
      ],
      {"save-dev": true}
    )

    this.fs.copyTpl(
      this.templatePath('sample-test.js'),
      this.destinationPath('test/sample-test.js'),
    )

    this.fs.copyTpl(
      this.templatePath('.babelrc'),
      this.destinationPath('.babelrc'),
    )

    this.fs.copyTpl(
      this.templatePath('.nycrc'),
      this.destinationPath('.nycrc'),
    )

    this.fs.copyTpl(
      this.templatePath('HelloWorld.vue'),
      this.destinationPath('src/HelloWorld.vue'),
    )

    this.fs.copyTpl(
      this.templatePath('webpack.config.js'),
      this.destinationPath('webpack.config.js'),
    )

    this.fs.copyTpl(
      this.templatePath('main.js'),
      this.destinationPath('src/main.js'),
    )

    this.fs.copyTpl(
      this.templatePath('index.html'),
      this.destinationPath('src/index.html'),
      { title: answer.name }
    )
  }

}