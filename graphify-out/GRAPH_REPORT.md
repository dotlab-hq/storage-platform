# Graph Report - storage-platform  (2026-04-25)

## Corpus Check
- 522 files · ~274,902 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2984 nodes · 5870 edges · 52 communities detected
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 1144 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 109|Community 109]]
- [[_COMMUNITY_Community 219|Community 219]]

## God Nodes (most connected - your core abstractions)
1. `mt()` - 99 edges
2. `Select()` - 83 edges
3. `rv()` - 73 edges
4. `handleGet()` - 47 edges
5. `GET()` - 46 edges
6. `update()` - 45 edges
7. `bA` - 40 edges
8. `wA` - 36 edges
9. `r()` - 35 edges
10. `gx()` - 34 edges

## Surprising Connections (you probably didn't know these)
- `gx()` --calls--> `Gi()`  [INFERRED]
  playwright-report\trace\assets\defaultSettingsView-GTWI-W_B.js → playwright-report\trace\sw.bundle.js
- `gx()` --calls--> `Xi()`  [INFERRED]
  playwright-report\trace\assets\defaultSettingsView-GTWI-W_B.js → playwright-report\trace\sw.bundle.js
- `getContextFromEvent()` --calls--> `GET()`  [INFERRED]
  src\lib\activity.ts → src\routes\api\v1\models.ts
- `formatFileSize()` --calls--> `log()`  [INFERRED]
  src\lib\file-utils.ts → src\lib\logger.ts
- `handlePut()` --calls--> `parseObjectTaggingXml()`  [INFERRED]
  src\lib\s3-gateway\s3-dispatch-put.ts → src\lib\s3-gateway\s3-object-tagging.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.01
Nodes (277): __(), AA(), ac(), Ad(), ar(), AS(), av(), ax() (+269 more)

### Community 1 - "Community 1"
Cohesion: 0.01
Nodes (178): withActivityLogging(), af(), ef(), ff(), Ja(), lf(), mt(), nf() (+170 more)

### Community 2 - "Community 2"
Cohesion: 0.02
Nodes (211): listAdminProviderContents(), normalizePrefix(), toFileEntry(), toFolderEntry(), isDefaultAssetsBucketName(), backfillStorageBtree(), toFileEntry(), toFolderEntry() (+203 more)

### Community 3 - "Community 3"
Cohesion: 0.03
Nodes (17): bA, Bh(), Cb(), Dh(), el(), gE(), Gy(), iE() (+9 more)

### Community 4 - "Community 4"
Cohesion: 0.03
Nodes (106): buildFolderPathOptions(), isDescendantFolder(), GET(), bucketAclXml(), ensureBucketAcl(), escapeXml(), getBucketAclXml(), getObjectAclXml() (+98 more)

### Community 5 - "Community 5"
Cohesion: 0.02
Nodes (57): getContextFromEvent(), isApiEvent(), logActivity(), deleteProvider(), isNotFoundPayload(), setData(), submitProvider(), toggleProviderAvailability() (+49 more)

### Community 6 - "Community 6"
Cohesion: 0.04
Nodes (21): _t(), be(), ce, ct(), de, _e(), Ee(), fe() (+13 more)

### Community 7 - "Community 7"
Cohesion: 0.04
Nodes (12): DE(), La(), lb(), or, Ri(), rv(), rx, handleUploadClick() (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.04
Nodes (42): consumeSseEvents(), isRecord(), parseEventPayload(), readLegacyPayload(), readOpenAiPayload(), closeConnection(), setupPeerConnection(), stopSignalPolling() (+34 more)

### Community 9 - "Community 9"
Cohesion: 0.03
Nodes (54): downloadFromUrl(), captureScreenshot(), convertBlobUrlToDataUrl(), onDrop(), PromptInputActionAddAttachments(), PromptInputActionAddScreenshot(), useOptionalProviderAttachments(), usePromptInputAttachments() (+46 more)

### Community 10 - "Community 10"
Cohesion: 0.13
Nodes (10): a_, Ah, gc(), k0(), l_, mc(), qt, r() (+2 more)

### Community 11 - "Community 11"
Cohesion: 0.07
Nodes (24): loadAuth(), isAdminRole(), normalizeUserRole(), getRequestOrigin(), getViewerClient(), isLoopbackHost(), resolveRequestScopedEndpoint(), resolveS3Endpoint() (+16 more)

### Community 12 - "Community 12"
Cohesion: 0.06
Nodes (13): _0, b_(), eE, j_(), Ka, ll(), nl(), Oh() (+5 more)

### Community 13 - "Community 13"
Cohesion: 0.09
Nodes (3): _2, E2, fr

### Community 14 - "Community 14"
Cohesion: 0.08
Nodes (26): computeFileHash(), computeFilesHashes(), computeFolderHashes(), flattenFileMap(), getFolderNameFromEntry(), resolveUserId(), uploadSingleFileWithProgress(), uploadFolder() (+18 more)

### Community 15 - "Community 15"
Cohesion: 0.09
Nodes (23): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+15 more)

### Community 16 - "Community 16"
Cohesion: 0.22
Nodes (4): NS, sd(), Wn(), ia

### Community 17 - "Community 17"
Cohesion: 0.17
Nodes (3): Bo(), oc, Ui

### Community 18 - "Community 18"
Cohesion: 0.17
Nodes (1): $t()

### Community 20 - "Community 20"
Cohesion: 0.13
Nodes (12): useChatShellActions(), clampToViewport(), isFileCardTarget(), isShellMenuTarget(), onContextMenu(), onKeyDown(), onPointerDown(), sync() (+4 more)

### Community 21 - "Community 21"
Cohesion: 0.13
Nodes (5): mapBreadcrumbs(), mapItems(), useUploadStore(), mapInitialData(), useStorageData()

### Community 22 - "Community 22"
Cohesion: 0.17
Nodes (9): useChatPageData(), useFlatMessages(), useMessagePages(), filterThreads(), normalizeSearchText(), tokenizeQuery(), useFlatThreads(), useThreadPages() (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.18
Nodes (3): NavProjects(), SidebarMenuButton(), useSidebar()

### Community 26 - "Community 26"
Cohesion: 0.18
Nodes (5): handleCreateThread(), useChatStoreSync(), updateChatUi(), useChatUiStore(), useStreamChatMessage()

### Community 27 - "Community 27"
Cohesion: 0.22
Nodes (7): detectMimeTypeFromPath(), generateAudio(), toWav(), transcribeAudio(), describeImage(), generateText(), trimReasoning()

### Community 29 - "Community 29"
Cohesion: 0.22
Nodes (2): MicSelector(), useAudioDevices()

### Community 30 - "Community 30"
Cohesion: 0.24
Nodes (3): clearSelection(), handleBulkDelete(), handleBulkRestore()

### Community 32 - "Community 32"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 33 - "Community 33"
Cohesion: 0.25
Nodes (2): newPerson(), shuffle()

### Community 34 - "Community 34"
Cohesion: 0.25
Nodes (2): readApiError(), mutateBucketAction()

### Community 35 - "Community 35"
Cohesion: 0.43
Nodes (4): ConfirmationActions(), ConfirmationRejected(), ConfirmationTitle(), useConfirmation()

### Community 38 - "Community 38"
Cohesion: 0.33
Nodes (3): FileGrid(), getRect(), useBoxSelection()

### Community 41 - "Community 41"
Cohesion: 0.33
Nodes (2): isSessionExpired(), loadSessionOrThrow()

### Community 42 - "Community 42"
Cohesion: 0.38
Nodes (4): startScannerWithFallback(), handleInvalidQr(), start(), startScannerWithFallback()

### Community 43 - "Community 43"
Cohesion: 0.33
Nodes (1): if()

### Community 46 - "Community 46"
Cohesion: 0.4
Nodes (2): formatDuration(), TestResultsDuration()

### Community 48 - "Community 48"
Cohesion: 0.4
Nodes (2): useWebPreview(), WebPreviewUrl()

### Community 53 - "Community 53"
Cohesion: 0.4
Nodes (1): T0

### Community 54 - "Community 54"
Cohesion: 0.4
Nodes (1): A0

### Community 58 - "Community 58"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 63 - "Community 63"
Cohesion: 0.5
Nodes (1): Nr

### Community 64 - "Community 64"
Cohesion: 0.67
Nodes (2): getAttachmentLabel(), getMediaCategory()

### Community 66 - "Community 66"
Cohesion: 0.67
Nodes (2): TranscriptionSegment(), useTranscription()

### Community 73 - "Community 73"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 75 - "Community 75"
Cohesion: 0.67
Nodes (2): includesCaseInsensitive(), originMatches()

### Community 76 - "Community 76"
Cohesion: 0.67
Nodes (2): handleSubmit(), verifyCode()

### Community 77 - "Community 77"
Cohesion: 0.67
Nodes (3): createS3Client(), readFixtureBytes(), readRequiredEnv()

### Community 78 - "Community 78"
Cohesion: 0.67
Nodes (1): Xo

### Community 99 - "Community 99"
Cohesion: 0.67
Nodes (1): getDefaultUntitledName()

### Community 100 - "Community 100"
Cohesion: 0.67
Nodes (1): formatTime()

### Community 109 - "Community 109"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 219 - "Community 219"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **43 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+38 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 18`** (22 nodes): `$t()`, `.begin()`, `._cached()`, `._callMatches()`, `._callQuery()`, `._checkSelector()`, `.end()`, `._expandContextForScopeMatching()`, `._getEngine()`, `._hasScopeClause()`, `._markScore()`, `.matches()`, `._matchesEngine()`, `._matchesParents()`, `._matchesSimple()`, `.query()`, `._queryCSS()`, `._queryEngine()`, `._querySimple()`, `.toJSON()`, `.toString()`, `.end()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (10 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorItem()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (8 nodes): `makeData()`, `newPerson()`, `range()`, `shuffle()`, `ShuffleHero()`, `shuffleSquares()`, `shuffle-grid.tsx`, `demo-table-data.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (8 nodes): `use-s3-buckets.helpers.ts`, `use-s3-buckets.mutations.ts`, `parseJson()`, `readApiError()`, `createBucketWithOptimisticUpdate()`, `mutateBucketAction()`, `requestBucketCredentials()`, `rotateBucketCredentials()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (7 nodes): `webrtc-server.ts`, `isSessionExpired()`, `isSignalRecordValid()`, `loadSessionOrThrow()`, `parseWebrtcPermission()`, `readSignalQueue()`, `resolveSignalKey()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (6 nodes): `addKeysToTokens()`, `if()`, `isBold()`, `isItalic()`, `isUnderline()`, `code-block.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (6 nodes): `test-results.tsx`, `formatDuration()`, `TestResultsDuration()`, `TestResultsHeader()`, `TestSuite()`, `TestSuiteName()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (6 nodes): `web-preview.tsx`, `useWebPreview()`, `WebPreview()`, `WebPreviewNavigation()`, `WebPreviewNavigationButton()`, `WebPreviewUrl()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (5 nodes): `T0`, `.constructor()`, `.toJSON()`, `.toSource()`, `.toString()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (5 nodes): `A0`, `.constructor()`, `.toJSON()`, `.toSource()`, `.toString()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (4 nodes): `Nr`, `.ASCIIMatch()`, `.constructor()`, `.toJSON()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 73`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (4 nodes): `headersMatch()`, `includesCaseInsensitive()`, `originMatches()`, `s3-cors.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (4 nodes): `goToApprove()`, `handleSubmit()`, `verifyCode()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (3 nodes): `Xo`, `.constructor()`, `.toSource()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 99`** (3 nodes): `utils.ts`, `getDefaultUntitledName()`, `looksLikeHtml()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 100`** (3 nodes): `cn()`, `formatTime()`, `ai-prompt-box.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 109`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 219`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `mt()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 6`, `Community 7`, `Community 8`, `Community 10`, `Community 13`, `Community 16`, `Community 18`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Why does `Select()` connect `Community 2` to `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 7`, `Community 11`, `Community 31`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `handleGet()` connect `Community 4` to `Community 0`, `Community 2`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Are the 82 inferred relationships involving `mt()` (e.g. with `PE()` and `Select()`) actually correct?**
  _`mt()` has 82 INFERRED edges - model-reasoned connections that need verification._
- **Are the 82 inferred relationships involving `Select()` (e.g. with `mt()` and `po()`) actually correct?**
  _`Select()` has 82 INFERRED edges - model-reasoned connections that need verification._
- **Are the 44 inferred relationships involving `handleGet()` (e.g. with `parseAccessKeyId()` and `s3ErrorResponse()`) actually correct?**
  _`handleGet()` has 44 INFERRED edges - model-reasoned connections that need verification._
- **Are the 45 inferred relationships involving `GET()` (e.g. with `._onTestBegin()` and `._onTestPaused()`) actually correct?**
  _`GET()` has 45 INFERRED edges - model-reasoned connections that need verification._