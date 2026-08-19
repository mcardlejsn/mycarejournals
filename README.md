# My Care Journals website

Static GitHub Pages website for `mycarejournals.com`.

## Direct APK downloads

The four homepage download buttons use one fixed GitHub Release tag:

```text
downloads
```

Upload the signed APKs to that release using these exact filenames:

| App | Required release filename |
| --- | --- |
| Dementia Journal | `Dementia-Journal.apk` |
| PWS Journal | `PWS-Journal.apk` |
| Medication Routine | `Medication-Routine.apk` |
| Autism Journal | `Autism-Journal.apk` |

The website links do not need to be edited when an APK is added or replaced.
Before replacing an existing APK, delete the old release asset with the same
filename, then upload the newly signed file using that exact filename.

All public APKs must be signed with the app's permanent signing/release key.
Do not upload debug APKs or APKs signed with a Play upload key.
