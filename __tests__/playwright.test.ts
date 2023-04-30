import { expect, test } from './playwrightFixtures';

const imageTestId = 'puml-vis-wb-img';
const textTestId = 'puml-vis-wb-txt';

test("code block in GitHub's README", async ({ page }) => {
  await page.goto('https://github.com/WillBooster/plantuml-visualizer/blob/master/puml-sample/README.md');

  await expect(page.getByTestId(imageTestId)).toHaveCount(1);
  await expect(page.getByTestId(textTestId)).toHaveCount(1);

  const image = page.getByTestId(imageTestId).nth(0);
  const text = page.getByTestId(textTestId).nth(0);

  await expect(image).toBeVisible();
  await expect(text).not.toBeVisible();

  await image.dblclick();

  await expect(image).not.toBeVisible();
  await expect(text).toBeVisible();

  await text.dblclick();

  await expect(image).toBeVisible();
  await expect(text).not.toBeVisible();
});

test("code block in GitHub's issue", async ({ page }) => {
  await page.goto('https://github.com/WillBooster/plantuml-visualizer/issues/54');

  await expect(page.getByTestId(imageTestId)).toHaveCount(2);
  await expect(page.getByTestId(textTestId)).toHaveCount(2);

  const firstImage = page.getByTestId(imageTestId).nth(0);
  const firstText = page.getByTestId(textTestId).nth(0);

  await expect(firstImage).toBeVisible();
  await expect(firstText).not.toBeVisible();

  await firstImage.dblclick();

  await expect(firstImage).not.toBeVisible();
  await expect(firstText).toBeVisible();

  await firstText.dblclick();

  await expect(firstImage).toBeVisible();
  await expect(firstText).not.toBeVisible();

  const secondImage = page.getByTestId(imageTestId).nth(1);
  const secondText = page.getByTestId(textTestId).nth(1);

  await expect(secondImage).toBeVisible();
  await expect(secondText).not.toBeVisible();

  await secondImage.dblclick();

  await expect(secondImage).not.toBeVisible();
  await expect(secondText).toBeVisible();

  await secondText.dblclick();

  await expect(secondImage).toBeVisible();
  await expect(secondText).not.toBeVisible();
});

test('file block without preprocessing directive in GitHub', async ({ page }) => {
  await page.goto('https://github.com/WillBooster/plantuml-visualizer/blob/master/puml-sample/class.pu');

  await expect(page.getByTestId(imageTestId)).toHaveCount(1);
  await expect(page.getByTestId(textTestId)).toHaveCount(1);

  const image = page.getByTestId(imageTestId).nth(0);
  const text = page.getByTestId(textTestId).nth(0);

  await expect(image).toBeVisible();
  await expect(text).not.toBeVisible();

  await image.dblclick();

  await expect(image).not.toBeVisible();
  await expect(text).toBeVisible();

  await text.dblclick();

  await expect(image).toBeVisible();
  await expect(text).not.toBeVisible();
});

test('file block with !include directive in GitHub', async ({ page }) => {
  await page.goto('https://github.com/WillBooster/plantuml-visualizer/blob/master/puml-sample/including.pu');

  await expect(page.getByTestId(imageTestId)).toHaveCount(1);
  await expect(page.getByTestId(textTestId)).toHaveCount(1);

  const image = page.getByTestId(imageTestId).nth(0);
  const text = page.getByTestId(textTestId).nth(0);

  await expect(image).toBeVisible();
  await expect(text).not.toBeVisible();

  await image.dblclick();

  await expect(image).not.toBeVisible();
  await expect(text).toBeVisible();

  await text.dblclick();

  await expect(image).toBeVisible();
  await expect(text).not.toBeVisible();
});

test('file block with !includesub directive in GitHub', async ({ page }) => {
  await page.goto('https://github.com/WillBooster/plantuml-visualizer/blob/master/puml-sample/subincluding.pu');

  await expect(page.getByTestId(imageTestId)).toHaveCount(1);
  await expect(page.getByTestId(textTestId)).toHaveCount(1);

  const image = page.getByTestId(imageTestId).nth(0);
  const text = page.getByTestId(textTestId).nth(0);

  await expect(image).toBeVisible();
  await expect(text).not.toBeVisible();

  await image.dblclick();

  await expect(image).not.toBeVisible();
  await expect(text).toBeVisible();

  await text.dblclick();

  await expect(image).toBeVisible();
  await expect(text).not.toBeVisible();
});

test('pull request adding a PlantUML file', async ({ page }) => {
  await page.goto('https://github.com/WillBooster/plantuml-visualizer/pull/49/files');

  const fileDiff = page.locator('[data-details-container-group="file"]');

  await expect(fileDiff.getByText('Nothing', { exact: true })).toHaveCount(1);
  await expect(fileDiff.getByText('Deleted', { exact: true })).toHaveCount(0);

  await expect(fileDiff.getByTestId(imageTestId)).toHaveCount(1);
  await expect(fileDiff.getByTestId(textTestId)).toHaveCount(1);

  const image = fileDiff.getByTestId(imageTestId).nth(0);
  const text = fileDiff.getByTestId(textTestId).nth(0);

  await expect(image).toBeVisible();
  await expect(text).not.toBeVisible();

  await image.dblclick();

  await expect(image).not.toBeVisible();
  await expect(text).toBeVisible();

  await text.dblclick();

  await expect(image).toBeVisible();
  await expect(text).not.toBeVisible();
});

test('pull request deleting a PlantUML file', async ({ page }) => {
  await page.goto('https://github.com/WillBooster/plantuml-visualizer/pull/50/files');

  const fileDiff = page.locator('[data-details-container-group="file"]');

  await expect(fileDiff.getByText('Nothing', { exact: true })).toHaveCount(0);
  await expect(fileDiff.getByText('Deleted', { exact: true })).toHaveCount(1);

  await expect(fileDiff.getByTestId(imageTestId)).toHaveCount(1);
  await expect(fileDiff.getByTestId(textTestId)).toHaveCount(1);

  const image = fileDiff.getByTestId(imageTestId).nth(0);
  const text = fileDiff.getByTestId(textTestId).nth(0);

  await expect(image).toBeVisible();
  await expect(text).not.toBeVisible();

  await image.dblclick();

  await expect(image).not.toBeVisible();
  await expect(text).toBeVisible();

  await text.dblclick();

  await expect(image).toBeVisible();
  await expect(text).not.toBeVisible();
});

test('pull request changing a PlantUML file', async ({ page }) => {
  await page.goto('https://github.com/WillBooster/plantuml-visualizer/pull/24/files');

  const fileDiff = page.locator('[data-details-container-group="file"]');

  await expect(fileDiff.getByText('Nothing', { exact: true })).toHaveCount(0);
  await expect(fileDiff.getByText('Deleted', { exact: true })).toHaveCount(0);

  await expect(fileDiff.getByTestId(imageTestId)).toHaveCount(1);
  await expect(fileDiff.getByTestId(textTestId)).toHaveCount(1);

  const image = fileDiff.getByTestId(imageTestId).nth(0);
  const text = fileDiff.getByTestId(textTestId).nth(0);

  await expect(image).toBeVisible();
  await expect(text).not.toBeVisible();

  await image.dblclick();

  await expect(image).not.toBeVisible();
  await expect(text).toBeVisible();

  await text.dblclick();

  await expect(image).toBeVisible();
  await expect(text).not.toBeVisible();
});

test('pull request renaming a PlantUML file with a little changes', async ({ page }) => {
  await page.goto('https://github.com/WillBooster/plantuml-visualizer/pull/106/files');

  const fileDiff = page.locator('[data-details-container-group="file"]');

  await expect(fileDiff.getByText('Nothing', { exact: true })).toHaveCount(0);
  await expect(fileDiff.getByText('Deleted', { exact: true })).toHaveCount(0);

  await expect(fileDiff.getByTestId(imageTestId)).toHaveCount(1);
  await expect(fileDiff.getByTestId(textTestId)).toHaveCount(1);

  const image = fileDiff.getByTestId(imageTestId).nth(0);
  const text = fileDiff.getByTestId(textTestId).nth(0);

  await expect(image).toBeVisible();
  await expect(text).not.toBeVisible();

  await image.dblclick();

  await expect(image).not.toBeVisible();
  await expect(text).toBeVisible();

  await text.dblclick();

  await expect(image).toBeVisible();
  await expect(text).not.toBeVisible();
});
