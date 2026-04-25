# Graph Report - storage-platform  (2026-04-25)

## Corpus Check
- 524 files · ~275,316 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2997 nodes · 5899 edges · 51 communities detected
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 1155 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 108|Community 108]]
- [[_COMMUNITY_Community 218|Community 218]]

## God Nodes (most connected - your core abstractions)
1. `mt()` - 99 edges
2. `Select()` - 83 edges
3. `rv()` - 73 edges
4. `handleGet()` - 47 edges
5. `GET()` - 47 edges
6. `update()` - 45 edges
7. `bA` - 40 edges
8. `wA` - 36 edges
9. `r()` - 35 edges
10. `gx()` - 34 edges

## Surprising Connections (you probably didn't know these)
- `Gi()` --calls--> `gx()`  [INFERRED]
  playwright-report\trace\sw.bundle.js → playwright-report\trace\assets\defaultSettingsView-GTWI-W_B.js
- `Xi()` --calls--> `gx()`  [INFERRED]
  playwright-report\trace\sw.bundle.js → playwright-report\trace\assets\defaultSettingsView-GTWI-W_B.js
- `getContextFromEvent()` --calls--> `GET()`  [INFERRED]
  src\lib\activity.ts → src\routes\api\v1\models.ts
- `handlePut()` --calls--> `parseCopySource()`  [INFERRED]
  src\lib\s3-gateway\s3-dispatch-put.ts → src\lib\s3-gateway\s3-request.ts
- `POST()` --calls--> `getToolsByName()`  [INFERRED]
  src\routes\api\v1\chat\completions.ts → src\routes\_app\chat\tools\-tool-registry.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.01
Nodes (288): __(), AA(), ac(), Ad(), ar(), AS(), av(), ax() (+280 more)

### Community 1 - "Community 1"
Cohesion: 0.02
Nodes (256): listAdminProviderContents(), normalizePrefix(), toFileEntry(), toFolderEntry(), isDefaultAssetsBucketName(), backfillStorageBtree(), toFileEntry(), toFolderEntry() (+248 more)

### Community 2 - "Community 2"
Cohesion: 0.01
Nodes (171): af(), ef(), ff(), Ja(), lf(), mt(), nf(), of() (+163 more)

### Community 3 - "Community 3"
Cohesion: 0.03
Nodes (20): closeConnection(), setupPeerConnection(), stopSignalPolling(), bA, Bh(), Cb(), Dh(), el() (+12 more)

### Community 4 - "Community 4"
Cohesion: 0.03
Nodes (39): buildFolderPathOptions(), isDescendantFolder(), GET(), inferS3Operation(), recordS3Audit(), auditResponse(), mapProviderStatusToS3Error(), parseContentLength() (+31 more)

### Community 5 - "Community 5"
Cohesion: 0.03
Nodes (47): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), deleteProvider(), isNotFoundPayload(), setData(), submitProvider() (+39 more)

### Community 6 - "Community 6"
Cohesion: 0.04
Nodes (12): DE(), La(), lb(), or, Ri(), rv(), rx, handleUploadClick() (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.04
Nodes (40): getUserFromApiKey(), hasChatCompletionsScope(), consumeSseEvents(), isRecord(), parseEventPayload(), readLegacyPayload(), readOpenAiPayload(), createDeepAgentGraph() (+32 more)

### Community 8 - "Community 8"
Cohesion: 0.03
Nodes (54): downloadFromUrl(), captureScreenshot(), convertBlobUrlToDataUrl(), onDrop(), PromptInputActionAddAttachments(), PromptInputActionAddScreenshot(), useOptionalProviderAttachments(), usePromptInputAttachments() (+46 more)

### Community 9 - "Community 9"
Cohesion: 0.04
Nodes (42): computeFileHash(), computeFilesHashes(), computeFolderHashes(), flattenFileMap(), getFolderNameFromEntry(), resolveUserId(), uploadSingleFileWithProgress(), handleUpload() (+34 more)

### Community 10 - "Community 10"
Cohesion: 0.05
Nodes (40): _0, b_(), eE, j_(), nl(), Oh(), v_(), W_ (+32 more)

### Community 11 - "Community 11"
Cohesion: 0.05
Nodes (44): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), decodeUtf8WithReplacement(), loadTextExcerptForSummary(), toUint8Array(), getFileExtension() (+36 more)

### Community 12 - "Community 12"
Cohesion: 0.07
Nodes (24): loadAuth(), isAdminRole(), normalizeUserRole(), getRequestOrigin(), getViewerClient(), isLoopbackHost(), resolveRequestScopedEndpoint(), resolveS3Endpoint() (+16 more)

### Community 13 - "Community 13"
Cohesion: 0.14
Nodes (9): a_, Ah, gc(), k0(), l_, mc(), qt, s_ (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.09
Nodes (3): _2, E2, fr

### Community 15 - "Community 15"
Cohesion: 0.22
Nodes (4): NS, sd(), Wn(), ia

### Community 16 - "Community 16"
Cohesion: 0.17
Nodes (3): Bo(), oc, Ui

### Community 17 - "Community 17"
Cohesion: 0.15
Nodes (2): m0, $t()

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
Cohesion: 0.18
Nodes (5): handleCreateThread(), useChatStoreSync(), updateChatUi(), useChatUiStore(), useStreamChatMessage()

### Community 25 - "Community 25"
Cohesion: 0.22
Nodes (7): detectMimeTypeFromPath(), generateAudio(), toWav(), transcribeAudio(), describeImage(), generateText(), trimReasoning()

### Community 27 - "Community 27"
Cohesion: 0.22
Nodes (2): MicSelector(), useAudioDevices()

### Community 28 - "Community 28"
Cohesion: 0.24
Nodes (3): clearSelection(), handleBulkDelete(), handleBulkRestore()

### Community 30 - "Community 30"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 31 - "Community 31"
Cohesion: 0.25
Nodes (2): newPerson(), shuffle()

### Community 32 - "Community 32"
Cohesion: 0.25
Nodes (2): readApiError(), mutateBucketAction()

### Community 33 - "Community 33"
Cohesion: 0.43
Nodes (4): ConfirmationActions(), ConfirmationRejected(), ConfirmationTitle(), useConfirmation()

### Community 36 - "Community 36"
Cohesion: 0.38
Nodes (4): startScannerWithFallback(), handleInvalidQr(), start(), startScannerWithFallback()

### Community 37 - "Community 37"
Cohesion: 0.33
Nodes (3): FileGrid(), getRect(), useBoxSelection()

### Community 40 - "Community 40"
Cohesion: 0.33
Nodes (2): isSessionExpired(), loadSessionOrThrow()

### Community 41 - "Community 41"
Cohesion: 0.33
Nodes (1): if()

### Community 44 - "Community 44"
Cohesion: 0.4
Nodes (2): formatDuration(), TestResultsDuration()

### Community 46 - "Community 46"
Cohesion: 0.4
Nodes (2): useWebPreview(), WebPreviewUrl()

### Community 51 - "Community 51"
Cohesion: 0.4
Nodes (1): T0

### Community 52 - "Community 52"
Cohesion: 0.4
Nodes (1): A0

### Community 56 - "Community 56"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 61 - "Community 61"
Cohesion: 0.5
Nodes (1): Nr

### Community 62 - "Community 62"
Cohesion: 0.67
Nodes (2): getAttachmentLabel(), getMediaCategory()

### Community 64 - "Community 64"
Cohesion: 0.67
Nodes (2): TranscriptionSegment(), useTranscription()

### Community 71 - "Community 71"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 73 - "Community 73"
Cohesion: 0.67
Nodes (2): includesCaseInsensitive(), originMatches()

### Community 74 - "Community 74"
Cohesion: 0.5
Nodes (1): ProviderRequestTimeoutError

### Community 75 - "Community 75"
Cohesion: 0.67
Nodes (2): handleSubmit(), verifyCode()

### Community 76 - "Community 76"
Cohesion: 0.67
Nodes (3): createS3Client(), readFixtureBytes(), readRequiredEnv()

### Community 77 - "Community 77"
Cohesion: 0.67
Nodes (1): Xo

### Community 98 - "Community 98"
Cohesion: 0.67
Nodes (1): getDefaultUntitledName()

### Community 99 - "Community 99"
Cohesion: 0.67
Nodes (1): formatTime()

### Community 108 - "Community 108"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 218 - "Community 218"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **43 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+38 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 17`** (23 nodes): `m0`, `.constructor()`, `$t()`, `.begin()`, `._cached()`, `._callMatches()`, `._callQuery()`, `._checkSelector()`, `.end()`, `._expandContextForScopeMatching()`, `._getEngine()`, `._hasScopeClause()`, `._markScore()`, `.matches()`, `._matchesEngine()`, `._matchesParents()`, `._matchesSimple()`, `.query()`, `._queryCSS()`, `._queryEngine()`, `._querySimple()`, `.toJSON()`, `.toString()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (10 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorItem()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (8 nodes): `makeData()`, `newPerson()`, `range()`, `shuffle()`, `ShuffleHero()`, `shuffleSquares()`, `shuffle-grid.tsx`, `demo-table-data.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (8 nodes): `use-s3-buckets.helpers.ts`, `use-s3-buckets.mutations.ts`, `parseJson()`, `readApiError()`, `createBucketWithOptimisticUpdate()`, `mutateBucketAction()`, `requestBucketCredentials()`, `rotateBucketCredentials()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (7 nodes): `webrtc-server.ts`, `isSessionExpired()`, `isSignalRecordValid()`, `loadSessionOrThrow()`, `parseWebrtcPermission()`, `readSignalQueue()`, `resolveSignalKey()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (6 nodes): `addKeysToTokens()`, `if()`, `isBold()`, `isItalic()`, `isUnderline()`, `code-block.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (6 nodes): `test-results.tsx`, `formatDuration()`, `TestResultsDuration()`, `TestResultsHeader()`, `TestSuite()`, `TestSuiteName()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (6 nodes): `web-preview.tsx`, `useWebPreview()`, `WebPreview()`, `WebPreviewNavigation()`, `WebPreviewNavigationButton()`, `WebPreviewUrl()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (5 nodes): `T0`, `.constructor()`, `.toJSON()`, `.toSource()`, `.toString()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (5 nodes): `A0`, `.constructor()`, `.toJSON()`, `.toSource()`, `.toString()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (4 nodes): `Nr`, `.ASCIIMatch()`, `.constructor()`, `.toJSON()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 71`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 73`** (4 nodes): `headersMatch()`, `includesCaseInsensitive()`, `originMatches()`, `s3-cors.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (4 nodes): `parsePositiveInt()`, `ProviderRequestTimeoutError`, `.constructor()`, `s3-provider-timeout.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (4 nodes): `goToApprove()`, `handleSubmit()`, `verifyCode()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (3 nodes): `Xo`, `.constructor()`, `.toSource()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 98`** (3 nodes): `utils.ts`, `getDefaultUntitledName()`, `looksLikeHtml()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 99`** (3 nodes): `cn()`, `formatTime()`, `ai-prompt-box.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 108`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 218`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `mt()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 6`, `Community 7`, `Community 13`, `Community 14`, `Community 15`, `Community 17`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Why does `error()` connect `Community 5` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 9`, `Community 12`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `log()` connect `Community 5` to `Community 0`, `Community 1`, `Community 11`, `Community 7`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Are the 82 inferred relationships involving `mt()` (e.g. with `PE()` and `Select()`) actually correct?**
  _`mt()` has 82 INFERRED edges - model-reasoned connections that need verification._
- **Are the 82 inferred relationships involving `Select()` (e.g. with `mt()` and `po()`) actually correct?**
  _`Select()` has 82 INFERRED edges - model-reasoned connections that need verification._
- **Are the 44 inferred relationships involving `handleGet()` (e.g. with `parseAccessKeyId()` and `s3ErrorResponse()`) actually correct?**
  _`handleGet()` has 44 INFERRED edges - model-reasoned connections that need verification._
- **Are the 46 inferred relationships involving `GET()` (e.g. with `._onTestBegin()` and `._onTestPaused()`) actually correct?**
  _`GET()` has 46 INFERRED edges - model-reasoned connections that need verification._