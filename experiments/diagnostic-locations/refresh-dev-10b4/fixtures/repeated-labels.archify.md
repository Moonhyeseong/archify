# Which payload fields changed? {#payload-fields}

Compare the original synthetic samples by field. This minimized reproduction preserves the repeated first-column labels observed during payload-delta authoring.

## Which field changed? {#changes}

Each row shows one sample change. These first-column labels intentionally repeat to reproduce the authoring failure.

| Kind | Before | After |
| --- | --- | --- |
| modified | string count | number count |
| removed | cursor null | missing |
| modified | original item order | reordered items |
| modified | stock 4 | stock 6 |
| removed | legacy true | missing |
| added | missing | next null |
