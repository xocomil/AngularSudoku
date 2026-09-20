import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
export default {
  framework: {
    name: getAbsolutePath("@storybook/angular"),
    options: {},
  },
  stories: [],
  addons: [getAbsolutePath("@chromatic-com/storybook")],
};

function getAbsolutePath(value) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
