# Graph Report - storage-platform  (2026-04-28)

## Corpus Check
- 2525 files · ~2,322,310 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 14618 nodes · 45437 edges · 68 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 15406 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 122|Community 122]]
- [[_COMMUNITY_Community 240|Community 240]]

## God Nodes (most connected - your core abstractions)
1. `logForDebugging()` - 796 edges
2. `logError()` - 347 edges
3. `logEvent()` - 338 edges
4. `GET()` - 322 edges
5. `String()` - 203 edges
6. `jsonStringify()` - 200 edges
7. `errorMessage()` - 184 edges
8. `isEnvTruthy()` - 175 edges
9. `getFsImplementation()` - 166 edges
10. `getGlobalConfig()` - 141 edges

## Surprising Connections (you probably didn't know these)
- `getSkills()` --calls--> `getBundledSkills()`  [INFERRED]
  claude-code-source-main\src\commands.ts → claude-code-source-main\src\skills\bundledSkills.ts
- `getMcpSkillCommands()` --calls--> `getSkillListingAttachments()`  [INFERRED]
  claude-code-source-main\src\commands.ts → claude-code-source-main\src\utils\attachments.ts
- `round()` --calls--> `tokenStatsToStatsigMetrics()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\contextAnalysis.ts
- `round()` --calls--> `computeTargetDims()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → claude-code-source-main\src\utils\computerUse\executor.ts
- `round()` --calls--> `formatRelativeDate()`  [INFERRED]
  claude-code-source-main\src\cost-tracker.ts → src\components\ai-elements\commit.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (355): getAgentModelOptions(), extractTranscript(), logContainsQuery(), getSettingsWithAllErrors(), uniq(), AskUserQuestionResultMessage(), InvalidApiKeyMessage(), countAutoModeAttachmentsSinceLastExit() (+347 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (1369): getAddDirEnabledPlugins(), getAddDirExtraMarketplaces(), optionForPermissionSaveDestination(), checkAdminRequestEligibility(), createAdminRequest(), getMyAdminRequests(), agenticSessionSearch(), readJsonFile() (+1361 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (826): getContextFromEvent(), isApiEvent(), logActivity(), ActivityManager, deleteProvider(), resetProviderForm(), startEditingProvider(), submitProvider() (+818 more)

### Community 3 - "Community 3"
Cohesion: 0.01
Nodes (430): af(), ef(), ff(), Ja(), lf(), mt(), nf(), of() (+422 more)

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (747): registerMcpAddCommand(), call(), canUserConfigureAdvisor(), getAdvisorConfig(), getAdvisorUsage(), getExperimentAdvisorModels(), getInitialAdvisorSetting(), isAdvisorEnabled() (+739 more)

### Community 5 - "Community 5"
Cohesion: 0.0
Nodes (528): AddPermissionRules(), getAgentModelDisplay(), AgentEditor(), getNewRelativeAgentFilePath(), getRelativeAgentDirectoryPath(), AgentNavigationFooter(), call(), AgentsMenu() (+520 more)

### Community 6 - "Community 6"
Cohesion: 0.01
Nodes (380): App, handleMouseEvent(), processKeysInBatch(), resumeHandler(), shouldSkipVersion(), BaseTextInput(), getBidi(), hasRTLCharacters() (+372 more)

### Community 7 - "Community 7"
Cohesion: 0.01
Nodes (506): createAbortController(), createChildAbortController(), runWithAgentContext(), getActualRelativeAgentFilePath(), getLocalAgentMemoryDir(), getMemoryScopeDisplay(), getSessionMessages(), createApiQueryHook() (+498 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (464): isAgentMemoryPath(), parseArguments(), substituteArguments(), applyVarToScope(), checkSemantics(), collectCommands(), collectCommandSubstitution(), containsAnyPlaceholder() (+456 more)

### Community 9 - "Community 9"
Cohesion: 0.01
Nodes (309): formatAgentId(), parseAgentId(), getTaskReminderAttachments(), getTeamContextAttachment(), getTeammateMailboxAttachments(), openPath(), ComputerUseTccPanel(), getSwarmSocketName() (+301 more)

### Community 10 - "Community 10"
Cohesion: 0.01
Nodes (192): formatTime(), finalizeHook(), AuthenticationCancelledError, ClaudeAuthProvider, clearMcpClientConfig(), clearServerTokensFromLocalStorage(), createAuthFetch(), fetchAuthServerMetadata() (+184 more)

### Community 11 - "Community 11"
Cohesion: 0.01
Nodes (267): countToolUses(), emitTaskProgress(), extractPartialResult(), finalizeAgentTool(), getLastToolUseName(), runAsyncAgentLifecycle(), getAgentPendingMessageAttachments(), getAgentThemeColor() (+259 more)

### Community 12 - "Community 12"
Cohesion: 0.01
Nodes (170): withActivityLogging(), runWithCwdOverride(), TrashDeletionWorkflow, DiffDetailView(), main(), convertBlobUrlToDataUrl(), withStatsCacheLock(), aa (+162 more)

### Community 13 - "Community 13"
Cohesion: 0.01
Nodes (241): analyzeContextUsage(), approximateMessageTokens(), countBuiltInToolTokens(), countCustomAgentTokens(), countMcpToolTokens(), countMemoryFileTokens(), countSkillTokens(), countSlashCommandTokens() (+233 more)

### Community 14 - "Community 14"
Cohesion: 0.01
Nodes (189): filterAppsForDescription(), sanitizeAppNames(), sanitizeCore(), sanitizeTrustedNames(), BridgeToggle(), checkBridgePrerequisites(), getBridgeAccessToken(), getBridgeTokenOverride() (+181 more)

### Community 15 - "Community 15"
Cohesion: 0.01
Nodes (182): deleteAgentFromFile(), ensureAgentDirectoryExists(), formatAgentAsMarkdown(), getActualAgentFilePath(), getAgentDirectoryPath(), getNewAgentFilePath(), saveAgentToFile(), updateAgentFile() (+174 more)

### Community 16 - "Community 16"
Cohesion: 0.01
Nodes (183): getAgentContext(), getSubagentLogName(), isSubagentContext(), suppressNextSkillListing(), Byline(), ChromeMessageReader, ChromeNativeHost, log() (+175 more)

### Community 17 - "Community 17"
Cohesion: 0.02
Nodes (137): generateFileAttachment(), tryGetPDFReference(), countMemoryFileAccessFromEntries(), countUserPromptsFromEntries(), countUserPromptsInMessages(), getTranscriptStats(), isTerminalOutput(), getUserFromApiKey() (+129 more)

### Community 18 - "Community 18"
Cohesion: 0.02
Nodes (95): AbortError, ansiToPng(), blitGlyph(), blitShade(), chunk(), crc32(), decodeFont(), encodePng() (+87 more)

### Community 19 - "Community 19"
Cohesion: 0.03
Nodes (63): Cursor, isVimPunctuation(), isVimWhitespace(), isVimWordChar(), MeasuredText, pushToKillRing(), WrappedLine, consumeEarlyInput() (+55 more)

### Community 20 - "Community 20"
Cohesion: 0.02
Nodes (114): consumeInvokingRequestId(), getOutputTokenUsageAttachment(), refreshAwsAuth(), refreshGcpAuth(), AwsAuthStatusBox(), AwsAuthStatusManager, onSelect(), fanOut() (+106 more)

### Community 21 - "Community 21"
Cohesion: 0.02
Nodes (68): validateUrl(), useChatShellActions(), handler(), formatRelativeDate(), handleActionsClick(), handleActionsKeyDown(), ab(), handleKeyDown() (+60 more)

### Community 22 - "Community 22"
Cohesion: 0.03
Nodes (93): registerBatchSkill(), extractBundledSkillFiles(), getBundledSkillExtractDir(), getBundledSkills(), registerBundledSkill(), resolveSkillFilePath(), safeWriteFile(), writeSkillFiles() (+85 more)

### Community 23 - "Community 23"
Cohesion: 0.03
Nodes (91): buildDeepLinkBanner(), mtimeOrUndefined(), readLastFetchTime(), tildify(), getCachedRepository(), isFileWithinReadSizeLimit(), deriveReviewState(), fetchPrStatus() (+83 more)

### Community 24 - "Community 24"
Cohesion: 0.04
Nodes (102): getAgentMemoryDir(), getAgentMemoryEntrypoint(), loadAgentMemoryPrompt(), sanitizeAgentTypeForPath(), checkAgentMemorySnapshot(), copySnapshotToLocal(), getSnapshotDirForAgent(), getSnapshotJsonPath() (+94 more)

### Community 25 - "Community 25"
Cohesion: 0.04
Nodes (77): backupTerminalPreferences(), checkAndRestoreTerminalBackup(), getTerminalPlistPath(), getTerminalRecoveryInfo(), markTerminalSetupComplete(), markTerminalSetupInProgress(), AskUserQuestionWithHighlight(), addCleanupResults() (+69 more)

### Community 26 - "Community 26"
Cohesion: 0.04
Nodes (39): clearPendingHint(), extractClaudeCodeHints(), firstCommandToken(), hasShownHintThisSession(), setPendingHint(), isClaudeMdExcluded(), resolveExcludePatterns(), stripHtmlComments() (+31 more)

### Community 27 - "Community 27"
Cohesion: 0.16
Nodes (79): advance(), byteAt(), byteLengthUtf8(), checkBudget(), consumeKeyword(), isArithStop(), isBaseDigit(), isDigit() (+71 more)

### Community 28 - "Community 28"
Cohesion: 0.04
Nodes (19): _t(), be(), ce, ct(), de, Ee(), fe(), ge() (+11 more)

### Community 29 - "Community 29"
Cohesion: 0.07
Nodes (11): CCRClient, HybridTransport, handleOrphanedPermissionResponse(), clearIdleTimer(), registerSessionActivityCallback(), sendSessionActivitySignal(), startHeartbeatTimer(), startIdleTimer() (+3 more)

### Community 30 - "Community 30"
Cohesion: 0.09
Nodes (26): looksLikeISO8601(), commitTextField(), handleNavigation(), handleTextInputChange(), handleTextInputSubmit(), setField(), unsetField(), updateValidationError() (+18 more)

### Community 31 - "Community 31"
Cohesion: 0.08
Nodes (23): getFileSummaryLimits(), getFileSummaryModelName(), getFileSummaryOllamaBaseUrl(), toPositiveInteger(), getFileExtension(), getMimeTypeFromFileName(), isTextBasedFile(), isTextMimeType() (+15 more)

### Community 32 - "Community 32"
Cohesion: 0.11
Nodes (28): getModifiers(), isModifierPressed(), isNativeAudioAvailable(), isNativePlaying(), isNativeRecordingActive(), loadModule(), microphoneAuthorizationStatus(), prewarm() (+20 more)

### Community 33 - "Community 33"
Cohesion: 0.11
Nodes (32): count(), countWorktreeChanges(), countModelVisibleMessagesSince(), isModelVisibleMessage(), executeBYOCPersistence(), executeCloudPersistence(), executeFilePersistence(), isFilePersistenceEnabled() (+24 more)

### Community 34 - "Community 34"
Cohesion: 0.07
Nodes (7): _2, createLinkedTransportPair(), InProcessTransport, WebSocketTransport, handleMessageFromStream(), SdkControlClientTransport, SdkControlServerTransport

### Community 35 - "Community 35"
Cohesion: 0.18
Nodes (23): extractMarkupText(), formatCallHierarchyItem(), formatDocumentSymbolNode(), formatDocumentSymbolResult(), formatFindReferencesResult(), formatGoToDefinitionResult(), formatHoverResult(), formatIncomingCallsResult() (+15 more)

### Community 36 - "Community 36"
Cohesion: 0.12
Nodes (4): fromJsonTimestamp(), fromTimestamp(), fromJsonTimestamp(), fromTimestamp()

### Community 37 - "Community 37"
Cohesion: 0.17
Nodes (9): useChatPageData(), useFlatMessages(), useMessagePages(), filterThreads(), normalizeSearchText(), tokenizeQuery(), useFlatThreads(), useThreadPages() (+1 more)

### Community 38 - "Community 38"
Cohesion: 0.21
Nodes (6): GeneralAgent, StorageAgent, buildSupervisorGraph(), createSupervisorNode(), createToolExecutionNode(), createWorkerNode()

### Community 39 - "Community 39"
Cohesion: 0.15
Nodes (6): DeleteFileTool, GetFileInfoTool, ListFilesTool, ReadFileTool, SearchFilesTool, WriteFileTool

### Community 42 - "Community 42"
Cohesion: 0.22
Nodes (6): BoundedUUIDSet, handleIngressMessage(), isSDKControlRequest(), isSDKControlResponse(), isSDKMessage(), normalizeControlMessageKeys()

### Community 43 - "Community 43"
Cohesion: 0.22
Nodes (3): FeedbackSurveyView(), TranscriptSharePrompt(), useDebouncedDigitInput()

### Community 44 - "Community 44"
Cohesion: 0.2
Nodes (5): useFileSelectionUiStore(), RootLayout(), shouldHideDock(), useQuota(), useTinySession()

### Community 45 - "Community 45"
Cohesion: 0.18
Nodes (5): handleCreateThread(), useChatStoreSync(), updateChatUi(), useChatUiStore(), useStreamChatMessage()

### Community 46 - "Community 46"
Cohesion: 0.18
Nodes (3): loggingPostHook(), loggingPreHook(), runPreHooks()

### Community 48 - "Community 48"
Cohesion: 0.22
Nodes (2): MicSelector(), useAudioDevices()

### Community 49 - "Community 49"
Cohesion: 0.36
Nodes (2): coalescePatches(), WorkerStateUploader

### Community 50 - "Community 50"
Cohesion: 0.36
Nodes (7): createStatsStore(), StatsProvider(), useCounter(), useGauge(), useSet(), useStats(), useTimer()

### Community 51 - "Community 51"
Cohesion: 0.28
Nodes (6): formatPastedTextRef(), getPastedTextRefNumLines(), formatTruncatedTextRef(), maybeTruncateInput(), maybeTruncateMessageForInput(), recollapsePastedContent()

### Community 53 - "Community 53"
Cohesion: 0.22
Nodes (4): AddTool, DivideTool, MultiplyTool, SubtractTool

### Community 54 - "Community 54"
Cohesion: 0.29
Nodes (3): fireRawRead(), startMdmRawRead(), refreshMdmSettings()

### Community 56 - "Community 56"
Cohesion: 0.48
Nodes (5): containsHeredoc(), containsMultilineString(), hasStdinRedirect(), quoteShellCommand(), shouldAddStdinRedirect()

### Community 57 - "Community 57"
Cohesion: 0.43
Nodes (4): ConfirmationActions(), ConfirmationRejected(), ConfirmationTitle(), useConfirmation()

### Community 60 - "Community 60"
Cohesion: 0.33
Nodes (3): setInputValue(), useWebPreview(), WebPreviewUrl()

### Community 61 - "Community 61"
Cohesion: 0.29
Nodes (2): FileGrid(), useBoxSelection()

### Community 64 - "Community 64"
Cohesion: 0.33
Nodes (2): isSessionExpired(), loadSessionOrThrow()

### Community 71 - "Community 71"
Cohesion: 0.5
Nodes (3): AnimatedClawd(), hold(), useClawdAnimation()

### Community 72 - "Community 72"
Cohesion: 0.6
Nodes (4): formatUri(), parseUpdates(), _temp(), UserResourceUpdateMessage()

### Community 76 - "Community 76"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 80 - "Community 80"
Cohesion: 0.5
Nodes (1): detectCodeIndexingFromMcpServerName()

### Community 82 - "Community 82"
Cohesion: 0.67
Nodes (2): getAttachmentLabel(), getMediaCategory()

### Community 84 - "Community 84"
Cohesion: 0.67
Nodes (2): TranscriptionSegment(), useTranscription()

### Community 90 - "Community 90"
Cohesion: 0.5
Nodes (2): WebRTCProvider(), useWebRTCConnection()

### Community 92 - "Community 92"
Cohesion: 0.5
Nodes (2): useAuth(), DeviceApprovePage()

### Community 93 - "Community 93"
Cohesion: 0.67
Nodes (2): parseUploadSearchValue(), validateHomeSearch()

### Community 100 - "Community 100"
Cohesion: 1.0
Nodes (2): collapseTeammateShutdowns(), isTeammateShutdownAttachment()

### Community 122 - "Community 122"
Cohesion: 1.0
Nodes (2): generateFileSummaryForItem(), wait()

### Community 240 - "Community 240"
Cohesion: 1.0
Nodes (1): Tagify

## Knowledge Gaps
- **48 isolated node(s):** `DOMException`, `CompileError`, `RuntimeError`, `Global`, `Instance` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 48`** (10 nodes): `MicSelector()`, `MicSelectorContent()`, `MicSelectorEmpty()`, `MicSelectorInput()`, `MicSelectorItem()`, `MicSelectorLabel()`, `MicSelectorList()`, `MicSelectorTrigger()`, `useAudioDevices()`, `mic-selector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (9 nodes): `WorkerStateUploader.ts`, `coalescePatches()`, `WorkerStateUploader`, `.close()`, `.constructor()`, `.drain()`, `.enqueue()`, `.retryDelay()`, `.sendWithRetry()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (7 nodes): `FileGrid()`, `isAppendModifierPressed()`, `file-grid.tsx`, `use-box-selection.ts`, `getRect()`, `intersects()`, `useBoxSelection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (7 nodes): `webrtc-server.ts`, `isSessionExpired()`, `isSignalRecordValid()`, `loadSessionOrThrow()`, `parseWebrtcPermission()`, `readSignalQueue()`, `resolveSignalKey()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (4 nodes): `codeIndexing.ts`, `detectCodeIndexingFromCommand()`, `detectCodeIndexingFromMcpServerName()`, `detectCodeIndexingFromMcpTool()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (4 nodes): `cn()`, `getAttachmentLabel()`, `getMediaCategory()`, `attachments.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (4 nodes): `transcription.tsx`, `Transcription()`, `TranscriptionSegment()`, `useTranscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 90`** (4 nodes): `WebRTCProvider()`, `provider.tsx`, `useWebRTCConnection.ts`, `useWebRTCConnection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 92`** (4 nodes): `useAuth()`, `DeviceApprovePage()`, `auth-client.ts`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 93`** (4 nodes): `loadGetHomeSnapshotFn()`, `parseUploadSearchValue()`, `validateHomeSearch()`, `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 100`** (3 nodes): `collapseTeammateShutdowns.ts`, `collapseTeammateShutdowns()`, `isTeammateShutdownAttachment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 122`** (3 nodes): `generateFileSummaryForItem()`, `wait()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 240`** (2 nodes): `tagify.d.ts`, `Tagify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logForDebugging()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 18`, `Community 20`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 26`, `Community 29`, `Community 32`, `Community 33`, `Community 35`, `Community 42`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 28`, `Community 29`, `Community 35`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 22`, `Community 23`, `Community 32`, `Community 38`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Are the 792 inferred relationships involving `logForDebugging()` (e.g. with `getSkills()` and `immediateFlushHistory()`) actually correct?**
  _`logForDebugging()` has 792 INFERRED edges - model-reasoned connections that need verification._
- **Are the 343 inferred relationships involving `logError()` (e.g. with `getSkills()` and `loadSettingsFromFlag()`) actually correct?**
  _`logError()` has 343 INFERRED edges - model-reasoned connections that need verification._
- **Are the 336 inferred relationships involving `logEvent()` (e.g. with `addToTotalSessionCost()` and `getRenderContext()`) actually correct?**
  _`logEvent()` has 336 INFERRED edges - model-reasoned connections that need verification._
- **Are the 321 inferred relationships involving `GET()` (e.g. with `runBridgeLoop()` and `resolveOne()`) actually correct?**
  _`GET()` has 321 INFERRED edges - model-reasoned connections that need verification._