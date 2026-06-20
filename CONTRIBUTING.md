# Contributing to pdfkit

## Table of Contents

- [Contributing to pdfkit](#contributing-to-pdfkit)
  - [Table of Contents](#table-of-contents)
  - [Code Organization](#code-organization)
  - [Setting Up the project locally](#setting-up-the-project-locally)
  - [Running and writing tests](#running-and-writing-tests)
  - [Documentation](#documentation)
  - [Submitting a Pull Request](#submitting-a-pull-request)


## Code Organization

pdfkit is organized in the following folders:

- `lib`: The actual source code.
- `js`: The built / distributable code.
- `docs`: Code and artifacts to generate documentation.
- `examples`: Node and browser demos.
- `tests/unit`: Tests behavior of specific classes / methods.
- `tests/visual`: Compare the pdf output against a reference.

**Working on your first Pull Request?** You can learn how from this _free_ series [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github)

## Setting Up the project locally

To install the project you need to have `node`

1.  [Fork](https://help.github.com/articles/fork-a-repo/) the project, clone your fork:

    ```
    # Clone your fork
    git clone https://github.com/<your-username>/pdfkit.git

    # Navigate to the newly cloned directory
    cd pdfkit
    ```

2.  `yarn install` to install dependencies
3.  `yarn build` to build the library
4.  `yarn browserify-example` to build the browser demo (check examples/browserify/browser.html)
5.  `cd examples` and run each of the examples using `node <example-name>.js`
    
> Tip: Keep your `master` branch pointing at the original repository and make
> pull requests from branches on your fork. To do this, run:
>
> ```
> git remote add upstream https://github.com/foliojs/pdfkit.git
> git fetch upstream
> git branch --set-upstream-to=upstream/master master
> ```
>
> This will add the original repository as a "remote" called "upstream,"
> then fetch the git information from that remote, then set your local `master`
> branch to use the upstream master branch whenever you run `git pull`.
> Then you can make all of your pull request branches based on this `master`
> branch. Whenever you want to update your version of `master`, do a regular
> `git pull`.

## Running and writing tests

Tests are run using [Vitest](https://vitest.dev/) and are categorized as unit and visual tests. 

Unit tests check behavior of specific classes / methods isolatedly. It is the preferred type of test.

Visual tests check the pdf image screenshot against a reference stored as snapshots. New visual tests should be added sparingly.


Test commands
* `yarn test`: Run all tests
* `yarn test:unit`: Run unit tests
* `yarn test:visual`: Run visual tests

To write new tests, look for the *.spec.js files at `test/unit` and `test/visual` as examples

> Visual tests should use an embedded font, instead of system fonts, to ensure uniform rendering between different environments

Code style commands

* `yarn lint`: Check code style using eslint
* `yarn format`: Format code using prettier

## Documentation

See `README.md` in the `docs` subdirectory for more information.

## Submitting a Pull Request

Please go through existing issues and pull requests to check if somebody else is already working on it.

Also, make sure to run the tests and lint the code before you commit your changes.

> Tests should be added to check the changed behavior even if is a bug fix.

