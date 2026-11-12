import type { Article } from "@/lib/writing-types";

export const evaluation: Article = {
  slug: "the-number-that-was-too-good",
  title: "Applied AI: Data Leakage, Grouped Splits and Trustworthy Evaluation",
  dek: "Three ML projects, three leaks: duplicate MRI scans, overlapping sensor windows and a label written in the text. What I found, how I removed them, and what the honest numbers look like.",
  category: "Applied AI",
  date: "Nov 2026",
  projects: ["brain-tumor-classification", "activity-recognition", "ptsd-text-screening"],
  tags: ["Model evaluation", "Data leakage", "Cross-validation", "Statistical testing"],
  body: [
    {
      type: "p",
      text: "When I rebuilt three of my older ML projects in 2026, each one had a number that looked great and turned out to be measuring the wrong thing. None of them involved a modelling mistake. In every case the test set was leaking information the model could never have in real use. This is how I found each leak, what I did about it, and what the numbers look like once it is gone.",
    },
    {
      type: "stats",
      items: [
        { value: "66%", label: "of MRI test images had a copy in the training set" },
        { value: "98.4 → 86.3%", label: "activity accuracy once test users are unseen" },
        { value: "≈ 4 pts", label: "of PTSD accuracy came from the label appearing in the text" },
      ],
    },
    { type: "h2", text: "Leak 1: the same MRI, twice" },
    {
      type: "p",
      text: "The public brain MRI dataset comes with its own Training and Testing folders, and most results online use them as given. I hashed every image with a 64-bit perceptual hash and compared Hamming distances. Distances of 0 to 2 are the same image re-encoded, resized or re-cropped; 4 to 6 are mostly adjacent slices of the same scan; 8 and up are mostly unrelated. I checked those bands by eye before trusting them.",
    },
    {
      type: "p",
      text: "259 of the 394 original test images, 66%, had a near-identical copy in the training folder. A model can score well on that test set by remembering pictures.",
    },
    {
      type: "list",
      items: [
        "Duplicates were merged with union-find, keeping the highest-resolution copy: 554 copies removed.",
        "3 clusters contained the same image under different labels. All 12 of those images were dropped rather than guessed.",
        "Of 3,264 downloaded images, 2,698 remained. The healthy class shrank the most, from 500 to 298.",
        "Images within distance 6 of each other were grouped, and whole groups were assigned to splits with `StratifiedGroupKFold`, so adjacent slices of one scan cannot land on both sides.",
        "The data preparation script asserts zero near-duplicate pairs across the final splits, so the leak cannot quietly come back.",
      ],
    },
    {
      type: "table",
      head: ["Model", "Params", "Accuracy", "ROC-AUC"],
      rows: [
        ["Small CNN", "0.40M", "94.6% (92.2 to 96.6)", "0.978"],
        ["MobileNetV2", "2.26M", "94.6%", "0.993"],
      ],
      caption: "386 held-out images. Intervals are 95% bootstraps over 2,000 stratified resamples. One training run per model.",
    },
    {
      type: "p",
      text: "Those are good numbers, but I would not oversell them. There are only 42 healthy images in the test set, so the CNN's specificity interval runs from 83% to 100%. There are no patient IDs, so hash grouping is a proxy, and the result may still be optimistic. And one experiment made things worse: temperature scaling increased calibration error for both models, so I reported that instead of quietly dropping it.",
    },
    { type: "h2", text: "Leak 2: windows that share half their data" },
    {
      type: "p",
      text: "Activity recognition from a phone accelerometer works on windows: 80 samples (4 seconds) with a 40-sample step, so every window overlaps its neighbour by half. Split those windows randomly and almost every test window shares half its samples with a training window, and every test person also appears in training.",
    },
    {
      type: "table",
      head: ["Model", "Random split", "Unseen people", "Gap"],
      rows: [
        ["Logistic regression", "93.3%", "85.7%", "7.6 pts"],
        ["Random forest", "97.9%", "86.8%", "11.2 pts"],
        ["1D-CNN", "99.4%", "85.7%", "13.8 pts"],
        ["LSTM", "98.4%", "86.3%", "12.0 pts"],
      ],
      caption: "Same models, same data. The only difference is whether the test subjects appear in training.",
    },
    {
      type: "p",
      text: "The gap grows with model capacity, which is the signature of memorisation: the more a model can memorise, the more the random split flatters it. The question that matters is how well the model works for a new person, so the subject-wise split is the honest number. Under grouped 5-fold cross-validation by person, a random forest on 95 hand-crafted features averaged 85.2% (±4.6), and the LSTM came last at 80.8%.",
    },
    {
      type: "callout",
      label: "A correction to myself",
      text: "My old resume claimed 92% for this project. That number was not reproduced on held-out subjects, and the README says so.",
    },
    {
      type: "p",
      text: "The model still shipped: a 108 KB int8 TensorFlow Lite build at 86.2%, an ONNX build in the browser that matches Python to within 4.2e-7, and an Android build that reproduced 86.33% on all 5,237 test windows on an emulator. A test asserts that the README quotes the same numbers as the metrics file, so the write-up cannot drift from the results.",
    },
    { type: "h2", text: "Leak 3: the answer is in the question" },
    {
      type: "p",
      text: "The PTSD-language project classifies forum posts. The original clinical notes cannot be published, so the rebuild uses public Reddit posts and a narrower, clearly stated task: detecting PTSD-related language, not screening people. The shortcut was obvious once I looked: 57.8% of posts from the PTSD forum name the condition. A model that learns to spot the word scores well and has learned nothing useful.",
    },
    {
      type: "list",
      items: [
        "Any word containing \"ptsd\", and the phrase \"post traumatic stress (disorder)\", is masked before training.",
        "Masking costs about 4 accuracy points (0.902 unmasked against 0.863 masked for the same logistic regression). That is the size of the shortcut.",
        "Splits are grouped by author, so nobody's writing style appears on both sides. Word2Vec is trained on the training split only.",
      ],
    },
    {
      type: "table",
      head: ["Model", "Accuracy", "ROC-AUC"],
      rows: [
        ["Soft-vote ensemble", "0.873", "0.947"],
        ["Majority-vote ensemble", "0.868", "0.909"],
        ["TF-IDF logistic regression", "0.863", "0.941"],
        ["Fine-tuned DistilRoBERTa", "0.919", "0.972"],
      ],
      caption: "1,526 test posts from authors never seen in training.",
    },
    {
      type: "p",
      text: "The ensemble was the method the original project was built around, and McNemar's test says it is not measurably better than its strongest member (majority vote against TF-IDF logistic regression: p = 0.42). A fine-tuned DistilRoBERTa beats the majority-vote ensemble by about 5 points. I kept the ensemble as the project's method and reported plainly that it is not the best model.",
    },
    {
      type: "p",
      text: "Error analysis by community was the most sobering part. The false positive rate is 17.1% on other mental-health forums and 4.5% on general ones, reaching 38% on some. The model has partly learned to detect mental-health discussion in general, which is exactly the kind of thing that would hurt real users if anyone mistook this for a screening tool.",
    },
    { type: "h2", text: "What I do by default now" },
    {
      type: "list",
      ordered: true,
      items: [
        "Ask what the model will see in real use, then make the split match: new patients, new people, new authors.",
        "Look for duplicates and near-duplicates before trusting any provided split.",
        "Find the shortcut on purpose, remove it, and report how much it was worth.",
        "Report intervals, not single numbers, and test whether a fancier model is actually better.",
        "Publish the negative results and the limitations next to the headline number.",
      ],
    },
    {
      type: "p",
      text: "Each project's demo also runs entirely in the browser, with the browser's predictions checked against Python in CI. For the PTSD demo, a Playwright test records every request and confirms that no typed text ever leaves the page.",
    },
  ],
};
