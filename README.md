# AngularSudoku

This is a project to create a Sudoku game using Angular. To run the project locally, follow these steps:

1. Clone the repository from GitHub.
  ```bash
  git clone https://github.com/xocomil/AngularSudoku.git
  ```
2. If you have [volta](https://docs.volta.sh/guide/getting-started) installed, then the `node` version is already pinned.
3. We use [pnpm](https://pnpm.io/installation) as the package manager, so use that to install dependencies.
  ```bash
  pnpm install
  ```
4. We use [nx](https://nx.dev/) to manage the project, so use that to launch the application.
  ```bash
  pnpm nx serve
  ```
5. Navigate to `http://localhost:4200/` in your browser to see the Sudoku game.

![Screenshot 2024-02-22 181914.png](screenshots%2FScreenshot%202024-02-22%20181914.png)

## Features

- [x] Validate the board
- [x] Solve a Sudoku puzzle using wave-function collapse
- [x] Full undo/redo functionality
- [x] Puzzle mode to enter your own puzzles
- [x] Includes full keyboard support including arrow key navigation, `w`, `a`, `s`, `d` for navigation, and `1`-`9` for entering numbers
- [x] Includes a11y support including support for screen readers, tab key and escape key navigation

## Testing

### Unit Tests

Unit tests are done with `nx` and `jest`. To run the unit tests, use the following command:
```bash
pnpm nx run-many --taget=test
```
### Component Tests

Component tests are done with `nx` and `cypress`. To run the component tests, use the following command:
```bash
pnpm nx run-many --target=component-test
```

## Storybook

There is a storybook for the components. To run the storybook, use the following command:
```bash
pnpm nx storybook components
```
