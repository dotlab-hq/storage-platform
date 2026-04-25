# Graph Report - storage-platform  (2026-04-25)

## Corpus Check
- 538 files · ~280,560 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3019 nodes · 5911 edges · 52 communities detected
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 1162 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 108|Community 108]]
- [[_COMMUNITY_Community 220|Community 220]]

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
- `log()` --calls--> `formatFileSize()`  [INFERRED]
  src\lib\logger.ts → src\lib\storage\mutations\urls-import.ts
- `handlePut()` --calls--> `parseObjectTaggingXml()`  [INFERRED]
  src\lib\s3-gateway\s3-dispatch-put.ts → src\lib\s3-gateway\s3-object-tagging.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.01
Nodes (250): __(), AA(), ac(), Ad(), ar(), av(), ax(), b0 (+242 more)

### Community 1 - "Community 1"
Cohesion: 0.02
Nodes (220): listAdminProviderContents(), normalizePrefix(), toFileEntry(), toFolderEntry(), isDefaultAssetsBucketName(), backfillStorageBtree(), toFileEntry(), toFolderEntry() (+212 more)

### Community 2 - "Community 2"
Cohesion: 0.01
Nodes (137): Cache, if(), _a, aa, Ai(), ao(), as(), at() (+129 more)

### Community 3 - "Community 3"
Cohesion: 0.03
Nodes (14): bA, Bh(), Cb(), Dh(), el(), gE(), Gy(), Lo (+6 more)

### Community 4 - "Community 4"
Cohesion: 0.02
Nodes (81): getContextFromEvent(), isApiEvent(), logActivity(), withActivityLogging(), deleteProvider(), isNotFoundPayload(), submitProvider(), toggleProviderAvailability() (+73 more)

### Community 5 - "Community 5"
Cohesion: 0.04
Nodes (89): buildFolderPathOptions(), isDescendantFolder(), GET(), inferS3Operation(), recordS3Audit(), accessKeyForBucket(), accessKeyIdForBucket(), canonicalHeaderCandidates() (+81 more)

### Community 6 - "Community 6"
Cohesion: 0.04
Nodes (73): af(), ef(), ff(), Ja(), lf(), mt(), nf(), of() (+65 more)

### Community 7 - "Community 7"
Cohesion: 0.04
Nodes (21): _t(), be(), ce, ct(), de, _e(), Ee(), fe() (+13 more)

### Community 8 - "Community 8"
Cohesion: 0.03
Nodes (54): downloadFromUrl(), captureScreenshot(), convertBlobUrlToDataUrl(), onDrop(), PromptInputActionAddAttachments(), PromptInputActionAddScreenshot(), useOptionalProviderAttachments(), usePromptInputAttachments() (+46 more)

### Community 9 - "Community 9"
Cohesion: 0.04
Nodes (42): computeFileHash(), computeFilesHashes(), computeFolderHashes(), flattenFileMap(), getFolderNameFromEntry(), resolveUserId(), uploadSingleFileWithProgress(), handleUpload() (+34 more)

### Community 10 - "Community 10"
Cohesion: 0.05
Nodes (6): DE(), Jx(), La(), rv(), computePartSize(), uploadFileWithMultipartPresignedUrl()

### Community 11 - "Community 11"
Cohesion: 0.05
Nodes (43): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), decodeUtf8WithReplacement(), loadTextExcerptForSummary(), toUint8Array(), getFileExtension() (+35 more)

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (12): a_, Ah, AS(), gc(), gs(), k0(), l_, mc() (+4 more)

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (14): Fb(), Io(), Li(), ur(), Vd, yb(), completeJsxTag(), matchJsxTag() (+6 more)

### Community 14 - "Community 14"
Cohesion: 0.07
Nodes (14): _0, b_(), eE, j_(), Ka, ll(), nl(), Oh() (+6 more)

### Community 15 - "Community 15"
Cohesion: 0.09
Nodes (3): _2, E2, fr

### Community 16 - "Community 16"
Cohesion: 0.22
Nodes (4): NS, sd(), Wn(), ia

### Community 17 - "Community 17"
Cohesion: 0.15
Nodes (5): Bo(), Fv(), oc, tS(), Ui

### Community 18 - "Community 18"
Cohesion: 0.11
Nodes (19): loadAuth(), isAdminRole(), normalizeUserRole(), getRequestOrigin(), getViewerClient(), isLoopbackHost(), resolveRequestScopedEndpoint(), resolveS3Endpoint() (+11 more)

### Community 19 - "Community 19"
Cohesion: 0.15
Nodes (2): m0, $t()

### Community 21 - "Community 21"
Cohesion: 0.13
Nodes (12): useChatShellActions(), clampToViewport(), isFileCardTarget(), isShellMenuTarget(), onContextMenu(), onKeyDown(), onPointerDown(), sync() (+4 more)

### Community 22 - "Community 22"
Cohesion: 0.17
Nodes (9): useChatPageData(), useFlatMessages(), useMessagePages(), filterThreads(), normalizeSearchText(), tokenizeQuery(), useFlatThreads(), useThreadPages() (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.18
Nodes (3): NavProjects(), SidebarMenuButton(), useSidebar()

### Community 26 - "Community 26"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 27 - "Community 27"
Cohesion: 0.18
Nodes (5): handleCreateThread(), useChatStoreSync(), updateChatUi(), useChatUiStore(), useStreamChatMessage()

### Community 28 - "Community 28"
Cohesion: 0.22
Nodes (7): detectMimeTypeFromPath(), generateAudio(), toWav(), transcribeAudio(), describeImage(), generateText(), trimReasoning()

### Community 30 - "Community 30"
Cohesion: 0.22
Nodes (2): MicSelector(), useAudioDevices()

### Community 31 - "Community 31"
Cohesion: 0.24
Nodes (3): clearSelection(), handleBulkDelete(), handleBulkRestore()

### Community 33 - "Community 33"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 34 - "Community 34"
Cohesion: 0.25
Nodes (2): newPerson(), shuffle()

### Community 35 - "Community 35"
Cohesion: 0.25
Nodes (2): readApiError(), mutateBucketAction()

### Community 36 - "Community 36"
Cohesion: 0.29
Nodes (3): isSessionExpired(), loadSessionOrThrow(), writeSignalQueue()

### Community 37 - "Community 37"
Cohesion: 0.43
Nodes (4): ConfirmationActions(), ConfirmationRejected(), ConfirmationTitle(), useConfirmation()

### Community 40 - "Community 40"
Cohesion: 0.38
Nodes (4): startScannerWithFallback(), handleInvalidQr(), start(), startScannerWithFallback()

### Community 41 - "Community 41"
Cohesion: 0.33
Nodes (3): FileGrid(), getRect(), useBoxSelection()

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

### Community 55 - "Community 55"
Cohesion: 0.4
Nodes (3): ProviderContentsModal(), loadProviderContents(), useProviderContents()

### Community 59 - "Community 59"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 63 - "Community 63"
Cohesion: 0.5
Nodes (1): Nr

### Community 65 - "Community 65"
Cohesion: 0.67
Nodes (2): getAttachmentLabel(), getMediaCategory()

### Community 67 - "Community 67"
Cohesion: 0.67
Nodes (2): TranscriptionSegment(), useTranscription()

### Community 74 - "Community 74"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 75 - "Community 75"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

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

### Community 220 - "Community 220"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **43 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+38 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 19`** (24 nodes): `m0`, `.constructor()`, `$t()`, `.begin()`, `._cached()`, `._callMatches()`, `._callQuery()`, `._checkSelector()`, `.end()`, `._expandContextForScopeMatching()`, `._getEngine()`, `._hasScopeClause()`, `._markScore()`, `.matches()`, `._matchesEngine()`, `._matchesParents()`, `._matchesSimple()`, `.query()`, `._queryCSS()`, `._queryEngine()`, `._querySimple()`, `.toJSON()`, `.toString()`, `.end()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (10 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorItem()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (8 nodes): `makeData()`, `newPerson()`, `range()`, `shuffle()`, `ShuffleHero()`, `shuffleSquares()`, `shuffle-grid.tsx`, `demo-table-data.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (8 nodes): `use-s3-buckets.helpers.ts`, `use-s3-buckets.mutations.ts`, `parseJson()`, `readApiError()`, `createBucketWithOptimisticUpdate()`, `mutateBucketAction()`, `requestBucketCredentials()`, `rotateBucketCredentials()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (6 nodes): `test-results.tsx`, `formatDuration()`, `TestResultsDuration()`, `TestResultsHeader()`, `TestSuite()`, `TestSuiteName()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (6 nodes): `web-preview.tsx`, `useWebPreview()`, `WebPreview()`, `WebPreviewNavigation()`, `WebPreviewNavigationButton()`, `WebPreviewUrl()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (5 nodes): `T0`, `.constructor()`, `.toJSON()`, `.toSource()`, `.toString()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (5 nodes): `A0`, `.constructor()`, `.toJSON()`, `.toSource()`, `.toString()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (4 nodes): `Nr`, `.ASCIIMatch()`, `.constructor()`, `.toJSON()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (3 nodes): `Xo`, `.constructor()`, `.toSource()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 99`** (3 nodes): `utils.ts`, `getDefaultUntitledName()`, `looksLikeHtml()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 100`** (3 nodes): `cn()`, `formatTime()`, `ai-prompt-box.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 108`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 220`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `mt()` connect `Community 6` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 7`, `Community 12`, `Community 13`, `Community 15`, `Community 16`, `Community 19`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Why does `error()` connect `Community 4` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 6`, `Community 9`, `Community 18`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `Select()` connect `Community 1` to `Community 32`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 10`, `Community 11`, `Community 18`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Are the 82 inferred relationships involving `mt()` (e.g. with `PE()` and `Select()`) actually correct?**
  _`mt()` has 82 INFERRED edges - model-reasoned connections that need verification._
- **Are the 82 inferred relationships involving `Select()` (e.g. with `mt()` and `po()`) actually correct?**
  _`Select()` has 82 INFERRED edges - model-reasoned connections that need verification._
- **Are the 44 inferred relationships involving `handleGet()` (e.g. with `parseAccessKeyId()` and `s3ErrorResponse()`) actually correct?**
  _`handleGet()` has 44 INFERRED edges - model-reasoned connections that need verification._
- **Are the 46 inferred relationships involving `GET()` (e.g. with `._onTestBegin()` and `._onTestPaused()`) actually correct?**
  _`GET()` has 46 INFERRED edges - model-reasoned connections that need verification._