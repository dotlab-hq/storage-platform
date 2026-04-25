# Graph Report - storage-platform  (2026-04-25)

## Corpus Check
- 538 files · ~279,251 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3023 nodes · 5919 edges · 52 communities detected
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 1166 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 108|Community 108]]
- [[_COMMUNITY_Community 109|Community 109]]
- [[_COMMUNITY_Community 221|Community 221]]

## God Nodes (most connected - your core abstractions)
1. `mt()` - 99 edges
2. `Select()` - 83 edges
3. `rv()` - 73 edges
4. `handleGet()` - 47 edges
5. `GET()` - 47 edges
6. `update()` - 45 edges
7. `bA` - 40 edges
8. `wA` - 36 edges
9. `error()` - 36 edges
10. `r()` - 35 edges

## Surprising Connections (you probably didn't know these)
- `Gi()` --calls--> `gx()`  [INFERRED]
  playwright-report\trace\sw.bundle.js → playwright-report\trace\assets\defaultSettingsView-GTWI-W_B.js
- `Xi()` --calls--> `gx()`  [INFERRED]
  playwright-report\trace\sw.bundle.js → playwright-report\trace\assets\defaultSettingsView-GTWI-W_B.js
- `formatFileSize()` --calls--> `log()`  [INFERRED]
  src\lib\file-utils.ts → src\lib\logger.ts
- `handlePut()` --calls--> `parseCopySource()`  [INFERRED]
  src\lib\s3-gateway\s3-dispatch-put.ts → src\lib\s3-gateway\s3-request.ts
- `Blob` --calls--> `convertBlobUrlToDataUrl()`  [INFERRED]
  worker-configuration.d.ts → src\components\ai-elements\prompt-input.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.01
Nodes (298): mt(), __(), AA(), ac(), Ad(), aE(), ar(), AS() (+290 more)

### Community 1 - "Community 1"
Cohesion: 0.02
Nodes (262): listAdminProviderContents(), normalizePrefix(), toFileEntry(), toFolderEntry(), isDefaultAssetsBucketName(), backfillStorageBtree(), toFileEntry(), toFolderEntry() (+254 more)

### Community 2 - "Community 2"
Cohesion: 0.01
Nodes (139): main(), _a, aa, Ai(), as(), at(), be(), Bi (+131 more)

### Community 3 - "Community 3"
Cohesion: 0.03
Nodes (21): closeConnection(), setupPeerConnection(), stopSignalPolling(), bA, Bh(), Cb(), Dh(), el() (+13 more)

### Community 4 - "Community 4"
Cohesion: 0.02
Nodes (80): deleteProvider(), isNotFoundPayload(), submitProvider(), toggleProviderAvailability(), getUserFromApiKey(), hasChatCompletionsScope(), createLocalFallbackReply(), generateAssistantReply() (+72 more)

### Community 5 - "Community 5"
Cohesion: 0.03
Nodes (45): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), buildFolderPathOptions(), isDescendantFolder(), GET(), inferS3Operation() (+37 more)

### Community 6 - "Community 6"
Cohesion: 0.03
Nodes (13): DE(), La(), or, Ri(), rv(), rx, $t(), zo() (+5 more)

### Community 7 - "Community 7"
Cohesion: 0.03
Nodes (54): downloadFromUrl(), captureScreenshot(), convertBlobUrlToDataUrl(), onDrop(), PromptInputActionAddAttachments(), PromptInputActionAddScreenshot(), useOptionalProviderAttachments(), usePromptInputAttachments() (+46 more)

### Community 8 - "Community 8"
Cohesion: 0.04
Nodes (42): computeFileHash(), computeFilesHashes(), computeFolderHashes(), flattenFileMap(), getFolderNameFromEntry(), resolveUserId(), uploadSingleFileWithProgress(), handleUpload() (+34 more)

### Community 9 - "Community 9"
Cohesion: 0.06
Nodes (37): _0, b_(), eE, j_(), nl(), Oh(), v_(), W_ (+29 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (10): a_, Ah, gc(), k0(), l_, m0, mc(), mt (+2 more)

### Community 11 - "Community 11"
Cohesion: 0.07
Nodes (24): loadAuth(), isAdminRole(), normalizeUserRole(), getRequestOrigin(), getViewerClient(), isLoopbackHost(), resolveRequestScopedEndpoint(), resolveS3Endpoint() (+16 more)

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (14): Fb(), Io(), Li(), ur(), Vd, yb(), completeJsxTag(), matchJsxTag() (+6 more)

### Community 13 - "Community 13"
Cohesion: 0.08
Nodes (26): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), decodeUtf8WithReplacement(), loadTextExcerptForSummary(), toUint8Array(), getFileExtension() (+18 more)

### Community 14 - "Community 14"
Cohesion: 0.14
Nodes (28): af(), ef(), ff(), Ja(), lf(), nf(), of(), po() (+20 more)

### Community 15 - "Community 15"
Cohesion: 0.1
Nodes (2): _2, E2

### Community 16 - "Community 16"
Cohesion: 0.22
Nodes (4): NS, sd(), Wn(), ia

### Community 17 - "Community 17"
Cohesion: 0.17
Nodes (3): Bo(), oc, Ui

### Community 19 - "Community 19"
Cohesion: 0.13
Nodes (12): useChatShellActions(), clampToViewport(), isFileCardTarget(), isShellMenuTarget(), onContextMenu(), onKeyDown(), onPointerDown(), sync() (+4 more)

### Community 20 - "Community 20"
Cohesion: 0.17
Nodes (9): useChatPageData(), useFlatMessages(), useMessagePages(), filterThreads(), normalizeSearchText(), tokenizeQuery(), useFlatThreads(), useThreadPages() (+1 more)

### Community 22 - "Community 22"
Cohesion: 0.18
Nodes (3): NavProjects(), SidebarMenuButton(), useSidebar()

### Community 24 - "Community 24"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 25 - "Community 25"
Cohesion: 0.18
Nodes (5): handleCreateThread(), useChatStoreSync(), updateChatUi(), useChatUiStore(), useStreamChatMessage()

### Community 26 - "Community 26"
Cohesion: 0.22
Nodes (7): detectMimeTypeFromPath(), generateAudio(), toWav(), transcribeAudio(), describeImage(), generateText(), trimReasoning()

### Community 28 - "Community 28"
Cohesion: 0.22
Nodes (2): MicSelector(), useAudioDevices()

### Community 29 - "Community 29"
Cohesion: 0.24
Nodes (3): clearSelection(), handleBulkDelete(), handleBulkRestore()

### Community 31 - "Community 31"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 32 - "Community 32"
Cohesion: 0.25
Nodes (2): newPerson(), shuffle()

### Community 33 - "Community 33"
Cohesion: 0.25
Nodes (2): readApiError(), mutateBucketAction()

### Community 34 - "Community 34"
Cohesion: 0.43
Nodes (4): ConfirmationActions(), ConfirmationRejected(), ConfirmationTitle(), useConfirmation()

### Community 37 - "Community 37"
Cohesion: 0.38
Nodes (4): startScannerWithFallback(), handleInvalidQr(), start(), startScannerWithFallback()

### Community 40 - "Community 40"
Cohesion: 0.33
Nodes (3): FileGrid(), getRect(), useBoxSelection()

### Community 41 - "Community 41"
Cohesion: 0.33
Nodes (2): isSessionExpired(), loadSessionOrThrow()

### Community 42 - "Community 42"
Cohesion: 0.33
Nodes (1): if()

### Community 45 - "Community 45"
Cohesion: 0.4
Nodes (2): formatDuration(), TestResultsDuration()

### Community 47 - "Community 47"
Cohesion: 0.4
Nodes (2): useWebPreview(), WebPreviewUrl()

### Community 52 - "Community 52"
Cohesion: 0.4
Nodes (1): T0

### Community 53 - "Community 53"
Cohesion: 0.4
Nodes (1): A0

### Community 57 - "Community 57"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 62 - "Community 62"
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
Cohesion: 0.5
Nodes (1): ProviderRequestTimeoutError

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

### Community 108 - "Community 108"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 109 - "Community 109"
Cohesion: 1.0
Nodes (2): escapeXml(), listObjectVersionsXml()

### Community 221 - "Community 221"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **43 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+38 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 15`** (35 nodes): `_2`, `.constructor()`, `.onclose()`, `.onmessage()`, `.onopen()`, `E2`, `.checkBrowsers()`, `.clearCache()`, `.closeGracefully()`, `.constructor()`, `._dispatchEvent()`, `.findRelatedTestFiles()`, `.initialize()`, `.installBrowsers()`, `.isClosed()`, `.listFiles()`, `.listTests()`, `.open()`, `.openNoReply()`, `.ping()`, `.pingNoReply()`, `.resizeTerminal()`, `.resizeTerminalNoReply()`, `.runGlobalSetup()`, `.runGlobalTeardown()`, `.runTests()`, `._sendMessage()`, `._sendMessageNoReply()`, `.startDevServer()`, `.stopDevServer()`, `.stopTests()`, `.stopTestsNoReply()`, `.watch()`, `.watchNoReply()`, `.fire()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (10 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorItem()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (8 nodes): `makeData()`, `newPerson()`, `range()`, `shuffle()`, `ShuffleHero()`, `shuffleSquares()`, `shuffle-grid.tsx`, `demo-table-data.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (8 nodes): `use-s3-buckets.helpers.ts`, `use-s3-buckets.mutations.ts`, `parseJson()`, `readApiError()`, `createBucketWithOptimisticUpdate()`, `mutateBucketAction()`, `requestBucketCredentials()`, `rotateBucketCredentials()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (7 nodes): `webrtc-server.ts`, `isSessionExpired()`, `isSignalRecordValid()`, `loadSessionOrThrow()`, `parseWebrtcPermission()`, `readSignalQueue()`, `resolveSignalKey()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (6 nodes): `addKeysToTokens()`, `if()`, `isBold()`, `isItalic()`, `isUnderline()`, `code-block.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (6 nodes): `test-results.tsx`, `formatDuration()`, `TestResultsDuration()`, `TestResultsHeader()`, `TestSuite()`, `TestSuiteName()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (6 nodes): `web-preview.tsx`, `useWebPreview()`, `WebPreview()`, `WebPreviewNavigation()`, `WebPreviewNavigationButton()`, `WebPreviewUrl()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (5 nodes): `T0`, `.constructor()`, `.toJSON()`, `.toSource()`, `.toString()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (5 nodes): `A0`, `.constructor()`, `.toJSON()`, `.toSource()`, `.toString()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (4 nodes): `Nr`, `.ASCIIMatch()`, `.constructor()`, `.toJSON()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 73`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (4 nodes): `headersMatch()`, `includesCaseInsensitive()`, `originMatches()`, `s3-cors.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (4 nodes): `parsePositiveInt()`, `ProviderRequestTimeoutError`, `.constructor()`, `s3-provider-timeout.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (3 nodes): `Xo`, `.constructor()`, `.toSource()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 99`** (3 nodes): `utils.ts`, `getDefaultUntitledName()`, `looksLikeHtml()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 100`** (3 nodes): `cn()`, `formatTime()`, `ai-prompt-box.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 108`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 109`** (3 nodes): `escapeXml()`, `listObjectVersionsXml()`, `s3-versioning-xml.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 221`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `mt()` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 5`, `Community 6`, `Community 12`, `Community 14`, `Community 16`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Why does `error()` connect `Community 4` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 8`, `Community 11`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `Select()` connect `Community 1` to `Community 0`, `Community 3`, `Community 4`, `Community 6`, `Community 11`, `Community 14`, `Community 30`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Are the 82 inferred relationships involving `mt()` (e.g. with `PE()` and `Select()`) actually correct?**
  _`mt()` has 82 INFERRED edges - model-reasoned connections that need verification._
- **Are the 82 inferred relationships involving `Select()` (e.g. with `mt()` and `po()`) actually correct?**
  _`Select()` has 82 INFERRED edges - model-reasoned connections that need verification._
- **Are the 44 inferred relationships involving `handleGet()` (e.g. with `parseAccessKeyId()` and `s3ErrorResponse()`) actually correct?**
  _`handleGet()` has 44 INFERRED edges - model-reasoned connections that need verification._
- **Are the 46 inferred relationships involving `GET()` (e.g. with `._onTestBegin()` and `._onTestPaused()`) actually correct?**
  _`GET()` has 46 INFERRED edges - model-reasoned connections that need verification._